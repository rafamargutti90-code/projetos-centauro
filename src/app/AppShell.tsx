"use client";

import { useState, useEffect, createContext, useContext, type ReactNode } from "react";
import { Menu } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { initializeDefaults } from "@/lib/storage";

interface AppShellContextValue {
  openSidebar: () => void;
}

const AppShellContext = createContext<AppShellContextValue>({
  openSidebar: () => {},
});

export function useAppShell() {
  return useContext(AppShellContext);
}

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    initializeDefaults();
  }, []);

  return (
    <AppShellContext.Provider value={{ openSidebar: () => setSidebarOpen(true) }}>
      <div className="flex min-h-screen bg-centauro-cream">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Mobile top bar */}
          <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-gray-200 bg-white px-4 md:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded p-2 text-centauro-navy hover:bg-gray-100"
              aria-label="Abrir menu"
            >
              <Menu size={22} />
            </button>
            <span className="text-lg font-bold text-centauro-navy">Centauro</span>
          </header>
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </AppShellContext.Provider>
  );
}
