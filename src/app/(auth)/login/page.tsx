import type { Metadata } from "next";

import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = { title: "Iniciar sesión" };

export default function LoginPage() {
  return (
    <div className="w-full">
      <p className="text-sm font-bold uppercase tracking-[0.16em] text-brand">Qué bueno verte</p>
      <h1 className="mt-3 font-display text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">Vuelve al mundo de tu perro.</h1>
      <p className="mt-4 text-base leading-7 text-ink-muted">Ingresa para seguir construyendo su pasaporte.</p>
      <div className="mt-8">
        <AuthForm mode="login" />
      </div>
    </div>
  );
}
