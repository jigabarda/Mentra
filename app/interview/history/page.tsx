"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

interface InterviewSession {
  id: number;
  user_email: string;
  job_description: string;
  question: string;
  answer: string | null;
  feedback: string | null;
  created_at: string;
}

// ✅ Initialize Supabase outside the component so it's stable across renders
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function InterviewHistoryPage() {
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      const { data, error } = await supabase
        .from("interview_sessions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching sessions:", error);
      } else {
        setSessions(data || []);
      }
      setLoading(false);
    };

    fetchSessions();
  }, []); // ✅ no missing dependencies now

  if (loading)
    return <p className="text-center mt-10">Loading interview history...</p>;

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Interview History
      </h1>

      {sessions.length === 0 ? (
        <p className="text-gray-600 text-center">
          No past interview sessions found.
        </p>
      ) : (
        <ul className="space-y-4">
          {sessions.map((session) => (
            <li
              key={session.id}
              className="p-5 border rounded-lg shadow-sm bg-white hover:shadow-md transition"
            >
              <p className="text-sm text-gray-500 mb-2">
                {new Date(session.created_at).toLocaleString()}
              </p>

              <p className="font-semibold text-gray-800 mb-2">
                Job Description:
              </p>
              <p className="text-gray-700 mb-4">{session.job_description}</p>

              <p className="font-semibold text-gray-800 mb-2">AI Question:</p>
              <p className="text-gray-700 mb-4">{session.question}</p>

              {session.answer && (
                <>
                  <p className="font-semibold text-gray-800 mb-2">
                    Your Answer:
                  </p>
                  <p className="text-gray-700 mb-4">{session.answer}</p>
                </>
              )}

              {session.feedback && (
                <>
                  <p className="font-semibold text-gray-800 mb-2">
                    AI Feedback:
                  </p>
                  <p className="text-gray-700">{session.feedback}</p>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
