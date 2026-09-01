"use client";

import { Edit3, QrCode, Share2, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { buttonStyles } from "@/components/ui/button";
import { track } from "@/lib/analytics";

export function CelebrationBanner({
  dogName,
  dogId,
  onOpenShare,
  onOpenQr,
}: {
  dogName: string;
  dogId: string;
  onOpenShare?: () => void;
  onOpenQr?: () => void;
}) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <aside
      aria-label="Pasaporte creado exitosamente"
      className="mb-8 overflow-hidden rounded-sm border-2 border-ink bg-sun p-6 shadow-[6px_6px_0_var(--ink)] sm:p-8"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex size-12 items-center justify-center border-2 border-ink bg-electric text-white shadow-[2px_2px_0_var(--ink)]">
            <Sparkles size={24} />
          </span>
          <div>
            <p className="font-display text-[10px] uppercase tracking-widest text-ink/75">
              ¡Pasaporte creado con éxito!
            </p>
            <h2 className="font-display text-2xl uppercase tracking-tight sm:text-3xl">
              El mundo de {dogName} ya está activo
            </h2>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="flex size-8 items-center justify-center border-2 border-ink bg-cream text-ink shadow-[2px_2px_0_var(--ink)] transition hover:bg-white"
          aria-label="Cerrar aviso"
        >
          <X size={16} />
        </button>
      </div>

      <p className="mt-4 max-w-2xl text-sm leading-6 text-ink/85 sm:text-base">
        Este es el pasaporte canónico y público de {dogName}. Puedes compartirlo con amigos, en el
        parque o imprimir el código QR para su collar.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        {onOpenShare ? (
          <button
            type="button"
            onClick={() => {
              track("passport_share_opened", { source: "celebration_banner" });
              onOpenShare();
            }}
            className={buttonStyles({ variant: "primary", size: "sm" })}
          >
            <Share2 size={16} /> Compartir pasaporte
          </button>
        ) : null}

        {onOpenQr ? (
          <button
            type="button"
            onClick={() => {
              track("passport_qr_opened", { source: "celebration_banner" });
              onOpenQr();
            }}
            className={buttonStyles({ variant: "outline", size: "sm" })}
          >
            <QrCode size={16} /> Ver código QR
          </button>
        ) : null}

        <Link
          href={`/dogs/${dogId}/edit`}
          className={buttonStyles({ variant: "ghost", size: "sm" })}
        >
          <Edit3 size={16} /> Completar perfil avanzado
        </Link>
      </div>
    </aside>
  );
}
