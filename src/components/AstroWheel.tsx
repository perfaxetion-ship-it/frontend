"use client";

import React from "react";

const ZODIAC_SYMBOLS = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];
const ZODIAC_NAMES = ["Koç", "Boğa", "İkizler", "Yengeç", "Aslan", "Başak", "Terazi", "Akrep", "Yay", "Oğlak", "Kova", "Balık"];

interface AstroWheelProps {
  homeTeam: string;
  awayTeam: string;
  ascSign?: string;
  chartData?: any;
}

export default function AstroWheel({ homeTeam, awayTeam, ascSign }: AstroWheelProps) {
  const size = 420;
  const cx = size / 2;
  const cy = size / 2;
  const rOuter = 185;
  const rInnerSign = 150;
  const rInnerHouse = 75;

  return (
    <div className="flex flex-col items-center justify-center p-3 bg-[#090d16] rounded-xl border border-slate-700/60 shadow-2xl">
      <div className="text-center mb-2">
        <h4 className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center justify-center gap-1.5">
          <span>🔮</span> GÖRSEL ZODYAK ÇARKI (REGİOMONTANUS)
        </h4>
        <p className="text-[11px] text-slate-400">
          <span className="text-blue-400 font-bold">{homeTeam} (ASC)</span> vs{" "}
          <span className="text-red-400 font-bold">{awayTeam} (DSC)</span>
        </p>
      </div>

      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible select-none">
        {/* Outer and Inner Circles */}
        <circle cx={cx} cy={cy} r={rOuter} fill="#0f172a" stroke="#475569" strokeWidth="2" />
        <circle cx={cx} cy={cy} r={rInnerSign} fill="#090d16" stroke="#334155" strokeWidth="1.5" />
        <circle cx={cx} cy={cy} r={rInnerHouse} fill="#0b1120" stroke="#334155" strokeWidth="1" />

        {/* 12 Zodiac Signs */}
        {ZODIAC_SYMBOLS.map((symbol, idx) => {
          const angleStart = (idx * 30 * Math.PI) / 180;
          const x1 = cx + rInnerSign * Math.cos(angleStart);
          const y1 = cy - rInnerSign * Math.sin(angleStart);
          const x2 = cx + rOuter * Math.cos(angleStart);
          const y2 = cy - rOuter * Math.sin(angleStart);

          // Center of sign segment for symbol
          const midAngle = ((idx * 30 + 15) * Math.PI) / 180;
          const rMid = (rOuter + rInnerSign) / 2;
          const sx = cx + rMid * Math.cos(midAngle);
          const sy = cy - rMid * Math.sin(midAngle);

          return (
            <g key={idx}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#334155" strokeWidth="1" />
              <text
                x={sx}
                y={sy + 4}
                fill="#f59e0b"
                fontSize="13"
                fontWeight="bold"
                textAnchor="middle"
                className="select-none"
              >
                {symbol}
              </text>
            </g>
          );
        })}

        {/* 12 House Dividing Lines */}
        {Array.from({ length: 12 }).map((_, h) => {
          const hNum = h + 1;
          const angle = ((h * 30 + 180) * Math.PI) / 180; // House 1 (ASC) at 180 deg (Left)
          const isAngle = hNum === 1 || hNum === 7 || hNum === 10 || hNum === 4;
          const strokeColor =
            hNum === 1 || hNum === 10 ? "#f59e0b" : hNum === 7 || hNum === 4 ? "#ef4444" : "#334155";
          const strokeWidth = isAngle ? 2.5 : 1;

          const x1 = cx + rInnerHouse * Math.cos(angle);
          const y1 = cy - rInnerHouse * Math.sin(angle);
          const x2 = cx + rInnerSign * Math.cos(angle);
          const y2 = cy - rInnerSign * Math.sin(angle);

          // House Number text position
          const midHAngle = (((h * 30 + 15) + 180) * Math.PI) / 180;
          const hx = cx + (rInnerHouse + 16) * Math.cos(midHAngle);
          const hy = cy - (rInnerHouse + 16) * Math.sin(midHAngle);

          return (
            <g key={h}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={strokeColor} strokeWidth={strokeWidth} />
              <text
                x={hx}
                y={hy + 3}
                fill="#64748b"
                fontSize="9"
                fontWeight="bold"
                textAnchor="middle"
              >
                {hNum}
              </text>
            </g>
          );
        })}

        {/* Major Axis Lines & Labels */}
        {/* ASC - House 1 (Left) */}
        <text x={cx - rOuter - 8} y={cy + 4} fill="#3b82f6" fontSize="11" fontWeight="bold" textAnchor="end">
          ASC (Ev Sahibi)
        </text>
        {/* DSC - House 7 (Right) */}
        <text x={cx + rOuter + 8} y={cy + 4} fill="#ef4444" fontSize="11" fontWeight="bold" textAnchor="start">
          DSC (Deplasman)
        </text>
        {/* MC - House 10 (Top) */}
        <text x={cx} y={cy - rOuter - 8} fill="#f59e0b" fontSize="11" fontWeight="bold" textAnchor="middle">
          MC (Zafer / Şeref)
        </text>
        {/* IC - House 4 (Bottom) */}
        <text x={cx} y={cy + rOuter + 18} fill="#94a3b8" fontSize="11" fontWeight="bold" textAnchor="middle">
          IC (Kök / Temel)
        </text>

        {/* Center Badge */}
        <circle cx={cx} cy={cy} r="28" fill="#1e293b" stroke="#f59e0b" strokeWidth="1.5" />
        <text x={cx} y={cy - 4} fill="#f59e0b" fontSize="11" fontWeight="black" textAnchor="middle">
          ASTRO
        </text>
        <text x={cx} y={cy + 10} fill="#38bdf8" fontSize="8" fontWeight="bold" textAnchor="middle">
          FUTBOL
        </text>
      </svg>
    </div>
  );
}

