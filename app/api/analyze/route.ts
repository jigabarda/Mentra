import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// ✅ Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ✅ Handle POST request for resume analysis
export async function POST(req: Request) {
  try {
    const { resumeText, userEmail } = await req.json();

    if (!resumeText || !userEmail) {
      return NextResponse.json(
        { error: "Missing resume text or user email." },
        { status: 400 }
      );
    }

    // ✨ Step 1: Analyze the resume using OpenAI
    const analysis = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an expert career advisor and resume reviewer. Provide concise, actionable feedback about resume structure, clarity, and relevance to job applications.",
        },
        { role: "user", content: resumeText },
      ],
      temperature: 0.7,
    });

    const feedback = analysis.choices[0].message.content;

    // ✨ Step 2: Store the result in Supabase
    const { error } = await supabase.from("users").insert({
      email: userEmail,
      resume_text: resumeText,
      feedback: feedback,
    });

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { error: "Failed to save resume analysis to database." },
        { status: 500 }
      );
    }

    // ✨ Step 3: Return the AI feedback
    return NextResponse.json({
      success: true,
      message: "Resume analyzed successfully!",
      feedback,
    });
  } catch (error) {
    console.error("Error in analyze route:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
