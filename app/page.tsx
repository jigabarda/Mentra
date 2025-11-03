import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <main className="relative flex flex-col items-center justify-center h-screen text-center px-4 overflow-hidden">
      {/* 🌌 Animated Background */}
      <div className="absolute inset-0 animate-gradient bg-gradient-to-r from-[#0a0f24] via-[#0d1b3d] to-black bg-[length:400%_400%] motion-safe:animate-gradient-slow"></div>

      {/* Optional overlay for readability */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* 🌟 Content Layer */}
      <div className="relative z-10 mt-7 rounded-2xl shadow-2xl border-white/10 bg-white/10 flex flex-col md:flex-row items-center justify-center w-full max-w-5xl mx-auto">
        {/* Left: Text */}
        <div className="flex-1 lg:pl-20 text-left md:pr-10 py-10 md:py-16">
          <h1 className="text-5xl font-bold mb-4 text-white drop-shadow-lg font-sans">
            Welcome to Men<span className="text-blue-800">tra</span>
          </h1>
          <p className="text-gray-300 mb-8 max-w-md leading-relaxed font-sans">
            Your AI-powered career coach for resume analysis and interview prep.
            Powered by advanced natural language processing and machine learning
            to help you build smarter resumes and ace interviews confidently.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 space-x-0 sm:space-x-3 w-full sm:w-auto mt-7">
            <Link href="/dashboard/analyze" className="w-full sm:w-auto">
              <Button
                variant="outline"
                className="bg-blue-800 hover:bg-white border-blue-800 hover:text-black hover:duration-500 hover:cursor-pointer text-white shadow-lg w-full sm:w-auto font-sans"
              >
                Analyze My Resume
              </Button>
            </Link>
            <Link href="/interview" className="w-full sm:w-auto">
              <Button
                variant="outline"
                className="border-white text-black hover:bg-blue-800 hover:text-white hover:duration-500 hover:cursor-pointer w-full sm:w-auto font-sans"
              >
                Start Mock Interview
              </Button>
            </Link>
          </div>
          {/* Tagline below buttons */}
          <p className="mt-7 text-base text-white font-medium font-sans transition duration-300">
            Start improving your career profile with AI-powered insights today.
          </p>
        </div>
        {/* Right: Image */}
        <div className="flex-1 flex justify-center items-center mt-10 md:mt-2">
          <div className="relative flex items-center justify-center">
            <div className="absolute w-80 h-80 rounded-full bg-blue-900/40 blur-2xl z-0" />
            <Image
              src="/img/model2.png"
              alt="Mentra AI Coach"
              width={320}
              height={320}
              className="w-80 h-auto relative z-10"
              priority
            />
          </div>
        </div>
      </div>
    </main>
  );
}
