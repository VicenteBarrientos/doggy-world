export function Progress({ value, label }: { value: number; label?: string }) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className="space-y-2">
      {label ? (
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="font-medium text-ink">{label}</span>
          <span className="font-semibold text-brand">{clamped}%</span>
        </div>
      ) : null}
      <div
        className="h-2.5 overflow-hidden rounded-full bg-surface-muted"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={clamped}
        aria-label={label ?? "Progreso"}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand to-[#54a383] transition-[width] duration-500"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
