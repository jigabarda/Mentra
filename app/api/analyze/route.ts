import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  console.log("📥 [API] /api/analyze — Request received");

  try {
    // Parse the incoming request
    const { resumeText, userEmail } = await req.json();
    console.log("🧩 Parsed body:", { hasText: !!resumeText, userEmail });

    if (!resumeText || !userEmail) {
      console.error("❌ Missing resumeText or userEmail");
      return NextResponse.json(
        { error: "Missing resume text or user email." },
        { status: 400 }
      );
    }

    // Check environment variables
    if (!process.env.OPENAI_API_KEY) {
      console.error("❌ Missing OPENAI_API_KEY");
      return NextResponse.json(
        { error: "Server misconfiguration — missing API key." },
        { status: 500 }
      );
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    console.log("🧠 Sending text to OpenAI...");
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an expert career advisor. Analyze the resume and give improvement feedback.",
        },
        { role: "user", content: resumeText },
      ],
      temperature: 0.7,
    });

    const feedback =
      completion.choices?.[0]?.message?.content ?? "No feedback returned.";
    console.log("✅ OpenAI feedback received:", feedback.slice(0, 120));

    console.log("💾 Saving to Supabase...");
    const { error: dbError } = await supabase.from("resume_analysis").insert([
      {
        email: userEmail,
        resume_text: resumeText.slice(0, 10000),
        feedback,
      },
    ]);

    if (dbError) {
      console.error("❌ Supabase insert error:", dbError);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    console.log("✅ Resume saved successfully.");
    return NextResponse.json({ success: true, feedback });
  } catch (err) {
    console.error("🔥 Internal error in /api/analyze:", err);
    return NextResponse.json(
      { error: "Internal server error. Check server logs for details." },
      { status: 500 }
    );
  }
}
