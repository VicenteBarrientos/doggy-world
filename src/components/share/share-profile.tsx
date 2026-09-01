"use client";

import { Check, Copy, Share2, X } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

export function ShareProfile({ dogName, profileUrl }: { dogName: string; profileUrl: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    await navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  async function nativeShare() {
    if (!navigator.share) {
      await copyLink();
      return;
    }
    await navigator.share({
      title: `Conoce a ${dogName} en Doggy World`,
      text: `Este es el pasaporte digital de ${dogName} 🐾`,
      url: profileUrl,
    });
  }

  return (
    <div id="share">
      <Button type="button" size="lg" onClick={() => setOpen(true)}>
        <Share2 size={18} /> Compartir perfil
      </Button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#10241e]/55 p-3 backdrop-blur-sm sm:items-center" role="dialog" aria-modal="true" aria-labelledby="share-title" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
          <div className="w-full max-w-md rounded-[2.5rem] bg-white p-6 shadow-float sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.15em] text-brand">Doggy Passport</p>
                <h2 id="share-title" className="mt-2 font-display text-3xl font-semibold">Comparte a {dogName}</h2>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="flex size-10 items-center justify-center rounded-full bg-surface-muted" aria-label="Cerrar"><X size={19} /></button>
            </div>
            <div className="mx-auto mt-7 flex w-fit rounded-[2rem] border border-line bg-white p-5 shadow-card">
              <QRCodeSVG value={profileUrl} size={210} level="M" marginSize={1} fgColor="#20352d" bgColor="#ffffff" title={`QR del perfil de ${dogName}`} />
            </div>
            <p className="mt-5 text-center text-sm leading-6 text-ink-muted">Este QR abre el perfil público canónico de {dogName}. También puede imprimirse para un tag.</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Button type="button" variant="secondary" onClick={copyLink}>{copied ? <Check size={17} /> : <Copy size={17} />}{copied ? "Copiado" : "Copiar enlace"}</Button>
              <Button type="button" onClick={nativeShare}><Share2 size={17} /> Compartir</Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
