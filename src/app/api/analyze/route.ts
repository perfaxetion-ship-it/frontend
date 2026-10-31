import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://wjd2z94oda.apps.bot-hosting.cloud";

const API_KEY =
  process.env.BACKEND_API_KEY ||
  process.env.NEXT_PUBLIC_API_KEY ||
  "astro-secret-change-me";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const response = await fetch(`${BACKEND_URL}/api/v1/analysis`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": API_KEY,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    return NextResponse.json(
      { detail: error.message || "Backend sunucusuna erişilemedi." },
      { status: 502 }
    );
  }
}

