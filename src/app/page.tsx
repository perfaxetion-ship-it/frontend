"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Compass,
  Trophy,
  Flame,
  Clock,
  Target,
  Send,
  CheckCircle2,
  AlertCircle,
  Copy,
  Download,
  Settings,
  MapPin,
  ExternalLink,
  Sparkles,
  Share2,
} from "lucide-react";
import AstroWheel from "@/components/AstroWheel";
import {
  checkBackendHealth,
  resolveStadium,
  runAnalysis,
  sendTelegramMessage,
} from "@/lib/api";

const TOP_STADIUMS = [
  { label: "🇹🇷 RAMS Park (Galatasaray)", name: "RAMS Park (Ali Sami Yen)", city: "İstanbul, Türkiye", lat: 41.1034, lon: 28.991 },
  { label: "🇹🇷 Ülker Şükrü Saracoğlu (Fenerbahçe)", name: "Ülker Stadyumu (Şükrü Saracoğlu)", city: "İstanbul, Türkiye", lat: 40.988, lon: 29.037 },
  { label: "🇹🇷 Tüpraş Stadyumu (Beşiktaş)", name: "Tüpraş Stadyumu (İnönü)", city: "İstanbul, Türkiye", lat: 41.0394, lon: 28.9944 },
  { label: "🇹🇷 Papara Park (Trabzonspor)", name: "Papara Park (Akyazı)", city: "Trabzon, Türkiye", lat: 40.9789, lon: 39.6389 },
  { label: "🇪🇸 Santiago Bernabéu (Real Madrid)", name: "Santiago Bernabéu", city: "Madrid, İspanya", lat: 40.4531, lon: -3.6883 },
  { label: "🇪🇸 Spotify Camp Nou (Barcelona)", name: "Camp Nou", city: "Barselona, İspanya", lat: 41.3809, lon: 2.1228 },
  { label: "🏴󠁧󠁢󠁥󠁮󠁧󠁿 Emirates Stadium (Arsenal)", name: "Emirates Stadium", city: "Londra, İngiltere", lat: 51.5549, lon: -0.1084 },
  { label: "🏴󠁧󠁢󠁥󠁮󠁧󠁿 Etihad Stadium (Man City)", name: "Etihad Stadium", city: "Manchester, İngiltere", lat: 53.4831, lon: -2.2004 },
  { label: "🇮🇹 San Siro / Meazza (Inter/Milan)", name: "San Siro (Giuseppe Meazza)", city: "Milano, İtalya", lat: 45.4781, lon: 9.124 },
  { label: "🇧🇷 Maracanã (Flamengo/Fluminense)", name: "Maracanã", city: "Rio de Janeiro, Brezilya", lat: -22.9122, lon: -43.2302 },
];

