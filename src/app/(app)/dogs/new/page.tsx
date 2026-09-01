import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { DogForm } from "@/components/dogs/dog-form";
import { buttonStyles } from "@/components/ui/button";

export const metadata: Metadata = { title: "Agregar perro" };

export default function NewDogPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/dashboard" className={buttonStyles({ variant: "ghost", size: "sm", className: "-ml-3" })}>
        <ArrowLeft size={16} /> Volver al inicio
      </Link>
      <div className="mb-8 mt-5">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-brand">Nuevo pasaporte</p>
        <h1 className="mt-2 text-balance font-display text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Cuéntanos quién es tu perro.</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-ink-muted">Empieza con lo que sabes hoy. Su pasaporte puede crecer y cambiar junto a él.</p>
      </div>
      <DogForm />
    </div>
  );
}
