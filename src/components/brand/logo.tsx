import { PawPrint } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

export function Logo({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <Link
      href="/"
      className={cn("inline-flex items-center gap-2.5 font-bold text-ink", className)}
      aria-label="Doggy World, ir al inicio"
    >
      <span className="flex size-10 items-center justify-center rounded-2xl bg-brand text-white shadow-sm">
        <PawPrint aria-hidden="true" size={21} strokeWidth={2.5} />
      </span>
      {compact ? null : (
        <span className="font-display text-xl font-semibold tracking-[-0.02em]">Doggy World</span>
      )}
    </Link>
  );
}
