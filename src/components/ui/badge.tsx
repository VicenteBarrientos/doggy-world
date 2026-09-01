import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: "neutral" | "green" | "orange" | "yellow";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
        tone === "neutral" && "bg-surface-muted text-ink-muted",
        tone === "green" && "bg-brand-soft text-brand-strong",
        tone === "orange" && "bg-accent-soft text-[#985225]",
        tone === "yellow" && "bg-[#fff1bd] text-[#735613]",
        className,
      )}
    >
      {children}
    </span>
  );
}
