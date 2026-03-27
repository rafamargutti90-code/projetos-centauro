"use client";

import { Menu } from "lucide-react";
import { useAppShell } from "@/app/AppShell";

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  const { openSidebar } = useAppShell();

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 border-b border-gray-200 bg-white px-4 md:px-6">
      <button
        onClick={openSidebar}
        className="rounded p-2 text-centauro-navy hover:bg-gray-100 md:hidden"
        aria-label="Abrir menu"
      >
        <Menu size={22} />
      </button>
      <h1 className="text-lg font-semibold text-centauro-navy">{title}</h1>
    </header>
  );
}
