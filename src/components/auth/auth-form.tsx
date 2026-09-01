"use client";

import { ArrowRight, LoaderCircle, LockKeyhole, Mail, UserRound } from "lucide-react";
import Link from "next/link";
import { useActionState } from "react";

import { loginAction, signUpAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { FieldError, FormStatus } from "@/components/ui/form-feedback";
import { initialActionState } from "@/lib/forms";

export function AuthForm({ mode }: { mode: "login" | "sign-up" }) {
  const action = mode === "login" ? loginAction : signUpAction;
  const [state, formAction, pending] = useActionState(action, initialActionState);
  const isLogin = mode === "login";

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {!isLogin ? (
        <div>
          <label htmlFor="displayName" className="text-sm font-semibold text-ink">
            Tu nombre
          </label>
          <div className="relative mt-2">
            <UserRound className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted" size={18} aria-hidden="true" />
            <input
              id="displayName"
              name="displayName"
              autoComplete="name"
              required
              className="min-h-12 w-full rounded-2xl border border-line bg-white py-3 pl-11 pr-4 text-ink placeholder:text-ink-muted/70 focus:border-brand"
              placeholder="¿Cómo te llamas?"
            />
          </div>
          <FieldError errors={state.fieldErrors?.displayName} />
        </div>
      ) : null}

      <div>
        <label htmlFor="email" className="text-sm font-semibold text-ink">
          Correo electrónico
        </label>
        <div className="relative mt-2">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted" size={18} aria-hidden="true" />
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="min-h-12 w-full rounded-2xl border border-line bg-white py-3 pl-11 pr-4 text-ink placeholder:text-ink-muted/70 focus:border-brand"
            placeholder="tu@correo.com"
          />
        </div>
        <FieldError errors={state.fieldErrors?.email} />
      </div>

      <div>
        <label htmlFor="password" className="text-sm font-semibold text-ink">
          Contraseña
        </label>
        <div className="relative mt-2">
          <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted" size={18} aria-hidden="true" />
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={isLogin ? "current-password" : "new-password"}
            minLength={8}
            required
            className="min-h-12 w-full rounded-2xl border border-line bg-white py-3 pl-11 pr-4 text-ink placeholder:text-ink-muted/70 focus:border-brand"
            placeholder="Mínimo 8 caracteres"
          />
        </div>
        <FieldError errors={state.fieldErrors?.password} />
      </div>

      <FormStatus state={state} />

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? (
          <LoaderCircle className="animate-spin" size={18} aria-hidden="true" />
        ) : (
          <ArrowRight size={18} aria-hidden="true" />
        )}
        {pending ? "Un momento…" : isLogin ? "Entrar a Doggy World" : "Crear mi cuenta"}
      </Button>

      <p className="text-center text-sm text-ink-muted">
        {isLogin ? "¿Aún no tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
        <Link href={isLogin ? "/sign-up" : "/login"} className="font-semibold text-brand hover:underline">
          {isLogin ? "Crear una" : "Iniciar sesión"}
        </Link>
      </p>
    </form>
  );
}
