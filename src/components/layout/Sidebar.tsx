"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calculator,
  FlaskConical,
  Package,
  FileText,
  History,
  Settings,
  X,
  Hexagon,
} from "lucide-react";
import { cn } from "@/lib/cn";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/calculadora", label: "Calculadora", icon: Calculator },
  { href: "/simulacao", label: "Simulação", icon: FlaskConical },
  { href: "/produtos", label: "Produtos", icon: Package },
  { href: "/perfis-fiscais", label: "Perfis Fiscais", icon: FileText },
  { href: "/historico", label: "Histórico", icon: History },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-centauro-navy transition-transform duration-200 md:translate-x-0 md:static md:z-auto",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-5">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Hexagon className="h-7 w-7 text-centauro-gold" />
            <span className="text-xl font-bold text-white tracking-wide">
              Centauro
            </span>
          </Link>
          <button
            onClick={onClose}
            className="rounded p-1 text-gray-400 hover:text-white md:hidden"
            aria-label="Fechar menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-4 flex-1 space-y-1 px-3">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "border-l-[3px] border-centauro-gold bg-centauro-navy-light text-white"
                    : "border-l-[3px] border-transparent text-gray-300 hover:bg-centauro-navy-light hover:text-white"
                )}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-white/10 px-5 py-4">
          <p className="text-xs text-gray-400">
            Distribuidora Centauro
          </p>
          <p className="text-xs text-gray-500">
            Bahia, Brasil
          </p>
        </div>
      </aside>
    </>
  );
}
