"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import mammoth from "mammoth";

export default function AnalyzeResume() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<{
    score?: number;
    feedback?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🧩 Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
    setResult(null);
    setError(null);
  };

  // 📄 Extract text from uploaded file (.pdf or .docx)
  const extractTextFromFile = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();

    if (file.name.toLowerCase().endsWith(".pdf")) {
      const pdfModule = await import("pdf-parse");
      const pdfParse: (dataBuffer: Buffer) => Promise<{ text: string }> =
        pdfModule.default ??
        (pdfModule as unknown as (
          dataBuffer: Buffer
        ) => Promise<{ text: string }>);
      const pdfData = await pdfParse(Buffer.from(arrayBuffer));
      return pdfData.text;
    }

    if (file.name.toLowerCase().endsWith(".docx")) {
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    }

    throw new Error(
      "Unsupported file type. Please upload a .pdf or .docx file."
    );
  };

  // 🧠 Analyze resume text
  const analyzeResumeText = (text: string) => {
    const wordCount = text.split(/\s+/).length;
    const hasSkills = /skills?/i.test(text);
    const hasExperience = /experience/i.test(text);
    const hasEducation = /education/i.test(text);
    const hasProjects = /project/i.test(text);

    let score = 50;
    const tips: string[] = [];

    if (hasSkills) score += 10;
    else tips.push("Add a dedicated 'Skills' section.");

    if (hasExperience) score += 15;
    else tips.push("Include detailed work experiences.");

    if (hasEducation) score += 10;
    else tips.push("Add your educational background.");

    if (hasProjects) score += 10;
    else tips.push("Showcase relevant projects with outcomes.");

    if (wordCount < 200)
      tips.push("Your resume seems too short. Add more content.");
    if (wordCount > 1500)
      tips.push("Your resume may be too long. Try condensing it.");

    const feedback =
      `✅ **Overall Score:** ${score}/100\n\n` +
      `💡 **Suggestions for Improvement:**\n` +
      (tips.length > 0
        ? tips.map((t) => `- ${t}`).join("\n")
        : "Looks great! Your resume is well-balanced.");

    return { score, feedback };
  };

  // 🚀 Handle full analysis and upload
  const handleAnalyze = async () => {
    if (!file) {
      setError("Please upload your resume file first.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1️⃣ Extract text for analysis
      const text = await extractTextFromFile(file);
      const analysis = analyzeResumeText(text);

      // 2️⃣ Get user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("You must be logged in to analyze your resume.");
        setLoading(false);
        return;
      }

      // 3️⃣ Upload file to Supabase Storage
      const filePath = `${user.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("resumes")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 4️⃣ Get the public URL
      const { data: publicURLData } = supabase.storage
        .from("resumes")
        .getPublicUrl(filePath);

      const fileUrl = publicURLData?.publicUrl ?? "";

      // 5️⃣ Save analysis + file link to database
      await supabase.from("resume_analysis").insert([
        {
          user_id: user.id,
          resume_text: text.slice(0, 10000),
          score: analysis.score,
          feedback: analysis.feedback,
          file_url: fileUrl,
        },
      ]);

      setResult(analysis);
    } catch (err: unknown) {
      console.error(err);
      setError(
        "Failed to analyze and upload the resume. Please ensure the file is valid."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">AI Resume Analyzer</h1>

      <div className="flex flex-col gap-4">
        <label htmlFor="resume-upload" className="font-medium">
          Upload your resume (.pdf or .docx):
        </label>
        <input
          id="resume-upload"
          type="file"
          accept=".pdf,.docx"
          onChange={handleFileUpload}
          className="border rounded p-3"
          title="Upload your resume file"
          placeholder="Choose a resume file"
        />

        <button
          onClick={handleAnalyze}
          disabled={loading || !file}
          className="bg-black text-white py-2 px-6 rounded hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? "Analyzing..." : "Analyze Resume"}
        </button>

        {error && <p className="text-red-600">{error}</p>}

        {result && (
          <div className="mt-6 bg-gray-100 p-4 rounded whitespace-pre-line">
            <h2 className="text-lg font-semibold">Score: {result.score}/100</h2>
            <p className="mt-2 text-gray-700">{result.feedback}</p>
            <p className="mt-2 text-blue-600 underline">
              Your resume file has been saved and can be viewed in your
              dashboard.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
