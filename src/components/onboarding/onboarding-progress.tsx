import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

const steps = [
  { number: 1, label: "Cuenta" },
  { number: 2, label: "Tu perro" },
  { number: 3, label: "Foto" },
  { number: 4, label: "Pasaporte" },
];

export function OnboardingProgress({ currentStep }: { currentStep: 1 | 2 | 3 | 4 }) {
  return (
    <nav
      aria-label="Progreso de creación"
      className="mb-8 overflow-hidden rounded-sm border-2 border-ink bg-white p-3 shadow-[4px_4px_0_var(--ink)]"
    >
      <ol className="grid grid-cols-4 gap-2 text-center">
        {steps.map((step) => {
          const isCompleted = step.number < currentStep;
          const isCurrent = step.number === currentStep;

          return (
            <li
              key={step.number}
              className={cn(
                "flex flex-col items-center justify-center gap-1 rounded-sm border-2 py-2 px-1 text-[11px] font-display uppercase tracking-wider transition sm:text-xs",
                isCompleted && "border-ink bg-sun text-ink",
                isCurrent && "border-ink bg-electric text-white shadow-[2px_2px_0_var(--ink)]",
                !isCompleted && !isCurrent && "border-ink/20 bg-cream text-ink/40",
              )}
            >
              <span className="flex items-center gap-1">
                {isCompleted ? <Check size={12} strokeWidth={3} /> : `${step.number}.`}
                <span className="hidden sm:inline">{step.label}</span>
              </span>
              <span className="text-[9px] uppercase tracking-normal sm:hidden">
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
