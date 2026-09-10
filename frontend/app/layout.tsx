import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { DatasetProvider } from "@/context/DatasetContext";
import Navbar from "@/components/Navbar";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Doss • Unsupervised Learning 3D Platform",
  description: "Interactive 3D Scatter Plot, Dimensionality Reduction, Clustering, and Guardrailed RAG AI Assistant",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className={inter.variable}>
      <body className={`bg-gradient-to-br from-[#3b82f6] via-[#2563eb] to-[#1d4ed8] min-h-screen text-slate-900 p-2 sm:p-5 md:p-8 flex flex-col items-center selection:bg-blue-600 selection:text-white ${inter.className}`}>
        <DatasetProvider>
          {/* Doss Framed Container */}
          <div className="w-full max-w-[1680px] bg-white rounded-[28px] sm:rounded-[36px] shadow-2xl overflow-hidden border border-white/40 flex flex-col min-h-[92vh]">
            <Navbar />
            <main className="flex-1 flex flex-col">{children}</main>
            <footer className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-4 mt-auto">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 tracking-tight">]doss</span>
                <span>•</span>
                <span>Unsupervised Learning 3D Platform</span>
              </div>
              <div className="flex items-center gap-4 text-[11px] text-slate-400">
                <span>Dimensionality Reduction</span>
                <span>Clustering</span>
                <span>Anomaly Detection</span>
                <span>RAG AI Assistant</span>
              </div>
            </footer>
          </div>
        </DatasetProvider>
      </body>
    </html>
  );
}
