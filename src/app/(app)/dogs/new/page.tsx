import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { DogForm } from "@/components/dogs/dog-form";
import { OnboardingProgress } from "@/components/onboarding/onboarding-progress";
import { TrackEvent } from "@/components/analytics/track-event";
import { buttonStyles } from "@/components/ui/button";

export const metadata: Metadata = { title: "Crear pasaporte de tu perro" };

export default function NewDogPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <TrackEvent name="dog_creation_started" />

      <Link
        href="/dashboard"
        className={buttonStyles({ variant: "ghost", size: "sm", className: "-ml-3 mb-4" })}
      >
        <ArrowLeft size={16} /> Volver al panel
      </Link>

      <OnboardingProgress currentStep={2} />

      <div className="mb-8">
        <p className="font-brush text-3xl text-electric">Paso 2 de 4</p>
        <h1 className="mt-1 font-display text-4xl uppercase tracking-tight sm:text-5xl">
          Cuéntanos quién es tu perro
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-ink/75 sm:text-base">
          Solo necesitamos su nombre, su foto y su raza para emitir su pasaporte público. Todo lo
          demás podrás personalizarlo a tu ritmo.
        </p>
      </div>

      <DogForm />
    </div>
  );
}
