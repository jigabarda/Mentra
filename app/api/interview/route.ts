import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const { jobDescription, userEmail, userAnswer } = await req.json();

    // 🧠 Generate a question if user hasn't answered yet
    if (!userAnswer) {
      const questionPrompt = `
        You are a professional technical interviewer.
        Based on the following job description, generate one relevant interview question.
        
        Job Description:
        ${jobDescription}
      `;

      const questionRes = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: questionPrompt }],
        temperature: 0.7,
      });

      const question = questionRes.choices[0].message.content;

      // Save question in DB
      await supabase.from("interview_sessions").insert({
        user_email: userEmail,
        job_description: jobDescription,
        question,
      });

      return NextResponse.json({ type: "question", question });
    }

    // 💬 Evaluate the user's answer
    const feedbackPrompt = `
      You are an interview coach. Evaluate the following answer for the question below.
      Provide a short constructive feedback and score (1-10).
      
      Question: ${jobDescription}
      Answer: ${userAnswer}
    `;

    const feedbackRes = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: feedbackPrompt }],
      temperature: 0.7,
    });

    const feedback = feedbackRes.choices[0].message.content;

    // Store feedback
    await supabase
      .from("interview_sessions")
      .update({ answer: userAnswer, feedback })
      .eq("user_email", userEmail)
      .order("created_at", { ascending: false })
      .limit(1);

    return NextResponse.json({ type: "feedback", feedback });
  } catch (error) {
    console.error("Interview API error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
