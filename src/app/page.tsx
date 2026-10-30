"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Compass,
  Trophy,
  Flame,
  Clock,
  Target,
  Send,
  CheckCircle2,
  AlertCircle,
  Copy,
  ChevronDown,
  ChevronUp,
  Activity,
  Calendar,
  MapPin,
  ExternalLink,
} from "lucide-react";
import { checkBackendHealth, runAnalysis, getRecentAnalyses, API_BASE_URL } from "@/lib/api";
import { AnalysisResponse } from "@/types";

export default function Home() {
  const [backendStatus, setBackendStatus] = useState<{ ok: boolean; stadiums: number }>({
    ok: false,
    stadiums: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [recentAnalyses, setRecentAnalyses] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);
  const [showFullScenario, setShowFullScenario] = useState(true);

  // Form Fields
  const [homeTeam, setHomeTeam] = useState("Galatasaray");
  const [awayTeam, setAwayTeam] = useState("Fenerbahçe");
  const [matchDate, setMatchDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [matchTime, setMatchTime] = useState("20:00");
  const [stadiumName, setStadiumName] = useState("RAMS Park (Ali Sami Yen)");
  const [houseSystem, setHouseSystem] = useState("Regiomontanus");
  const [sendTelegram, setSendTelegram] = useState(false);

  useEffect(() => {
    checkBackendHealth().then(setBackendStatus);
    getRecentAnalyses().then(setRecentAnalyses);
  }, []);

  const handlePreset = (home: string, away: string, stadium: string) => {
    setHomeTeam(home);
    setAwayTeam(away);
    setStadiumName(stadium);
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await runAnalysis({
        home_team: homeTeam,
        away_team: awayTeam,
        match_date: matchDate,
        match_time: matchTime,
        stadium_name: stadiumName,
        house_system: houseSystem,
        send_telegram: sendTelegram,
      });
      setResult(data);
      // Geçmişi tazele
      getRecentAnalyses().then(setRecentAnalyses);
    } catch (err: any) {
      setError(err.message || "Analiz sırasında bir hata meydana geldi.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyReport = () => {
    if (!result?.predictions?.full_report) return;
    navigator.clipboard.writeText(result.predictions.full_report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen px-4 py-8 md:px-8 max-w-7xl mx-auto">
      {/* Top Navigation */}
      <header className="flex flex-col md:flex-row justify-between items-center pb-8 border-b border-white/10 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 text-white shadow-lg shadow-cyan-500/20">
            <Compass className="w-7 h-7 animate-spin-slow" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              AstroFutbol <span className="text-cyan-400 font-light">PRO</span>
            </h1>
            <p className="text-xs text-slate-400">Spor Astrolojisi & Regiomontanus Analiz Motoru</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border backdrop-blur-md ${
              backendStatus.ok
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                : "bg-amber-500/10 text-amber-400 border-amber-500/30"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                backendStatus.ok ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
              }`}
            />
            {backendStatus.ok ? `Canlı Backend (${backendStatus.stadiums} Stadyum)` : "Backend Bağlanıyor..."}
          </div>

          <a
            href={`${API_BASE_URL}/docs`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
          >
            API Dokümanı <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </header>

      {/* Hero Quick Presets */}
      <section className="my-6">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-semibold mr-1">Hızlı Maçlar:</span>
          {[
            { home: "Galatasaray", away: "Fenerbahçe", stadium: "RAMS Park (Ali Sami Yen)" },
            { home: "Real Madrid", away: "Barcelona", stadium: "Santiago Bernabeu" },
            { home: "Arsenal", away: "Manchester City", stadium: "Emirates Stadium" },
            { home: "Inter", away: "Milan", stadium: "San Siro (Giuseppe Meazza)" },
          ].map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handlePreset(preset.home, preset.away, preset.stadium)}
              className="px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/50 transition"
            >
              {preset.home} vs {preset.away}
            </button>
          ))}
        </div>
      </section>

      {/* Main Grid: Form + Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Card (5 cols on lg) */}
        <div className="lg:col-span-5">
          <div className="cosmic-card rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              Yeni Maç Analizi Başlat
            </h2>

            <form onSubmit={handleAnalyze} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Ev Sahibi (ASC/L1)</label>
                  <input
                    type="text"
                    required
                    value={homeTeam}
                    onChange={(e) => setHomeTeam(e.target.value)}
                    className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400 transition"
                    placeholder="Ev Sahibi Takım"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Deplasman (DSC/L7)</label>
                  <input
                    type="text"
                    required
                    value={awayTeam}
                    onChange={(e) => setAwayTeam(e.target.value)}
                    className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400 transition"
                    placeholder="Deplasman Takım"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-cyan-400" /> Maç Tarihi
                  </label>
                  <input
                    type="date"
                    required
                    value={matchDate}
                    onChange={(e) => setMatchDate(e.target.value)}
                    className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" /> Başlama Saati (TSİ)
                  </label>
                  <input
                    type="time"
                    required
                    value={matchTime}
                    onChange={(e) => setMatchTime(e.target.value)}
                    className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" /> Stadyum Adı veya Şehir
                </label>
                <input
                  type="text"
                  value={stadiumName}
                  onChange={(e) => setStadiumName(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400 transition"
                  placeholder="Stadyum adı veya şehir..."
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  872 stadyum veritabanından koordinatlar ve enlem/boylam otomatik bulunur.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Ev Sistemi</label>
                  <select
                    value={houseSystem}
                    onChange={(e) => setHouseSystem(e.target.value)}
                    className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400 transition"
                  >
                    <option value="Regiomontanus">Regiomontanus (Standart)</option>
                    <option value="Placidus">Placidus</option>
                    <option value="Koch">Koch</option>
                    <option value="Campanus">Campanus</option>
                  </select>
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                    <input
                      type="checkbox"
                      checked={sendTelegram}
                      onChange={(e) => setSendTelegram(e.target.checked)}
                      className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
                    />
                    Telegram Botuna Gönder
                  </label>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full glow-btn font-bold text-slate-950 py-3 rounded-xl text-sm flex items-center justify-center gap-2 mt-4 cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Compass className="w-4 h-4 animate-spin" />
                    Gökyüzü Çözümleniyor...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Astrolojik Analizi Başlat
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Recent Analyses List */}
          {recentAnalyses.length > 0 && (
            <div className="cosmic-card rounded-2xl p-6 mt-6">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                Son Yapılan Analizler
              </h3>
              <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                {recentAnalyses.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs flex justify-between items-center"
                  >
                    <div>
                      <div className="font-semibold text-white">
                        {item.home_team} vs {item.away_team}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {item.match_date} • {item.winner || "Analiz edildi"}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-[10px] border border-cyan-500/20">
                      ID #{item.id}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Results Area (7 cols on lg) */}
        <div className="lg:col-span-7">
          {result ? (
            <div className="space-y-6">
              {/* Match Header Card */}
              <div className="cosmic-card rounded-2xl p-6 border-cyan-500/30">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/10">
                  <div>
                    <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                      Resmi Maç Analiz Raporu
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                      {result.match.home_team} vs {result.match.away_team}
                    </h2>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                      {result.match.stadium} ({result.match.city}) • {result.match.lat.toFixed(4)}°,{" "}
                      {result.match.lon.toFixed(4)}°
                    </p>
                  </div>

                  <button
                    onClick={handleCopyReport}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition"
                  >
                    {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "Kopyalandı!" : "Raporu Kopyala"}
                  </button>
                </div>

                {/* Main Prediction Badges */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                  {/* Match Winner (MS) */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-950/40 to-slate-900 border border-cyan-500/30">
                    <div className="flex items-center justify-between text-xs text-cyan-400 font-bold mb-2">
                      <span className="flex items-center gap-1.5">
                        <Trophy className="w-4 h-4" /> MAÇ SONUCU (MS)
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 text-[10px]">
                        Güven: %{result.predictions.confidence_pct}
                      </span>
                    </div>
                    <div className="text-lg font-black text-white">{result.predictions.ms}</div>
                    <div className="text-xs text-slate-400 mt-1">
                      Net Güç Farkı: {result.predictions.net_score_diff > 0 ? "+" : ""}
                      {result.predictions.net_score_diff} Puan
                    </div>
                  </div>

                  {/* Half Time (IY) */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-purple-950/40 to-slate-900 border border-purple-500/30">
                    <div className="flex items-center justify-between text-xs text-purple-400 font-bold mb-2">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" /> İLK YARI (İY)
                      </span>
                    </div>
                    <div className="text-base font-bold text-white">{result.predictions.half_time}</div>
                    <div className="text-xs text-purple-300/80 mt-1">{result.predictions.half_time_goal}</div>
                  </div>
                </div>

                {/* xG & Goals Comparison */}
                <div className="mt-6 p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="flex justify-between items-center text-xs font-semibold mb-2">
                    <span className="text-slate-300">
                      {result.match.home_team} xG:{" "}
                      <strong className="text-cyan-400 font-mono text-sm">{result.predictions.xg.home}</strong>
                    </span>
                    <span className="text-amber-400 font-bold">{result.predictions.goals}</span>
                    <span className="text-slate-300">
                      {result.match.away_team} xG:{" "}
                      <strong className="text-purple-400 font-mono text-sm">{result.predictions.xg.away}</strong>
                    </span>
                  </div>
                  {/* xG Bar */}
                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden flex">
                    <div
                      className="bg-cyan-400 h-full transition-all duration-500"
                      style={{
                        width: `${
                          (result.predictions.xg.home /
                            (result.predictions.xg.home + result.predictions.xg.away || 1)) *
                          100
                        }%`,
                      }}
                    />
                    <div
                      className="bg-purple-500 h-full transition-all duration-500"
                      style={{
                        width: `${
                          (result.predictions.xg.away /
                            (result.predictions.xg.home + result.predictions.xg.away || 1)) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>

                {/* Corners & Exact Scores */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                    <div className="font-bold text-amber-400 flex items-center gap-1.5 mb-1">
                      <Flame className="w-4 h-4" /> KORNER TAHMİNİ
                    </div>
                    <p className="text-white font-semibold">{result.predictions.corners}</p>
                    <p className="text-slate-400 text-[11px] mt-1">{result.predictions.corners_by_team}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                    <div className="font-bold text-emerald-400 flex items-center gap-1.5 mb-1">
                      <Target className="w-4 h-4" /> EN OLASI SKORLAR
                    </div>
                    <p className="text-white font-mono font-bold text-sm tracking-wide">
                      {result.predictions.exact_scores}
                    </p>
                    <p className="text-slate-400 text-[11px] mt-1">Poisson olasılık dağılımı</p>
                  </div>
                </div>

                {/* Minute Windows Timeline */}
                {result.predictions.minute_windows?.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                      ⚡ Kritik Gol & Baskı Pencereleri (Dakikalar)
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {result.predictions.minute_windows.map((win, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800 flex items-center gap-2.5"
                        >
                          <span className="px-2 py-1 rounded bg-cyan-500/20 text-cyan-300 font-mono text-xs font-bold shrink-0">
                            {win.range}
                          </span>
                          <span className="text-xs text-slate-300 line-clamp-1">{win.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Deep Astrological Scenario */}
                {result.predictions.full_report && (
                  <div className="mt-6 pt-4 border-t border-white/10">
                    <button
                      onClick={() => setShowFullScenario(!showFullScenario)}
                      className="w-full flex items-center justify-between text-xs font-bold text-slate-300 hover:text-white transition py-2"
                    >
                      <span>📜 DETAYLI GÖKYÜZÜ RAPORU VE GEREKÇELER</span>
                      {showFullScenario ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    {showFullScenario && (
                      <div className="mt-3 p-4 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-slate-300 font-sans whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
                        {result.predictions.full_report}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="cosmic-card rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[480px]">
              <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4 animate-pulse">
                <Compass className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Astrolojik Analiz Bekleniyor</h3>
              <p className="text-xs text-slate-400 max-w-sm mb-6">
                Sol taraftaki formdan maç bilgilerini girin veya üstteki hazır maçlardan birini seçerek analizi
                başlatın.
              </p>
              <div className="flex gap-4 text-xs text-slate-500">
                <span>✓ 872 Stadyum Geocoding</span>
                <span>✓ Regiomontanus Haritalama</span>
                <span>✓ Poisson & xG Modeli</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
