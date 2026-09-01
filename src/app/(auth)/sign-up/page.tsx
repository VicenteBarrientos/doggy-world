import type { Metadata } from "next";

import { AuthForm } from "@/components/auth/auth-form";
import { OnboardingProgress } from "@/components/onboarding/onboarding-progress";
import { TrackEvent } from "@/components/analytics/track-event";

export const metadata: Metadata = { title: "Crear cuenta" };

export default function SignUpPage() {
  return (
    <div className="w-full">
      <TrackEvent name="signup_started" />
      <OnboardingProgress currentStep={1} />

      <p className="font-brush text-3xl text-electric">Paso 1 de 4</p>
      <h1 className="mt-1 font-display text-4xl uppercase tracking-tight sm:text-5xl">
        Crea tu cuenta de dueño
      </h1>
      <p className="mt-3 text-sm leading-6 text-ink/75 sm:text-base">
        Tu cuenta te permite gestionar los pasaportes de tu manada, guardar sus fotos y conectar con
        otros perros.
      </p>

      <div className="mt-8">
        <AuthForm mode="sign-up" />
      </div>
    </div>
  );
}
