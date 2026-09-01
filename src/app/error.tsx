"use client";

import { RotateCcw, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-[70vh] items-center justify-center p-6">
      <div className="max-w-lg rounded-[2.5rem] border border-line bg-white p-8 text-center shadow-card">
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-red-50 text-danger"><TriangleAlert size={28} /></div>
        <h1 className="mt-6 font-display text-3xl font-semibold">Algo no salió como esperábamos.</h1>
        <p className="mt-3 text-sm leading-6 text-ink-muted">No se guardaron cambios en esta pantalla. Puedes intentarlo otra vez.</p>
        <Button onClick={reset} className="mt-6"><RotateCcw size={17} /> Reintentar</Button>
      </div>
    </main>
  );
}
