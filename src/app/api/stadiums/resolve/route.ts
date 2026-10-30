import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://wjd2z94oda.apps.bot-hosting.cloud";

const API_KEY =
  process.env.BACKEND_API_KEY ||
  process.env.NEXT_PUBLIC_API_KEY ||
  "astro-secret-change-me";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const team = searchParams.get("team") || "";

  if (!team) {
    return NextResponse.json({ detail: "Takım adı gereklidir." }, { status: 400 });
  }

  try {
    const response = await fetch(
      `${BACKEND_URL}/api/v1/stadiums/resolve?team=${encodeURIComponent(team)}&online=true`,
      {
        headers: { "X-API-Key": API_KEY },
      }
    );
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    return NextResponse.json(
      { detail: error.message || "Stadyum çözümlenemedi." },
      { status: 502 }
    );
  }
}
