"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AnalyzeResume() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<{
    score?: number;
    feedback?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: user?.id, resume_text: text }),
    });

    const data = await res.json();
    setResult(data);
    setLoading(false);
  };

  return (
    <div className="p-10 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">AI Resume Analyzer</h1>

      <textarea
        className="w-full border rounded p-3 min-h-[200px]"
        placeholder="Paste your resume text here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <button
        onClick={handleAnalyze}
        disabled={loading || !text}
        className="mt-4 bg-black text-white py-2 px-6 rounded hover:bg-gray-800"
      >
        {loading ? "Analyzing..." : "Analyze Resume"}
      </button>

      {result && (
        <div className="mt-6 bg-gray-100 p-4 rounded">
          <h2 className="text-lg font-semibold">Score: {result.score}/100</h2>
          <p className="mt-2 whitespace-pre-line">{result.feedback}</p>
        </div>
      )}
    </div>
  );
}
