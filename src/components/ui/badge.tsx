import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: "neutral" | "green" | "orange" | "yellow" | "electric";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm border-2 border-ink px-2.5 py-0.5 font-display text-[0.7rem] uppercase tracking-wide shadow-[2px_2px_0_var(--ink)]",
        tone === "neutral" && "bg-white text-ink",
        (tone === "green" || tone === "electric") && "bg-electric text-white",
        tone === "orange" && "bg-cream-deep text-ink",
        tone === "yellow" && "bg-sun text-ink",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function ConstructionBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 border-2 border-ink bg-sun px-3 py-1 font-display text-[0.7rem] uppercase tracking-wide text-ink shadow-[2px_2px_0_var(--ink)]",
        className,
      )}
    >
      <span className="size-2 bg-ink shrink-0" />
      En construcción
    </span>
  );
}
