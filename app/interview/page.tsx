"use client";

import { useState } from "react";

type Message =
  | { type: "question"; question: string }
  | { type: "feedback"; feedback: string };

export default function InterviewPage() {
  const [jobDescription, setJobDescription] = useState("");
  const [userAnswer, setUserAnswer] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const userEmail = "demo@example.com"; // Replace with authenticated email later

  const sendMessage = async () => {
    setLoading(true);

    const res = await fetch("/api/interview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobDescription, userEmail, userAnswer }),
    });

    const data = await res.json();
    setMessages((prev) => [...prev, data]);
    setUserAnswer("");
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-semibold mb-6">💬 AI Interview Coach</h1>

      {!messages.length && (
        <textarea
          className="w-full p-3 border rounded-md mb-4"
          placeholder="Paste job description here..."
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
        />
      )}

      <div className="space-y-3 mb-6">
        {messages.map((msg, i) => (
          <div key={i} className="p-3 border rounded-md bg-gray-50">
            {msg.type === "question" && (
              <p>
                <strong>AI:</strong> {msg.question}
              </p>
            )}
            {msg.type === "feedback" && (
              <p>
                <strong>AI Feedback:</strong> {msg.feedback}
              </p>
            )}
          </div>
        ))}
      </div>

      {messages.length > 0 && (
        <textarea
          className="w-full p-3 border rounded-md mb-4"
          placeholder="Type your answer..."
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
        />
      )}

      <button
        onClick={sendMessage}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        {loading
          ? "Processing..."
          : messages.length === 0
          ? "Generate Question"
          : "Send Answer"}
      </button>
    </div>
  );
}
