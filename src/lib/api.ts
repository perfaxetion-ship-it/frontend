/**
 * Güvenli API İstemcisi:
 * Gerçek backend adresi ve API Key tarayıcıya açık edilmez;
 * İstekler Vercel Next.js Server Route Handler (/api/...) üzerinden güvenle tünellenir.
 */

export async function checkBackendHealth(): Promise<{ ok: boolean; stadiums: number }> {
  try {
    const res = await fetch("/api/health", { cache: "no-store" });
    if (!res.ok) return { ok: false, stadiums: 0 };
    const data = await res.json();
    return { ok: data.status === "ok", stadiums: data.stadiums || 0 };
  } catch {
    return { ok: false, stadiums: 0 };
  }
}

export async function resolveStadium(team: string): Promise<any | null> {
  try {
    const res = await fetch(`/api/stadiums/resolve?team=${encodeURIComponent(team)}`);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
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

  const res = await fetch("/api/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
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
    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      return { sent: false, info: "Telegram servisine erişilemedi." };
    }
    return { sent: true };
  } catch (e: any) {
    return { sent: false, info: e.message };
  }
}
