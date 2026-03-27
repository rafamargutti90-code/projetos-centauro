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
    <div className="min-h-screen bg-centauro-cream">
      {/* Header */}
      <header className="bg-[#1E3A8A] text-white">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/logo-centauro.svg"
              alt="Distribuidora Centauro"
              width={180}
              height={45}
              priority
            />
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-xs text-blue-200 font-medium">Calculadora de Precificacao</p>
          </div>
        </div>
        {/* Red accent line */}
        <div className="h-1 bg-[#CC2229]" />
      </header>
      <main>{children}</main>
    </div>
  );
}
