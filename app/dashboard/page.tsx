"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface ResumeData {
  score: number;
  feedback: string;
  created_at: string;
}

interface InterviewData {
  question: string;
  feedback: string;
  created_at: string;
}

export default function DashboardPage() {
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [interview, setInterview] = useState<InterviewData | null>(null);
  const [stats, setStats] = useState({
    avgScore: 0,
    totalInterviews: 0,
    totalResumes: 0,
  });
  const [resumeTrends, setResumeTrends] = useState<ResumeData[]>([]);
  const [interviewTrends, setInterviewTrends] = useState<InterviewData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch latest resume analysis
        const { data: resumeData } = await supabase
          .from("resume_analysis")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        // Fetch latest interview session
        const { data: interviewData } = await supabase
          .from("interview_sessions")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        // Fetch analytics summary
        const { count: totalResumes } = await supabase
          .from("resume_analysis")
          .select("*", { count: "exact", head: true });

        const { count: totalInterviews } = await supabase
          .from("interview_sessions")
          .select("*", { count: "exact", head: true });

        const { data: avgScoreData } = await supabase
          .from("resume_analysis")
          .select("score");

        const avgScore =
          avgScoreData && avgScoreData.length > 0
            ? avgScoreData.reduce((sum, s) => sum + (s.score ?? 0), 0) /
              avgScoreData.length
            : 0;

        // Fetch trend data
        const { data: resumeTrendData } = await supabase
          .from("resume_analysis")
          .select("score, feedback, created_at")
          .order("created_at", { ascending: true });

        const { data: interviewTrendData } = await supabase
          .from("interview_sessions")
          .select("question, feedback, created_at")
          .order("created_at", { ascending: true });

        setResume(resumeData);
        setInterview(interviewData);
        setResumeTrends(
          resumeTrendData?.map((r) => ({
            score: r.score ?? 0,
            feedback: r.feedback ?? "No feedback",
            created_at: r.created_at,
          })) || []
        );
        setInterviewTrends(
          interviewTrendData?.map((i) => ({
            question: i.question ?? "No question",
            feedback: i.feedback ?? "No feedback",
            created_at: i.created_at,
          })) || []
        );

        setStats({
          avgScore: Math.round(avgScore),
          totalInterviews: totalInterviews || 0,
          totalResumes: totalResumes || 0,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading)
    return (
      <p className="text-center mt-10 text-gray-600">Loading dashboard...</p>
    );

  return (
    <div className="max-w-6xl mx-auto mt-10 px-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">
        Career Dashboard
      </h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white shadow rounded-xl p-6 text-center">
          <p className="text-gray-500 mb-2">Average Resume Score</p>
          <h2 className="text-4xl font-bold text-blue-600">
            {stats.avgScore || 0}%
          </h2>
        </div>
        <div className="bg-white shadow rounded-xl p-6 text-center">
          <p className="text-gray-500 mb-2">Total Resumes</p>
          <h2 className="text-4xl font-bold text-green-600">
            {stats.totalResumes}
          </h2>
        </div>
        <div className="bg-white shadow rounded-xl p-6 text-center">
          <p className="text-gray-500 mb-2">Total Interviews</p>
          <h2 className="text-4xl font-bold text-purple-600">
            {stats.totalInterviews}
          </h2>
        </div>
      </div>

      {/* Resume Score Trend Chart */}
      {resumeTrends.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow mb-10">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Resume Score Trend
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={resumeTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="created_at"
                tickFormatter={(date) =>
                  new Date(date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                }
              />
              <YAxis domain={[0, 100]} />
              <Tooltip
                labelFormatter={(date) => new Date(date).toLocaleString()}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Interview Frequency Chart */}
      {interviewTrends.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Interview Sessions Over Time
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={interviewTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="created_at"
                tickFormatter={(date) =>
                  new Date(date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                }
              />
              <YAxis />
              <Tooltip
                labelFormatter={(date) => new Date(date).toLocaleString()}
              />
              <Bar dataKey="question" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent Resume Feedback */}
      {resume && (
        <div className="bg-white p-6 rounded-xl shadow mb-8">
          <h2 className="text-xl font-semibold mb-2 text-gray-800">
            Latest Resume Analysis
          </h2>
          <p className="text-gray-600 mb-1">
            <strong>Score:</strong> {resume.score}%
          </p>
          <p className="text-gray-700 mb-2">
            <strong>Feedback:</strong> {resume.feedback}
          </p>
          <p className="text-sm text-gray-500">
            Analyzed on: {new Date(resume.created_at).toLocaleString()}
          </p>
        </div>
      )}

      {/* Recent Interview Feedback */}
      {interview && (
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-2 text-gray-800">
            Latest Interview Feedback
          </h2>
          <p className="text-gray-700 mb-2">
            <strong>Question:</strong> {interview.question}
          </p>
          <p className="text-gray-700 mb-2">
            <strong>Feedback:</strong> {interview.feedback}
          </p>
          <p className="text-sm text-gray-500">
            Completed on: {new Date(interview.created_at).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}
