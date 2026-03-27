"use client";

import { useEffect, type ReactNode } from "react";
import { Hexagon } from "lucide-react";
import { initializeDefaults } from "@/lib/storage";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  useEffect(() => {
    initializeDefaults();
  }, []);

  return (
    <div className="min-h-screen bg-centauro-cream">
      {/* Header */}
      <header className="bg-[#1B2A4A] text-white">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <Hexagon className="h-7 w-7 text-[#C9A84C]" />
          <div>
            <h1 className="text-lg font-bold tracking-wide">Distribuidora Centauro</h1>
            <p className="text-xs text-gray-300">Calculadora de Precificação</p>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
