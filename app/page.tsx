import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center h-screen text-center px-4">
      <h1 className="text-4xl font-bold mb-3">Welcome to Mentra</h1>
      <p className="text-gray-600 mb-6">
        Your AI-powered career coach for resume analysis and interview prep.
      </p>
      <div className="space-x-3">
        <Link href="/resume-analyzer">
          <Button>Analyze My Resume</Button>
        </Link>
        <Link href="/interview-coach">
          <Button variant="outline">Start Mock Interview</Button>
        </Link>
      </div>
    </main>
  );
}
