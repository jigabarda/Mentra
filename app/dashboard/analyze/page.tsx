"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface AnalysisResult {
  score?: number;
  feedback?: string;
  fileUrl?: string;
}

export default function AnalyzeResume() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 📁 Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
    setResult(null);
    setErrorMsg(null);
  };

  // 🚀 Handle full upload and analysis
  const handleAnalyze = async () => {
    if (!file) {
      setErrorMsg("Please upload your resume file first.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      // 1️⃣ Get user info from Supabase
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.email) {
        setErrorMsg("You must be logged in to analyze your resume.");
        setLoading(false);
        return;
      }

      // 2️⃣ Prepare form data
      const formData = new FormData();
      formData.append("file", file);
      formData.append("userEmail", user.email);

      // 3️⃣ Call API route
      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Analysis failed.");

      // 4️⃣ Display result
      setResult({
        score: data.score,
        feedback: data.feedback,
        fileUrl: data.fileUrl,
      });
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg(
        "Failed to analyze the resume. Please check your connection or file format."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">
        AI Resume Analyzer
      </h1>

      <div className="flex flex-col gap-4">
        <label htmlFor="resume-upload" className="font-medium">
          Upload your resume (.pdf or .docx):
        </label>

        <input
          id="resume-upload"
          type="file"
          accept=".pdf,.docx"
          onChange={handleFileUpload}
          className="w-full p-3 border rounded-md mb-4 font-sans"
        />

        <button
          onClick={handleAnalyze}
          disabled={loading || !file}
          className="bg-black text-white py-2 px-6 rounded hover:bg-gray-800 disabled:opacity-50 transition-all"
        >
          {loading ? "Analyzing..." : "Analyze Resume"}
        </button>

        {/* 🔄 Loading Indicator */}
        {loading && (
          <div className="flex flex-col items-center justify-center mt-8 space-y-4">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600 font-medium">
              Thinking like a career coach...
            </p>
          </div>
        )}

        {/* ❌ Error Message */}
        {errorMsg && (
          <p className="text-red-600 mt-4 bg-red-50 p-3 rounded-md border border-red-200">
            {errorMsg}
          </p>
        )}

        {/* ✅ Analysis Result */}
        {result && !loading && (
          <div className="mt-6 bg-gray-50 p-6 rounded-xl shadow-sm border border-gray-200 whitespace-pre-line">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              ✅ Resume Analysis Result
            </h2>
            <p className="text-lg font-medium text-blue-700">
              Score: {result.score}/100
            </p>
            <p className="mt-3 text-gray-700 leading-relaxed">
              {result.feedback}
            </p>

            {result.fileUrl && (
              <p className="mt-4">
                📎{" "}
                <a
                  href={result.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  View uploaded resume
                </a>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
