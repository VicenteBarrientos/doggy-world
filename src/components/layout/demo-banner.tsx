import { FlaskConical } from "lucide-react";

import { es } from "@/lib/i18n/es";

export function DemoBanner() {
  return (
    <div className="border-b border-[#efd8b8] bg-[#fff1d9] px-4 py-2.5 text-[#725124]">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 text-center text-xs sm:text-sm">
        <FlaskConical className="shrink-0" size={16} aria-hidden="true" />
        <span>
          <strong>{es.demo.title}.</strong> {es.demo.description}
        </span>
      </div>
    </div>
  );
}
