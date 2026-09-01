export function Progress({ value, label }: { value: number; label?: string }) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className="space-y-1.5">
      {label ? (
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="font-display uppercase tracking-wider text-ink/75">{label}</span>
          <span className="font-display text-sm text-electric">{clamped}%</span>
        </div>
      ) : null}
      <div
        className="h-3.5 overflow-hidden border-2 border-ink bg-cream-deep p-[2px] shadow-[2px_2px_0_var(--ink)]"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={clamped}
        aria-label={label ?? "Progreso"}
      >
        <div
          className="h-full bg-electric transition-[width] duration-500"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
