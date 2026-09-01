import { PawPrint } from "lucide-react";
import Link from "next/link";

import { Logo } from "@/components/brand/logo";
import { buttonStyles } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col bg-canvas p-5 sm:p-8">
      <Logo />
      <div className="m-auto max-w-lg py-16 text-center">
        <div className="mx-auto flex size-20 items-center justify-center rounded-[2rem] bg-brand-soft text-brand"><PawPrint size={38} /></div>
        <p className="mt-7 text-sm font-bold uppercase tracking-[0.16em] text-brand">404 · Huellas perdidas</p>
        <h1 className="mt-3 font-display text-4xl font-semibold">No encontramos este pasaporte.</h1>
        <p className="mt-4 leading-7 text-ink-muted">Puede ser privado, haber cambiado de enlace o no existir todavía.</p>
        <Link href="/" className={buttonStyles({ className: "mt-7" })}>Volver al inicio</Link>
      </div>
    </main>
  );
}
