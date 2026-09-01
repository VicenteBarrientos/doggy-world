import { FlaskConical } from "lucide-react";

import { es } from "@/lib/i18n/es";

export function DemoBanner() {
  return (
    <div className="border-b-2 border-ink bg-sun px-4 py-2 text-ink">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 text-center text-xs font-semibold sm:text-sm">
        <FlaskConical className="shrink-0" size={16} aria-hidden="true" />
        <span>
          <strong className="font-display uppercase tracking-wide">{es.demo.title}:</strong>{" "}
          {es.demo.description}
        </span>
      </div>
    </div>
  );
}