export default function Home() {
  // Backend Status
  const [backendStatus, setBackendStatus] = useState<{ ok: boolean; stadiums: number }>({
    ok: false,
    stadiums: 0,
  });

  // Form State
  const [homeTeam, setHomeTeam] = useState("Galatasaray");
  const [awayTeam, setAwayTeam] = useState("Fenerbahçe");
  const [matchDate, setMatchDate] = useState(() => {
    const now = new Date();
    const d = String(now.getDate()).padStart(2, "0");
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const y = now.getFullYear();
    return `${d}.${m}.${y}`;
  });
  const [matchTime, setMatchTime] = useState("20:00");
  const [tzOffset, setTzOffset] = useState("3.0");
  const [houseSystem, setHouseSystem] = useState("Regiomontanus");

  // Stadium & Coordinates
  const [stadiumName, setStadiumName] = useState("RAMS Park (Ali Sami Yen)");
  const [cityName, setCityName] = useState("İstanbul, Türkiye");
  const [latitude, setLatitude] = useState(41.1034);
  const [longitude, setLongitude] = useState(28.991);
  const [autoStatus, setAutoStatus] = useState("💡 Ev sahibi takımı yazdığınızda saha otomatik bulunur.");

  // Telegram State
  const [autoTelegram, setAutoTelegram] = useState(true);
  const [showTgModal, setShowTgModal] = useState(false);
  const [tgToken, setTgToken] = useState("");
  const [tgChatId, setTgChatId] = useState("");
  const [tgMsgType, setTgMsgType] = useState("detailed");

  // UI State
  const [activeTab, setActiveTab] = useState(0); // 0: Tüm Rapor, 1: Harita, 2: Göstergeler, 3: Kırılmalar, 4: Tahminler, 5: Sosyal
  const [loading, setLoading] = useState(false);
  const [footerStatus, setFooterStatus] = useState("Hazır.");
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const resolveTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    checkBackendHealth().then(setBackendStatus);
    // İlk açılışta Galatasaray - Fenerbahçe analizini otomatik üret
    handleRunAnalysis(true);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Ev Sahibi Takım Yazıldığında Otomatik Bulucu
  const handleHomeTeamChange = (val: string) => {
    setHomeTeam(val);
    if (resolveTimer.current) clearTimeout(resolveTimer.current);

    if (!val.trim()) {
      setAutoStatus("💡 Ev sahibi takımı yazdığınızda saha otomatik bulunur.");
      return;
    }

    if (val.trim().length >= 3) {
      setAutoStatus(`🔍 '${val}' sahası küresel veritabanında aranıyor...`);
      resolveTimer.current = setTimeout(() => {
        handleFindStadium(val);
      }, 600);
    }
  };

  const handleFindStadium = async (teamName?: string) => {
    const target = (teamName || homeTeam).trim();
    if (!target) return;
    setAutoStatus(`⏳ '${target}' için stadyum ve koordinatlar bulunuyor...`);

    const result = await resolveStadium(target);
    if (result && result.lat && result.lon) {
      setStadiumName(result.stadium || result.name || "");
      setCityName(result.city || result.country || "");
      setLatitude(result.lat);
      setLongitude(result.lon);
      setAutoStatus(`✅ '${target}' sahası bulundu: ${result.stadium || result.name}`);
    } else {
      setAutoStatus(`⚠️ '${target}' otomatik bulunamadı, koordinatları manuel kontrol edebilirsiniz.`);
    }
  };

  const handleQuickStadiumSelect = (stadium: (typeof TOP_STADIUMS)[0]) => {
    setStadiumName(stadium.name);
    setCityName(stadium.city);
    setLatitude(stadium.lat);
    setLongitude(stadium.lon);
    setAutoStatus(`✅ Saha seçildi: ${stadium.name}`);
  };

  const handleRunAnalysis = async (silent = false) => {
    setLoading(true);
    setFooterStatus(`⏳ ${homeTeam} vs ${awayTeam} haritası hesaplanıyor...`);

    try {
      const data = await runAnalysis({
        home_team: homeTeam,
        away_team: awayTeam,
        match_date: matchDate,
        match_time: matchTime,
        stadium_name: stadiumName,
        city: cityName,
        lat: latitude,
        lon: longitude,
        house_system: houseSystem,
        send_telegram: autoTelegram,
      });

      setAnalysisData(data);
      setFooterStatus(`✅ ${homeTeam} vs ${awayTeam} analizi tamamlandı (${data.match?.stadium || stadiumName}).`);
      if (!silent) showToast("Analiz başarıyla üretildi!");
    } catch (e: any) {
      setFooterStatus(`⚠️ Hata: ${e.message}`);
      if (!silent) showToast(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    showToast(`✅ ${label} kopyalandı!`);
  };

  const handleDownloadReport = () => {
    if (!analysisData?.reports?.full) return;
    const blob = new Blob([analysisData.reports.full], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `AstroFutbol_${homeTeam}_vs_${awayTeam}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Rapor dosyası indirildi (.txt)");
  };

  const handleManualTelegramSend = async () => {
    if (!analysisData?.id) {
      showToast("Önce bir maç analizi üretin.");
      return;
    }
    setFooterStatus("⏳ Analiz Telegram'a gönderiliyor...");
    const res = await sendTelegramMessage({
      analysis_id: analysisData.id,
      chat_id: tgChatId || undefined,
      message_type: tgMsgType,
    });
    if (res.sent) {
      setFooterStatus(`✈️ ${homeTeam} vs ${awayTeam} analizi Telegram'a gönderildi!`);
      showToast("Telegram'a başarıyla gönderildi!");
    } else {
      setFooterStatus(`⚠️ Telegram Gönderim Hatası: ${res.info}`);
      showToast(`Telegram Hatası: ${res.info}`);
    }
  };

  // Summary Card Helpers
  const homeScore = analysisData?.teams?.home?.score?.net?.toFixed(1) || "50.0";
  const awayScore = analysisData?.teams?.away?.score?.net?.toFixed(1) || "50.0";
  const netDiff = analysisData?.predictions?.net_score_diff || 0;
  const diffSign = netDiff > 0 ? "+" : "";
  const adv = netDiff > 0 ? homeTeam : netDiff < 0 ? awayTeam : "Dengeli";
  const confPct = analysisData?.predictions?.confidence_pct || 70;

  const msCode = analysisData?.predictions?.ms_code || "MS 1";
  const htGoal = analysisData?.predictions?.half_time_goal || "İY Gol VAR";
  const htGoalShort = htGoal.includes("GOL YOK")
    ? "İY Gol YOK (0-0)"
    : htGoal.includes("RİSKLİ")
    ? "İY 0.5Ü Riskli"
    : htGoal.includes("VAR")
    ? "İY Gol VAR"
    : "İY 0.5 Belirsiz";
  const exactScores = analysisData?.predictions?.exact_scores || "2-1 | 1-1";
  const corners = analysisData?.predictions?.corners || "Korner 9.5 ÜST";
  const cornerShort = corners.includes("YÜKSEK")
    ? "Korner 9.5 ÜST"
    : corners.includes("ORTA")
    ? "Korner 8.5 ÜST"
    : "Korner 9.5 ALT";

  return (
    <div className="min-h-screen bg-[#0b1120] text-[#f8fafc] flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-[#1e293b] border border-amber-400 text-white px-4 py-2.5 rounded-lg shadow-2xl flex items-center gap-2 text-sm">
          <Sparkles className="w-4 h-4 text-amber-400" />
          {toastMessage}
        </div>
      )}

      {/* --- ÜST BAŞLIK BARI (HEADER) --- */}
      <header className="bg-[#0b1120] border-b border-slate-800/80 px-4 py-3 flex flex-col md:flex-row justify-between items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-amber-500 flex items-center justify-center text-white shadow-md">
            <Compass className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <h1 className="text-base md:text-lg font-black tracking-wide text-amber-400 flex items-center gap-1.5">
              🔮 ASTRO-FUTBOL PRO <span className="text-white text-xs font-normal">| SPOR ASTROLOJİSİ ANALİZ & TAHMİN BOTU</span>
            </h1>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Ev Sahibi ve Deplasmanı yazın ➔ Stadyum & Koordinatları otomatik bulur ➔ 5 Bölümlü Analiz & Sosyal Medya Metni üretir
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${
              backendStatus.ok
                ? "bg-emerald-950/60 text-emerald-400 border-emerald-500/40"
                : "bg-amber-950/60 text-amber-400 border-amber-500/40"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${backendStatus.ok ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
            {backendStatus.ok ? `Canlı Backend (${backendStatus.stadiums} Stadyum)` : "Backend Bağlanıyor..."}
          </div>

          <div className="px-2.5 py-1 text-xs rounded bg-[#1e293b] text-slate-300 border border-slate-700">
            Regiomontanus v2.1
          </div>
        </div>
      </header>

      {/* --- ANA GÖVDE (SOL: GİRİŞ FORMU, SAĞ: SONUÇLAR & TABLAR) --- */}
      <div className="flex-1 flex flex-col lg:flex-row p-3 gap-3 overflow-hidden">
        {/* --- SOL PANEL (GİRİŞ FORMU) --- */}
        <aside className="w-full lg:w-[410px] bg-[#111827] border border-[#334155] rounded-xl p-3.5 flex flex-col gap-3 shrink-0 overflow-y-auto">
          {/* 1. Takımları Girin */}
          <div>
            <h2 className="text-xs font-bold text-amber-400 uppercase tracking-wide flex items-center gap-1.5 mb-2">
              ⚽ 1. TAKIMLARI GİRİN (OTOMATİK SAHA BULUCU)
            </h2>

            {/* Ev Sahibi */}
            <div className="mb-2">
              <label className="block text-[11px] font-bold text-slate-200 mb-1">
                Ev Sahibi Takım (ASC - 1. Ev / 10. Ev):
              </label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={homeTeam}
                  onChange={(e) => handleHomeTeamChange(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleRunAnalysis()}
                  className="flex-1 bg-[#0f172a] border border-[#3b82f6] text-white px-2.5 py-1.5 rounded text-sm font-bold focus:outline-none focus:ring-1 focus:ring-blue-400"
                  placeholder="Örn: Galatasaray"
                />
                <button
                  type="button"
                  onClick={() => handleFindStadium()}
                  className="px-2.5 py-1.5 bg-[#3b82f6] hover:bg-blue-600 text-white text-xs font-bold rounded transition cursor-pointer flex items-center gap-1 shrink-0"
                >
                  📍 Sahayı Bul
                </button>
              </div>
              <div className="text-[11px] text-emerald-400 italic mt-1 leading-tight">{autoStatus}</div>
            </div>

            {/* Deplasman */}
            <div className="mb-2">
              <label className="block text-[11px] font-bold text-slate-200 mb-1">
                Deplasman Takımı (DSC - 7. Ev / 4. Ev):
              </label>
              <input
                type="text"
                value={awayTeam}
                onChange={(e) => setAwayTeam(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleRunAnalysis()}
                className="w-full bg-[#0f172a] border border-[#475569] text-white px-2.5 py-1.5 rounded text-sm font-bold focus:outline-none focus:border-amber-400"
                placeholder="Örn: Fenerbahçe"
              />
            </div>

            {/* Hızlı Kulüp / Stadyum Seçimi */}
            <div>
              <label className="block text-[10px] text-slate-400 mb-1">
                Hızlı Kulüp / Stadyum Seçimi (Türkiye, Avrupa, Brezilya vb.):
              </label>
              <select
                onChange={(e) => {
                  const s = TOP_STADIUMS[Number(e.target.value)];
                  if (s) handleQuickStadiumSelect(s);
                }}
                className="w-full bg-[#1e293b] border border-[#334155] text-slate-200 text-xs px-2 py-1.5 rounded focus:outline-none"
              >
                <option value="">Stadyum Şablonu Seçin...</option>
                {TOP_STADIUMS.map((s, idx) => (
                  <option key={idx} value={idx}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="h-[1px] bg-slate-800" />

          {/* 2. Maç Tarihi ve Saati */}
          <div>
            <h2 className="text-xs font-bold text-amber-400 uppercase tracking-wide flex items-center gap-1.5 mb-2">
              🕒 2. MAÇ TARİHİ VE SAATİ (TÜRKİYE SAATİ - TSİ)
            </h2>

            <div className="grid grid-cols-3 gap-2 mb-2">
              <div className="col-span-1">
                <label className="block text-[10px] text-slate-300 mb-0.5">Tarih:</label>
                <input
                  type="text"
                  value={matchDate}
                  onChange={(e) => setMatchDate(e.target.value)}
                  className="w-full bg-[#0f172a] border border-[#475569] text-white px-2 py-1 rounded text-xs font-bold"
                  placeholder="GG.AA.YYYY"
                />
              </div>

              <div className="col-span-1">
                <label className="block text-[10px] font-bold text-slate-200 mb-0.5">Maç Saati:</label>
                <input
                  type="text"
                  value={matchTime}
                  onChange={(e) => setMatchTime(e.target.value)}
                  className="w-full bg-[#0f172a] border border-[#475569] text-white px-2 py-1 rounded text-xs font-bold"
                  placeholder="20:00"
                />
              </div>

              <div className="col-span-1">
                <label className="block text-[10px] font-bold text-amber-400 mb-0.5">TSİ (UTC+3):</label>
                <input
                  type="text"
                  value={tzOffset}
                  onChange={(e) => setTzOffset(e.target.value)}
                  className="w-full bg-[#0f172a] border border-[#475569] text-amber-400 px-2 py-1 rounded text-xs font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-slate-300 mb-0.5">Astrolojik Ev Sistemi:</label>
              <select
                value={houseSystem}
                onChange={(e) => setHouseSystem(e.target.value)}
                className="w-full bg-[#0f172a] border border-[#334155] text-slate-200 text-xs px-2 py-1 rounded"
              >
                <option value="Regiomontanus">Regiomontanus (Klasik Spor Astrolojisi - Önerilen)</option>
                <option value="Placidus">Placidus</option>
              </select>
            </div>
          </div>

          <div className="h-[1px] bg-slate-800" />

          {/* 3. Saha ve Harita Koordinatları */}
          <div>
            <h2 className="text-xs font-bold text-amber-400 uppercase tracking-wide flex items-center gap-1.5 mb-2">
              🧭 3. SAHA VE HARİTA KOORDİNATLARI (OTOMATİK)
            </h2>

            <div className="grid grid-cols-3 gap-2 mb-2">
              <div className="col-span-2">
                <label className="block text-[10px] text-slate-400 mb-0.5">Stadyum Adı:</label>
                <input
                  type="text"
                  value={stadiumName}
                  onChange={(e) => setStadiumName(e.target.value)}
                  className="w-full bg-[#0f172a] border border-[#334155] text-slate-200 px-2 py-1 rounded text-xs"
                />
              </div>

              <div className="col-span-1">
                <label className="block text-[10px] text-slate-400 mb-0.5">Şehir / Ülke:</label>
                <input
                  type="text"
                  value={cityName}
                  onChange={(e) => setCityName(e.target.value)}
                  className="w-full bg-[#0f172a] border border-[#334155] text-slate-200 px-2 py-1 rounded text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-slate-400 mb-0.5">Enlem (Latitude):</label>
                <input
                  type="number"
                  step="any"
                  value={latitude}
                  onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#0f172a] border border-[#334155] text-amber-400 font-mono font-bold px-2 py-1 rounded text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-0.5">Boylam (Longitude):</label>
                <input
                  type="number"
                  step="any"
                  value={longitude}
                  onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#0f172a] border border-[#334155] text-amber-400 font-mono font-bold px-2 py-1 rounded text-xs"
                />
              </div>
            </div>
          </div>

          {/* ANA ANALİZ BUTONU */}
          <button
            type="button"
            disabled={loading}
            onClick={() => handleRunAnalysis(false)}
            className="w-full bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-black text-xs md:text-sm py-2.5 rounded shadow-lg transition cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 mt-1"
          >
            {loading ? (
              <>
                <Compass className="w-4 h-4 animate-spin" />
                HESAPLANIYOR...
              </>
            ) : (
              <>
                <span>🔮</span> ASTROLOJİK ANALİZ VE TAHMİN ÜRET
              </>
            )}
          </button>

          {/* Telegram Otomatik Gönderim Kutusu */}
          <div className="bg-[#1e293b] border border-[#3b82f6] rounded-lg p-2.5">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-white mb-2">
              <input
                type="checkbox"
                checked={autoTelegram}
                onChange={(e) => setAutoTelegram(e.target.checked)}
                className="rounded bg-[#0f172a] border-[#3b82f6] text-blue-500 focus:ring-0"
              />
              ✈️ Analiz Sonuçlarını Otomatik Telegram'a Yaz
            </label>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleManualTelegramSend}
                className="flex-1 bg-[#3b82f6] hover:bg-blue-600 text-white text-[11px] font-bold py-1 px-2 rounded transition cursor-pointer"
              >
                ✈️ Şimdi Telegram'a Gönder
              </button>
              <button
                type="button"
                onClick={() => setShowTgModal(true)}
                className="bg-[#334155] hover:bg-slate-600 text-white text-[11px] font-bold py-1 px-2 rounded transition cursor-pointer flex items-center gap-1"
              >
                <Settings className="w-3 h-3" /> Ayarlar
              </button>
            </div>
          </div>

          {/* Hızlı Kopyalama Butonları */}
          <div className="flex flex-col gap-1.5">
            <button
              type="button"
              onClick={() => handleCopyText(analysisData?.reports?.social_short, "Kısa Sosyal Medya Metni")}
              className="w-full bg-[#10b981] hover:bg-emerald-600 text-white font-bold text-xs py-1.5 rounded transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              📱 Sosyal Medya Metnini Tek Tıkla Kopyala (Kısa)
            </button>
            <button
              type="button"
              onClick={() => handleCopyText(analysisData?.reports?.social_detailed, "Detaylı Telegram / IG Metni")}
              className="w-full bg-[#8b5cf6] hover:bg-purple-600 text-white font-bold text-xs py-1.5 rounded transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              📢 Detaylı Telegram / IG Paylaşım Metnini Kopyala
            </button>
          </div>

          {/* Hızlı Test Maçları */}
          <div className="text-[11px] text-slate-400">
            <span className="block mb-1 font-semibold">Hızlı Test Maçları:</span>
            <div className="grid grid-cols-4 gap-1">
              {[
                { h: "Galatasaray", a: "Fenerbahçe", s: "RAMS Park (Ali Sami Yen)", c: "İstanbul, Türkiye", lat: 41.1034, lon: 28.991, t: "GS - FB" },
                { h: "Beşiktaş", a: "Trabzonspor", s: "Tüpraş Stadyumu (İnönü)", c: "İstanbul, Türkiye", lat: 41.0394, lon: 28.9944, t: "BJK - TS" },
                { h: "Real Madrid", a: "Barcelona", s: "Santiago Bernabéu", c: "Madrid, İspanya", lat: 40.4531, lon: -3.6883, t: "Real - Barça" },
                { h: "Flamengo", a: "Palmeiras", s: "Maracanã", c: "Rio de Janeiro, Brezilya", lat: -22.9122, lon: -43.2302, t: "Fla - Palm" },
              ].map((m, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setHomeTeam(m.h);
                    setAwayTeam(m.a);
                    setStadiumName(m.s);
                    setCityName(m.c);
                    setLatitude(m.lat);
                    setLongitude(m.lon);
                    setAutoStatus(`✅ Saha seçildi: ${m.s}`);
                  }}
                  className="bg-[#1e293b] hover:bg-slate-700 text-slate-200 text-[10px] py-1 rounded text-center transition"
                >
                  {m.t}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* --- SAĞ PANEL (ÖZET KARTLARI + NOTEBOOK TABLAR) --- */}
        <main className="flex-1 flex flex-col bg-[#0b1120] gap-2 overflow-hidden">
          {/* Üst 4 Renkli Özet Kartı Barı */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {/* Kart 1: Ev Sahibi */}
            <div className="bg-[#1e293b] border border-[#3b82f6] rounded-lg p-2.5 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-400">🏠 EV SAHİBİ (ASC)</span>
              <span className="text-sm font-bold text-white truncate my-0.5">
                {homeTeam} ({homeScore} P)
              </span>
              <span className="text-[11px] font-bold text-[#3b82f6] truncate">
                L1: {analysisData?.teams?.home?.lord_main || "Merkür"} | L10: {analysisData?.teams?.home?.lord_victory || "Satürn"}
              </span>
            </div>

            {/* Kart 2: Deplasman */}
            <div className="bg-[#1e293b] border border-[#ef4444] rounded-lg p-2.5 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-400">✈️ DEPLASMAN (DSC)</span>
              <span className="text-sm font-bold text-white truncate my-0.5">
                {awayTeam} ({awayScore} P)
              </span>
              <span className="text-[11px] font-bold text-[#ef4444] truncate">
                L7: {analysisData?.teams?.away?.lord_main || "Jüpiter"} | L4: {analysisData?.teams?.away?.lord_victory || "Güneş"}
              </span>
            </div>

            {/* Kart 3: Net Puan Farkı */}
            <div className="bg-[#1e293b] border border-[#f59e0b] rounded-lg p-2.5 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-400">⚖️ NET PUAN FARKI</span>
              <span className="text-sm font-bold text-white truncate my-0.5">
                {diffSign}{netDiff.toFixed(1)} Puan
              </span>
              <span className="text-[11px] font-bold text-[#f59e0b] truncate">
                Üstünlük: {adv} (%{confPct})
              </span>
            </div>

            {/* Kart 4: Kesin Tahmin & Skor */}
            <div className="bg-[#1e293b] border border-[#10b981] rounded-lg p-2.5 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-400">🎯 KESİN TAHMİN & SKOR</span>
              <span className="text-sm font-bold text-white truncate my-0.5">
                {msCode} | {htGoalShort}
              </span>
              <span className="text-[11px] font-bold text-[#10b981] truncate">
                {exactScores.split("|")[0]?.trim() || "2-1"} | {cornerShort}
              </span>
            </div>
          </div>

          {/* Sekmeler (Notebook Tabs Header) */}
          <div className="flex border-b border-slate-700 bg-[#111827] rounded-t-lg px-2 pt-1.5 gap-1 overflow-x-auto text-xs font-bold">
            {[
              { id: 0, label: "📋 Tüm Rapor (5 Bölüm)" },
              { id: 1, label: "🌐 1. Koordinatlar & Zodyak Haritası" },
              { id: 2, label: "⚖️ 2. Göstergeler & Puan Tablosu" },
              { id: 3, label: "⚡ 3. Kırılma Noktaları & Zaaflar" },
              { id: 4, label: "🎯 4. Kesin Tahminler & Dakikalar" },
              { id: 5, label: "📱 5. Sosyal Medya Metni" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2 rounded-t-md transition cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-[#3b82f6] text-white shadow"
                    : "bg-[#1e293b] text-slate-400 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content Box */}
          <div className="flex-1 bg-[#111827] border-x border-b border-slate-700 rounded-b-lg p-3 flex flex-col overflow-hidden">
            {activeTab === 0 && (
              <div className="flex-1 report-textbox p-4 rounded-lg overflow-y-auto border border-slate-800">
                {analysisData?.reports?.full || "Analiz bekleniyor..."}
              </div>
            )}

            {activeTab === 1 && (
              <div className="flex-1 flex flex-col md:flex-row gap-4 overflow-y-auto">
                {/* Sol: Astro Wheel */}
                <div className="w-full md:w-[440px] shrink-0 flex items-center justify-center">
                  <AstroWheel homeTeam={homeTeam} awayTeam={awayTeam} />
                </div>
                {/* Sağ: Section 1 Rapor Metni */}
                <div className="flex-1 report-textbox p-4 rounded-lg overflow-y-auto border border-slate-800">
                  {analysisData?.reports?.section_1 || "Koordinat ve eksen bilgileri hesaplanıyor..."}
                </div>
              </div>
            )}

            {activeTab === 2 && (
              <div className="flex-1 report-textbox p-4 rounded-lg overflow-y-auto border border-slate-800">
                {analysisData?.reports?.section_2 || "Yönetici ve asalet puanları hesaplanıyor..."}
              </div>
            )}

            {activeTab === 3 && (
              <div className="flex-1 report-textbox p-4 rounded-lg overflow-y-auto border border-slate-800">
                {analysisData?.reports?.section_3 || "Açı ve kırılma noktaları hesaplanıyor..."}
              </div>
            )}

            {activeTab === 4 && (
              <div className="flex-1 report-textbox p-4 rounded-lg overflow-y-auto border border-slate-800">
                {analysisData?.reports?.section_4 || "Kesin tahminler ve dakika pencereleri hesaplanıyor..."}
              </div>
            )}

            {activeTab === 5 && (
              <div className="flex-1 flex flex-col gap-2 overflow-hidden">
                <div className="flex flex-wrap gap-2 pb-2 border-b border-slate-800">
                  <button
                    onClick={() => handleCopyText(analysisData?.reports?.social_short, "Kısa X Paylaşım Metni")}
                    className="px-3 py-1.5 bg-[#10b981] hover:bg-emerald-600 text-white rounded text-xs font-bold transition flex items-center gap-1.5"
                  >
                    📱 [TEK TIK] Kısa X (Twitter) Paylaşım Metnini Kopyala
                  </button>
                  <button
                    onClick={() => handleCopyText(analysisData?.reports?.social_detailed, "Detaylı Telegram / IG Metni")}
                    className="px-3 py-1.5 bg-[#8b5cf6] hover:bg-purple-600 text-white rounded text-xs font-bold transition flex items-center gap-1.5"
                  >
                    📢 [TEK TIK] Detaylı Telegram / Instagram Metnini Kopyala
                  </button>
                </div>
                <div className="flex-1 report-textbox p-4 rounded-lg overflow-y-auto border border-slate-800">
                  {`═══ [1] X (TWITTER) / KISA PAYLAŞIM METNİ ═══\n\n${
                    analysisData?.reports?.social_short || ""
                  }\n\n\n═══ [2] TELEGRAM / INSTAGRAM DETAYLI PAYLAŞIM POSTU ═══\n\n${
                    analysisData?.reports?.social_detailed || ""
                  }`}
                </div>
              </div>
            )}
          </div>

          {/* --- ALT AKSİYON ÇUBUĞU (BOTTOM BAR) --- */}
          <footer className="bg-[#111827] border border-[#334155] rounded-xl px-3 py-2 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleCopyText(analysisData?.reports?.full, "Tüm Rapor")}
                className="px-3 py-1.5 bg-[#3b82f6] hover:bg-blue-600 text-white font-bold rounded transition cursor-pointer flex items-center gap-1"
              >
                📋 Tüm Raporu Panoya Kopyala
              </button>
              <button
                type="button"
                onClick={handleDownloadReport}
                className="px-3 py-1.5 bg-[#1e293b] hover:bg-slate-700 text-slate-200 font-bold rounded transition cursor-pointer flex items-center gap-1 border border-slate-700"
              >
                <Download className="w-3.5 h-3.5" /> Raporu Dosyaya Kaydet (.TXT)
              </button>
            </div>

            <div className="font-bold text-emerald-400 text-[11px] sm:text-xs truncate">{footerStatus}</div>
          </footer>
        </main>
      </div>

      {/* --- TELEGRAM AYARLARI MODAL --- */}
      {showTgModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-amber-400/40 rounded-xl max-w-lg w-full p-5 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
                ✈️ TELEGRAM BOT & OTOMATİK GÖNDERİM AYARLARI
              </h3>
              <button
                onClick={() => setShowTgModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-[11px] text-slate-400 my-3 leading-relaxed">
              1) Telegram'da <strong>@BotFather</strong>'dan aldığınız Bot Token'ı girin.<br />
              2) Botunuza mesaj atıp Chat ID'nizi yazın (örn: kişisel ID veya @kanal_adi).<br />
              3) Analizler her üretildiğinde otomatik olarak Telegram'a gönderilecektir.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-white mb-1">Telegram Bot Token:</label>
                <input
                  type="text"
                  value={tgToken}
                  onChange={(e) => setTgToken(e.target.value)}
                  placeholder="8244093952:AAGP7t6rE3Kx3a7H..."
                  className="w-full bg-[#0f172a] border border-[#3b82f6] text-white px-3 py-1.5 rounded text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white mb-1">Telegram Chat ID:</label>
                <input
                  type="text"
                  value={tgChatId}
                  onChange={(e) => setTgChatId(e.target.value)}
                  placeholder="Örn: 7798319696 veya @kanal_adi"
                  className="w-full bg-[#0f172a] border border-slate-700 text-amber-400 px-3 py-1.5 rounded text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white mb-1">Mesaj Formatı:</label>
                <select
                  value={tgMsgType}
                  onChange={(e) => setTgMsgType(e.target.value)}
                  className="w-full bg-[#0f172a] border border-slate-700 text-white px-3 py-1.5 rounded text-xs"
                >
                  <option value="detailed">Detaylı Telegram Postu (Önerilen)</option>
                  <option value="short">Kısa Sosyal Medya Metni</option>
                  <option value="full">Tam 5 Bölümlü Teknik Rapor</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-5 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowTgModal(false)}
                className="px-3 py-1.5 bg-[#334155] hover:bg-slate-600 text-white text-xs font-bold rounded"
              >
                Kapat
              </button>
              <button
                onClick={() => {
                  setShowTgModal(false);
                  showToast("Telegram ayarları uygulandı!");
                }}
                className="px-4 py-1.5 bg-[#10b981] hover:bg-emerald-600 text-white text-xs font-bold rounded"
              >
                💾 Ayarları Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
