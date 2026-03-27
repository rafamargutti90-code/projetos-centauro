"use client";

import { useState, createContext, useContext, type ReactNode } from "react";
import { Sidebar } from "@/components/layout/Sidebar";

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

  return (
    <AppShellContext.Provider value={{ openSidebar: () => setSidebarOpen(true) }}>
      <div className="flex min-h-screen bg-centauro-cream">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex flex-1 flex-col overflow-hidden">
          {children}
        </div>
      </div>
    </AppShellContext.Provider>
  );
}
