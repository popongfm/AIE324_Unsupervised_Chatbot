"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, Database, Layers, Bot, Home, ChevronRight, BookOpen } from "lucide-react";
import { useDataset } from "@/context/DatasetContext";
import QuickStartModal from "@/components/QuickStartModal";

export default function Navbar() {
  const pathname = usePathname();
  const { fileData } = useDataset();
  const [isQuickStartOpen, setIsQuickStartOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/lab", label: "3D Lab", icon: Layers },
    { href: "/assistant", label: "AI Assistant", icon: Bot, badge: "Active" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 px-6 sm:px-10 py-3.5 flex items-center justify-between gap-4">
      <div className="flex items-center gap-8">
        {/* Doss Brand Logo */}
        <Link href="/" className="flex items-center gap-1.5 group cursor-pointer">
          <div className="flex items-center text-blue-600 font-black text-xl tracking-tighter">
            <span className="text-blue-600 group-hover:-translate-x-0.5 transition-transform">]</span>
            <span className="text-slate-900 tracking-tight font-extrabold ml-0.5">doss</span>
          </div>
          <span className="text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full uppercase ml-1">
            ML Lab
          </span>
        </Link>

        {/* Global Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/70 p-1 rounded-2xl border border-slate-200/70 text-xs font-medium">
          {navLinks.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all ${
                  isActive
                    ? "bg-white text-blue-600 shadow-2xs font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.2 rounded-md">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Right-hand Status Badges & Quick Action */}
      <div className="flex items-center gap-2.5 text-xs">
        <button
          onClick={() => setIsQuickStartOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-2xs transition-all cursor-pointer"
        >
          <BookOpen className="w-3.5 h-3.5 text-blue-600" />
          <span>Quick Start</span>
        </button>

        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium text-[11px]">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Guardrail Active</span>
        </div>

        {fileData && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 font-medium font-mono text-[11px]">
            <Database className="w-3 h-3 text-blue-600" />
            <span>{fileData.filename}</span>
          </div>
        )}

        {pathname !== "/lab" && (
          <Link
            href="/lab"
            className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-xl font-medium text-xs shadow-xs transition-all flex items-center gap-1"
          >
            <span>Enter 3D Lab</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      <QuickStartModal
        isOpen={isQuickStartOpen}
        onClose={() => setIsQuickStartOpen(false)}
      />
    </header>
  );
}

