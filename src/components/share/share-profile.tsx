"use client";

import { Check, Copy, Share2, X } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics";

export function ShareProfile({
  dogName,
  profileUrl,
  initialOpen = false,
}: {
  dogName: string;
  profileUrl: string;
  initialOpen?: boolean;
}) {
  const [open, setOpen] = useState(initialOpen);
  const [copied, setCopied] = useState(false);

  function handleOpen() {
    setOpen(true);
    track("passport_share_opened", { source: "share_button" });
    track("passport_qr_opened", { source: "modal_render" });
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      track("passport_share_opened", { method: "clipboard_copy" });
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      track("passport_share_opened", { method: "clipboard_failed" });
    }
  }

  async function nativeShare() {
    if (!navigator.share) {
      await copyLink();
      return;
    }
    try {
      await navigator.share({
        title: `Conoce a ${dogName} en Doggy World`,
        text: `Este es el pasaporte digital de ${dogName} 🐾`,
        url: profileUrl,
      });
      track("passport_share_opened", { method: "native_share" });
    } catch {
      // User cancelled or share aborted
    }
  }

  return (
    <div id="share">
      <Button type="button" variant="primary" size="md" onClick={handleOpen}>
        <Share2 size={16} /> Compartir pasaporte
      </Button>
      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/60 p-4 backdrop-blur-sm sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="share-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <div className="edge-card w-full max-w-md p-6 shadow-[8px_8px_0_var(--ink)] sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-display text-xs uppercase tracking-widest text-electric">
                  Doggy Passport
                </p>
                <h2 id="share-title" className="mt-1 font-display text-3xl uppercase">
                  Comparte a {dogName}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex size-9 items-center justify-center border-2 border-ink bg-cream text-ink shadow-[2px_2px_0_var(--ink)] transition hover:bg-sun"
                aria-label="Cerrar"
              >
                <X size={18} />
              </button>
            </div>
            <div className="mx-auto mt-6 flex w-fit border-2 border-ink bg-white p-4 shadow-[4px_4px_0_var(--ink)]">
              <QRCodeSVG
                value={profileUrl}
                size={200}
                level="M"
                marginSize={1}
                fgColor="#1f1d1b"
                bgColor="#ffffff"
                title={`QR del perfil de ${dogName}`}
              />
            </div>
            <p className="mt-5 text-center text-xs leading-5 text-ink/75">
              Este QR abre el pasaporte público canónico de {dogName}. También puede imprimirse
              para su chapita o collar.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Button type="button" variant="outline" size="sm" onClick={copyLink}>
                {copied ? <Check size={16} className="text-electric" /> : <Copy size={16} />}
                {copied ? "¡Enlace copiado!" : "Copiar enlace"}
              </Button>
              <Button type="button" variant="primary" size="sm" onClick={nativeShare}>
                <Share2 size={16} /> Compartir
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
