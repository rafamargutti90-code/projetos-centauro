import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface CardProps {
  title?: string;
  children: ReactNode;
  padding?: "none" | "sm" | "md" | "lg";
  className?: string;
}

const paddingClasses = {
  none: "",
  sm: "p-3",
  md: "p-5",
  lg: "p-8",
};

export function Card({ title, children, padding = "md", className }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-gray-200 bg-white shadow-sm",
        paddingClasses[padding],
        className
      )}
    >
      {title && (
        <h3 className={cn(
          "text-lg font-semibold text-centauro-navy",
          padding !== "none" ? "mb-4" : "px-5 pt-5 mb-4"
        )}>
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}
