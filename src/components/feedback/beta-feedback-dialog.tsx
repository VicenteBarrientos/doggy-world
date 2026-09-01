"use client";

import { Check, LoaderCircle, MessageSquare, Send, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useActionState, useEffect, useState } from "react";

import { submitBetaFeedbackAction } from "@/app/actions/beta-feedback";
import { Button } from "@/components/ui/button";
import { FieldError, FormStatus } from "@/components/ui/form-feedback";
import { betaFeedbackCategories } from "@/lib/beta-feedback";
import { initialActionState } from "@/lib/forms";
import { track } from "@/lib/analytics";

export function BetaFeedbackDialog({
  triggerVariant = "button",
}: {
  triggerVariant?: "button" | "badge" | "footer-link";
}) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const [state, formAction, pending] = useActionState(
    submitBetaFeedbackAction,
    initialActionState,
  );
  const [selectedCategory, setSelectedCategory] = useState<string>("Tengo una idea");

  function handleOpen() {
    setIsOpen(true);
    track("beta_feedback_opened");
  }

  function handleClose() {
    setIsOpen(false);
  }

  useEffect(() => {
    if (state.status === "success") {
      track("beta_feedback_submitted", { category: selectedCategory });
    }
  }, [state.status, selectedCategory]);

  return (
    <>
      {triggerVariant === "badge" ? (
        <button
          type="button"
          onClick={handleOpen}
          className="inline-flex items-center gap-1.5 border-2 border-ink bg-sun px-2.5 py-1 font-display text-[11px] uppercase tracking-wider text-ink shadow-[2px_2px_0_var(--ink)] transition hover:-translate-y-0.5 hover:bg-cream"
          aria-label="Dar feedback de la beta"
        >
          <MessageSquare size={13} />
          <span>Feedback</span>
        </button>
      ) : triggerVariant === "footer-link" ? (
        <button
          type="button"
          onClick={handleOpen}
          className="inline-flex items-center gap-1.5 font-display text-xs uppercase tracking-wider text-ink/75 transition hover:text-electric"
        >
          <MessageSquare size={14} />
          <span>Enviar feedback</span>
        </button>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleOpen}
          className="gap-1.5"
        >
          <MessageSquare size={14} />
          <span>Feedback</span>
        </Button>
      )}

      {isOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="feedback-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 p-4 backdrop-blur-xs"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
        >
          <div className="relative w-full max-w-lg border-2 border-ink bg-cream p-6 shadow-[8px_8px_0_var(--ink)] sm:p-8">
            <button
              type="button"
              onClick={handleClose}
              className="absolute right-4 top-4 flex size-8 items-center justify-center border-2 border-ink bg-white text-ink shadow-[2px_2px_0_var(--ink)] transition hover:bg-sun"
              aria-label="Cerrar ventana de feedback"
            >
              <X size={18} />
            </button>

            <div>
              <span className="inline-block border border-ink bg-sun px-2 py-0.5 font-display text-[10px] uppercase tracking-widest text-ink shadow-[1px_1px_0_var(--ink)]">
                Beta Cerrada
              </span>
              <h2
                id="feedback-dialog-title"
                className="mt-2 font-display text-2xl uppercase tracking-tight text-ink"
              >
                ¿Cómo ha sido tu experiencia?
              </h2>
              <p className="mt-1 text-xs text-ink/75">
                Cuéntanos qué funcionó bien, qué te confundió o qué te gustaría ver. Tu opinión moldea
                directamente Doggy World.
              </p>
            </div>

            {state.status === "success" ? (
              <div className="mt-6 border-2 border-ink bg-white p-6 text-center shadow-[4px_4px_0_var(--ink)]">
                <div className="mx-auto flex size-12 items-center justify-center border-2 border-ink bg-sun text-ink shadow-[2px_2px_0_var(--ink)]">
                  <Check size={24} className="text-electric" />
                </div>
                <h3 className="mt-3 font-display text-lg uppercase text-ink">
                  ¡Feedback recibido!
                </h3>
                <p className="mt-1 text-xs text-ink/80">{state.message}</p>
                <div className="mt-5">
                  <Button type="button" size="sm" onClick={handleClose}>
                    Cerrar ventana
                  </Button>
                </div>
              </div>
            ) : (
              <form action={formAction} className="mt-6 space-y-4">
                <input type="hidden" name="pagePath" value={pathname} />

                <div>
                  <label className="block font-display text-xs uppercase tracking-wider text-ink">
                    Tipo de comentario
                  </label>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {betaFeedbackCategories.map((cat) => {
                      const isSelected = selectedCategory === cat;
                      return (
                        <label key={cat} className="cursor-pointer">
                          <input
                            type="radio"
                            name="category"
                            value={cat}
                            checked={isSelected}
                            onChange={() => setSelectedCategory(cat)}
                            className="sr-only"
                          />
                          <span
                            className={`inline-block border-2 border-ink px-2.5 py-1 font-display text-[11px] uppercase tracking-wide transition shadow-[2px_2px_0_var(--ink)] ${
                              isSelected
                                ? "bg-electric text-white"
                                : "bg-white text-ink hover:bg-cream-deep"
                            }`}
                          >
                            {cat}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="feedback-message"
                    className="block font-display text-xs uppercase tracking-wider text-ink"
                  >
                    Tu mensaje *
                  </label>
                  <textarea
                    id="feedback-message"
                    name="message"
                    required
                    rows={4}
                    placeholder="Ej: Al subir la foto de mi perro noté que... / Me encantó ver el código QR para compartir su pasaporte..."
                    className="mt-1.5 w-full rounded-sm border-2 border-ink bg-white p-3 text-sm text-ink shadow-[2px_2px_0_var(--ink)] placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-electric"
                  />
                  <FieldError errors={state.fieldErrors?.message} />
                </div>

                <FormStatus state={state} />

                <div className="flex items-center justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleClose}
                    disabled={pending}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" size="sm" disabled={pending} className="gap-1.5">
                    {pending ? (
                      <LoaderCircle className="animate-spin" size={16} />
                    ) : (
                      <Send size={14} />
                    )}
                    {pending ? "Enviando…" : "Enviar feedback"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
