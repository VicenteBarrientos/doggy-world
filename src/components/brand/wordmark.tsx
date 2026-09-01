import { cn } from "@/lib/utils";

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-baseline gap-2 font-display leading-none uppercase tracking-[-0.02em]",
        className,
      )}
    >
      <span className="relative text-ink">
        Doggy
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="absolute -right-3 -top-2 h-3.5 w-3.5 fill-electric"
        >
          <ellipse cx="6" cy="7" rx="3" ry="4" />
          <ellipse cx="13" cy="4.5" rx="3" ry="4" />
          <ellipse cx="19.5" cy="9" rx="3" ry="4" />
          <path d="M12 11c4 0 7 3 7 6s-3.5 3-7 3-7 0-7-3 3-6 7-6z" />
        </svg>
      </span>
      <span className="text-electric">World</span>
    </span>
  );
}
