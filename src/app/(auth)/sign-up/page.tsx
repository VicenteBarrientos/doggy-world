import type { Metadata } from "next";

import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = { title: "Crear cuenta" };

export default function SignUpPage() {
  return (
    <div className="w-full">
      <p className="text-sm font-bold uppercase tracking-[0.16em] text-brand">Bienvenidos</p>
      <h1 className="mt-3 font-display text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">Crea su lugar en Doggy World.</h1>
      <p className="mt-4 text-base leading-7 text-ink-muted">Tu cuenta puede administrar uno o muchos perros. Cada uno tendrá su propia identidad.</p>
      <div className="mt-8">
        <AuthForm mode="sign-up" />
      </div>
    </div>
  );
}
