import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function GET() {
  try {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    
    if (!GEMINI_API_KEY) {
      return NextResponse.json({ status: "unhealthy", error: "Missing API Key" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const result = await model.generateContent("ping");

    return NextResponse.json({ 
      status: "healthy",
      api_key_configured: true,
      model_access: !!result.response.text()
    });

  } catch (error: any) {
    return NextResponse.json({ 
      status: "unhealthy", 
      error: error.message 
    }, { status: 500 });
  }
}
