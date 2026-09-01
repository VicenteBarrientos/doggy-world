"use client";

import { ArrowRight, LoaderCircle, LockKeyhole, Mail, UserRound } from "lucide-react";
import Link from "next/link";
import { useActionState, useEffect } from "react";

import { loginAction, signUpAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { FieldError, FormStatus } from "@/components/ui/form-feedback";
import { initialActionState } from "@/lib/forms";
import { track } from "@/lib/analytics";

export function AuthForm({ mode }: { mode: "login" | "sign-up" }) {
  const action = mode === "login" ? loginAction : signUpAction;
  const [state, formAction, pending] = useActionState(action, initialActionState);
  const isLogin = mode === "login";

  useEffect(() => {
    if (state.status === "success") {
      if (mode === "sign-up") {
        track("signup_completed");
      } else {
        track("login_completed");
      }
    }
  }, [state.status, mode]);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {!isLogin ? (
        <div>
          <label
            htmlFor="displayName"
            className="block font-display text-xs uppercase tracking-wider text-ink"
          >
            Tu nombre
          </label>
          <div className="relative mt-2">
            <UserRound
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/60"
              size={18}
              aria-hidden="true"
            />
            <input
              id="displayName"
              name="displayName"
              autoComplete="name"
              required
              className="min-h-12 w-full border-2 border-ink bg-white py-3 pl-11 pr-4 text-ink shadow-[2px_2px_0_var(--ink)] placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-electric"
              placeholder="¿Cómo te llamas?"
            />
          </div>
          <FieldError errors={state.fieldErrors?.displayName} />
        </div>
      ) : null}

      <div>
        <label
          htmlFor="email"
          className="block font-display text-xs uppercase tracking-wider text-ink"
        >
          Correo electrónico
        </label>
        <div className="relative mt-2">
          <Mail
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/60"
            size={18}
            aria-hidden="true"
          />
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="min-h-12 w-full border-2 border-ink bg-white py-3 pl-11 pr-4 text-ink shadow-[2px_2px_0_var(--ink)] placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-electric"
            placeholder="tu@correo.com"
          />
        </div>
        <FieldError errors={state.fieldErrors?.email} />
      </div>

      <div>
        <label
          htmlFor="password"
          className="block font-display text-xs uppercase tracking-wider text-ink"
        >
          Contraseña
        </label>
        <div className="relative mt-2">
          <LockKeyhole
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/60"
            size={18}
            aria-hidden="true"
          />
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={isLogin ? "current-password" : "new-password"}
            minLength={8}
            required
            className="min-h-12 w-full border-2 border-ink bg-white py-3 pl-11 pr-4 text-ink shadow-[2px_2px_0_var(--ink)] placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-electric"
            placeholder="Mínimo 8 caracteres"
          />
        </div>
        <FieldError errors={state.fieldErrors?.password} />
      </div>

      <FormStatus state={state} />

      <Button type="submit" variant="primary" size="lg" className="w-full" disabled={pending}>
        {pending ? (
          <LoaderCircle className="animate-spin" size={18} aria-hidden="true" />
        ) : (
          <ArrowRight size={18} aria-hidden="true" />
        )}
        {pending ? "Un momento…" : isLogin ? "Entrar a Doggy World" : "Crear mi cuenta"}
      </Button>

      <p className="text-center text-xs text-ink/75">
        {isLogin ? "¿Aún no tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
        <Link
          href={isLogin ? "/sign-up" : "/login"}
          className="font-display uppercase tracking-wide text-electric underline hover:text-ink"
        >
          {isLogin ? "Crear una" : "Iniciar sesión"}
        </Link>
      </p>
    </form>
  );
}
