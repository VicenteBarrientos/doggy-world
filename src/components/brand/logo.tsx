import Link from "next/link";

import { Wordmark } from "@/components/brand/wordmark";
import { cn } from "@/lib/utils";

export function Logo({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex items-center gap-2.5 font-bold text-ink transition hover:opacity-90",
        className,
      )}
      aria-label="Doggy World, ir al inicio"
    >
      <Wordmark className={compact ? "text-lg" : "text-2xl"} />
    </Link>
  );
}
