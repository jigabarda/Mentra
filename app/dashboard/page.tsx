"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

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
  const [insights, setInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      // Fetch all resume analyses for trend calculation
      const { data: resumeData } = await supabase
        .from("resume_analysis")
        .select("*")
        .order("created_at", { ascending: true });

      // Fetch all interview sessions
      const { data: interviewData } = await supabase
        .from("interview_sessions")
        .select("*")
        .order("created_at", { ascending: true });

      if (!resumeData || !interviewData) {
        setLoading(false);
        return;
      }

      // Latest records
      const latestResume = resumeData[resumeData.length - 1] || null;
      const latestInterview = interviewData[interviewData.length - 1] || null;

      // Analytics
      const avgScore =
        resumeData.reduce((sum, r) => sum + (r.score ?? 0), 0) /
        (resumeData.length || 1);

      const totalResumes = resumeData.length;
      const totalInterviews = interviewData.length;

      // Smart trend analysis
      const insightsGenerated: string[] = [];

      // Compare scores (month-over-month)
      if (resumeData.length >= 2) {
        const prev = resumeData[resumeData.length - 2].score;
        const curr = latestResume.score;
        const diff = curr - prev;
        if (diff > 0) {
          insightsGenerated.push(
            `Your average resume score improved by ${diff.toFixed(
              1
            )}% compared to the previous analysis. Great progress!`
          );
        } else if (diff < 0) {
          insightsGenerated.push(
            `Your latest resume score dropped by ${Math.abs(diff).toFixed(
              1
            )}%. Review your recent changes to strengthen it again.`
          );
        } else {
          insightsGenerated.push(
            `Your resume performance remains consistent. Keep refining details for better results.`
          );
        }
      }

      // Interview activity trend
      if (interviewData.length >= 2) {
        const recentTwo = interviewData.slice(-2);
        const prevDate = new Date(recentTwo[0].created_at);
        const currDate = new Date(recentTwo[1].created_at);
        const diffDays =
          (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
        insightsGenerated.push(
          `Your interview practice interval is about ${Math.round(
            diffDays
          )} days apart. Keeping a steady rhythm is key for confidence.`
        );
      }

      // Resume & Interview correlation
      if (resumeData.length > 3 && interviewData.length > 3) {
        const resumeImprovement =
          resumeData[resumeData.length - 1].score - resumeData[0].score;
        if (resumeImprovement > 5) {
          insightsGenerated.push(
            `Your resume score improved by ${resumeImprovement.toFixed(
              1
            )}% overall — a sign of steady career development!`
          );
        }
      }

      // General summary
      if (totalResumes > 0 && totalInterviews > 0) {
        insightsGenerated.push(
          `You've analyzed ${totalResumes} resumes and completed ${totalInterviews} interviews — consistency is building your professional growth!`
        );
      }

      setResume(latestResume);
      setInterview(latestInterview);
      setStats({
        avgScore: Math.round(avgScore),
        totalInterviews,
        totalResumes,
      });
      setInsights(insightsGenerated);
      setLoading(false);
    };

    fetchDashboardData();
  }, []);

  if (loading)
    return (
      <p className="text-center mt-10 text-gray-600">Loading dashboard...</p>
    );

  return (
    <div className="max-w-5xl mx-auto mt-10">
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

      {/* Insights Section */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl shadow mb-8">
        <h2 className="text-xl font-semibold mb-3 text-gray-800">
          Career Insights
        </h2>
        {insights.length > 0 ? (
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            {insights.map((tip, i) => (
              <li key={i}>{tip}</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">
            No insights available yet. Try adding more analyses and interviews.
          </p>
        )}
      </div>

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
