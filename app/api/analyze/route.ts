import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import mammoth from "mammoth";
import { Buffer } from "buffer";
import { getDocument, GlobalWorkerOptions, PDFDocumentProxy } from "pdfjs-dist";
import type { TextItem as PDFTextItem } from "pdfjs-dist/types/src/display/api";
import { createWorker, PSM, Worker } from "tesseract.js";
import path from "path";
import { fileURLToPath } from "url";

export const runtime = "nodejs";

// --- Node.js __dirname replacement
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- PDF.js worker path
GlobalWorkerOptions.workerSrc = path.join(
  __dirname,
  "../../node_modules/pdfjs-dist/build/pdf.worker.js"
);

// --- Types
interface AnalysisResult {
  success: boolean;
  feedback?: string;
  error?: string;
}

// --- Type guard for PDFTextItem
function isTextItem(item: unknown): item is PDFTextItem {
  return typeof item === "object" && item !== null && "str" in item;
}

// --- Extract text from PDF
async function extractTextFromPdf(buffer: ArrayBuffer): Promise<string> {
  const loadingTask = getDocument({ data: buffer });
  const pdf: PDFDocumentProxy = await loadingTask.promise;

  let text = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const textItems: PDFTextItem[] = content.items.filter(isTextItem);
    text += textItems.map((item) => item.str).join(" ") + "\n";
  }

  return text.trim().length > 50 ? text.trim() : extractTextWithOcr(buffer);
}

// --- OCR fallback using Tesseract.js
async function extractTextWithOcr(buffer: ArrayBuffer): Promise<string> {
  const worker: Worker = await createWorker();
  await worker.load();
  await worker.loadLanguage("eng");
  await worker.initialize("eng");
  await worker.setParameters({ tessedit_pageseg_mode: PSM.AUTO });

  const { data } = await worker.recognize(Buffer.from(buffer));
  await worker.terminate();

  return data.text.trim();
}

// --- Extract text from DOCX
async function extractTextFromDocx(buffer: ArrayBuffer): Promise<string> {
  const result = await mammoth.extractRawText({ arrayBuffer: buffer });
  return result.value ?? "";
}

// --- Initialize Supabase
function initSupabase(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) throw new Error("Supabase environment variables not set");
  return createClient(url, key);
}

// --- Main API Route
export async function POST(
  req: Request
): Promise<NextResponse<AnalysisResult>> {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const userEmail = formData.get("userEmail");

    if (!(file instanceof File) || typeof userEmail !== "string") {
      return NextResponse.json(
        { success: false, error: "Invalid file or email." },
        { status: 400 }
      );
    }

    const name = file.name.toLowerCase();
    const buffer = await file.arrayBuffer();
    let text: string;

    if (name.endsWith(".pdf")) text = await extractTextFromPdf(buffer);
    else if (name.endsWith(".docx")) text = await extractTextFromDocx(buffer);
    else
      return NextResponse.json(
        { success: false, error: "Only .pdf or .docx supported." },
        { status: 400 }
      );

    if (!text.trim())
      return NextResponse.json(
        { success: false, error: "No readable text found." },
        { status: 400 }
      );

    if (!process.env.OPENAI_API_KEY) throw new Error("OpenAI API key not set");

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const supabase = initSupabase();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an expert career coach. Analyze the following resume and provide a score (0–100) and feedback.",
        },
        { role: "user", content: text.slice(0, 6000) },
      ],
      temperature: 0.7,
    });

    const feedback: string =
      completion.choices[0]?.message?.content ?? "No feedback generated.";

    const { error: dbError } = await supabase
      .from("resume_analysis")
      .insert([
        { user_email: userEmail, resume_text: text.slice(0, 10000), feedback },
      ]);

    if (dbError)
      return NextResponse.json(
        { success: false, error: dbError.message },
        { status: 500 }
      );

    return NextResponse.json({ success: true, feedback });
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
