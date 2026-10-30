import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AstroFutbol Pro - Spor Astrolojisi & Yapay Zeka Analizi",
  description: "Regiomontanus gökyüzü haritaları, xG/Poisson ve spor astrolojisi maç analiz platformu.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className="antialiased selection:bg-cyan-500 selection:text-black">
        {children}
      </body>
    </html>
  );
}

