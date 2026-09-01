import { FlaskConical, UserPlus } from "lucide-react";

import { es } from "@/lib/i18n/es";

export function DemoBanner() {
  return (
    <div className="border-b-2 border-ink bg-sun px-4 py-2 text-ink">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 text-xs font-semibold sm:text-sm">
        <span className="flex items-center gap-2">
          <FlaskConical className="shrink-0" size={16} aria-hidden="true" />
          <span>
            <strong className="font-display uppercase tracking-wide">{es.demo.title}:</strong>{" "}
            {es.demo.description}
          </span>
        </span>
        <form action="/demo/exit" method="post" className="ml-4 shrink-0">
          <button
            type="submit"
            className="flex items-center gap-1.5 border-2 border-ink bg-white px-3 py-1 font-display text-[10px] uppercase tracking-wide text-ink shadow-[2px_2px_0_var(--ink)] transition hover:bg-ink hover:text-white sm:text-xs"
          >
            <UserPlus size={13} aria-hidden="true" />
            {es.demo.exit}
          </button>
        </form>
      </div>
    </div>
  );
}
