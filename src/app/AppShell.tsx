"use client";

import { useEffect, type ReactNode } from "react";
import Image from "next/image";
import { initializeDefaults } from "@/lib/storage";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  useEffect(() => {
    initializeDefaults();
  }, []);

  return (
    <div className="min-h-screen bg-[#F0F4F8]">
      {/* Header */}
      <header className="relative bg-gradient-to-r from-[#1E3A8A] via-[#1E3A8A] to-[#2B4C9B] text-white shadow-lg shadow-blue-900/10">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/logo-centauro.svg"
              alt="Distribuidora Centauro"
              width={180}
              height={45}
              priority
              className="drop-shadow-sm"
            />
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3.5 py-1.5 rounded-full">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs font-medium text-blue-100">Calculadora de Precificacao</span>
          </div>
        </div>
        {/* Red accent bar */}
        <div className="h-1 bg-gradient-to-r from-[#CC2229] via-[#E03E3E] to-[#CC2229]" />
      </header>
      <main>{children}</main>
      {/* Footer */}
      <footer className="text-center py-6 text-xs text-gray-400">
        Distribuidora Centauro &middot; Comercial Margutti &middot; Desde 1994
      </footer>
    </div>
  );
}
