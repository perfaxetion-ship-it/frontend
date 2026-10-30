export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://wjd2z94oda.apps.bot-hosting.cloud";

export const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "astro-secret-change-me";

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

export async function resolveStadium(team: string): Promise<any | null> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/api/v1/stadiums/resolve?team=${encodeURIComponent(team)}&online=true`,
      {
        headers: { "X-API-Key": API_KEY },
      }
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function searchStadiums(query: string): Promise<any[]> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/api/v1/stadiums/search?q=${encodeURIComponent(query)}&limit=15`,
      {
        headers: { "X-API-Key": API_KEY },
      }
    );
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function runAnalysis(params: {
  home_team: string;
  away_team: string;
  match_date: string;
  match_time: string;
  stadium_name?: string;
  city?: string;
  lat?: number;
  lon?: number;
  house_system?: string;
  send_telegram?: boolean;
}): Promise<any> {
  const payload: any = {
    home_team: params.home_team,
    away_team: params.away_team,
    date: params.match_date,
    time: params.match_time,
    stadium: params.stadium_name,
    city: params.city,
    house_system: params.house_system || "Regiomontanus",
    send_telegram: !!params.send_telegram,
    allow_online_lookup: true,
  };

  if (typeof params.lat === "number" && typeof params.lon === "number") {
    payload.lat = params.lat;
    payload.lon = params.lon;
  }

  const res = await fetch(`${API_BASE_URL}/api/v1/analysis`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": API_KEY,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({ detail: "Analiz sırasında hata oluştu." }));
    throw new Error(errData.detail || "Sunucu hatası.");
  }

  return res.json();
}

export async function sendTelegramMessage(params: {
  analysis_id: number;
  chat_id?: string;
  message_type?: string;
}): Promise<{ sent: boolean; info?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/telegram/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": API_KEY,
      },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Telegram gönderilemedi." }));
      return { sent: false, info: err.detail };
    }
    return { sent: true };
  } catch (e: any) {
    return { sent: false, info: e.message };
  }
}
