import { AnalysisResponse, Stadium } from "@/types";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://wjd2z94oda.apps.bot-hosting.cloud";

export async function checkBackendHealth(): Promise<{ ok: boolean; stadiums: number }> {
  try {
    const res = await fetch(`${API_BASE_URL}/health`, { cache: "no-store" });
    if (!res.ok) return { ok: false, stadiums: 0 };
    const data = await res.json();
    return { ok: data.status === "ok", stadiums: data.stadiums || 0 };
  } catch {
    return { ok: false, stadiums: 0 };
  }
}

export async function runAnalysis(params: {
  home_team: string;
  away_team: string;
  match_date: string;
  match_time: string;
  stadium_name?: string;
  house_system?: string;
  send_telegram?: boolean;
}): Promise<AnalysisResponse> {
  const res = await fetch(`${API_BASE_URL}/api/v1/analysis`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": process.env.NEXT_PUBLIC_API_KEY || "astro-secret-change-me",
    },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({ detail: "Analiz sırasında hata oluştu." }));
    throw new Error(errData.detail || "Sunucu hatası.");
  }

  return res.json();
}

export async function getRecentAnalyses(): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/analysis?limit=10`, {
      headers: {
        "X-API-Key": process.env.NEXT_PUBLIC_API_KEY || "astro-secret-change-me",
      },
      cache: "no-store",
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}
