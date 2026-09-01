"use client";

import { Heart, LoaderCircle, Sparkles } from "lucide-react";
import { useActionState, useEffect, useState } from "react";

import { saveProductFeedbackAction } from "@/app/actions/feedback";
import { Button } from "@/components/ui/button";
import { FormStatus } from "@/components/ui/form-feedback";
import { ProductVisual } from "@/components/products/product-visual";
import { reactionOptions } from "@/lib/constants";
import { initialActionState } from "@/lib/forms";
import { track } from "@/lib/analytics";
import type { DogProductInteraction, DogWithPhoto, Product } from "@/types/database";

export function FeedbackForm({
  dog,
  product,
  existing,
}: {
  dog: DogWithPhoto;
  product: Product;
  existing?: DogProductInteraction;
}) {
  const [state, action, pending] = useActionState(saveProductFeedbackAction, initialActionState);
  const [reaction, setReaction] = useState(existing?.reaction ?? "");
  const selectedReaction = reactionOptions.find((option) => option.value === reaction);
  const isToy = product.category === "toy";
  const isEdible = product.category === "treat" || product.category === "food";

  useEffect(() => {
    if (state.status === "success") {
      track("product_feedback_submitted", {
        category: product.category,
        reaction: reaction || undefined,
      });
    }
  }, [state.status, product.category, reaction]);

  return (
    <form action={action} className="rounded-[2.5rem] border border-line bg-white p-5 shadow-card sm:p-8" noValidate>
      <input type="hidden" name="dogId" value={dog.id} />
      <input type="hidden" name="productId" value={product.id} />
      <input type="hidden" name="rating" value={selectedReaction?.rating ?? ""} />
      <div className="grid items-center gap-5 sm:grid-cols-[130px_1fr]">
        <ProductVisual product={product} className="max-w-[130px]" />
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.15em] text-brand">Opinión de {dog.name}</p>
          <h2 className="mt-2 font-display text-3xl font-semibold">¿Qué le pareció?</h2>
          <p className="mt-1 text-ink-muted">{product.name}</p>
        </div>
      </div>

      <fieldset className="mt-7">
        <legend className="sr-only">Reacción de {dog.name}</legend>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {reactionOptions.map((option) => (
            <label key={option.value} className="cursor-pointer">
              <input
                type="radio"
                name="reaction"
                value={option.value}
                aria-label={option.label}
                required
                defaultChecked={existing?.reaction === option.value}
                onChange={() => setReaction(option.value)}
                className="peer sr-only"
              />
              <span className="flex min-h-28 flex-col items-center justify-center rounded-[1.5rem] border border-line bg-canvas px-2 py-4 text-center transition hover:border-brand/35 peer-checked:border-brand peer-checked:bg-brand-soft peer-checked:shadow-[0_0_0_2px_rgba(25,107,82,.12)]">
                <span className="text-3xl" aria-hidden="true">{option.emoji}</span>
                <span className="mt-2 text-sm font-semibold">{option.label}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {reaction ? (
        <div className="mt-7 rounded-[2rem] bg-surface-muted p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <Sparkles size={17} className="text-accent" />
            <h3 className="font-semibold">Un par de detalles útiles</h3>
          </div>

          {isToy ? (
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <fieldset>
                <legend className="text-sm font-semibold">¿Lo destruyó?</legend>
                <div className="mt-2 flex gap-2">
                  {[{ value: "true", label: "Sí" }, { value: "false", label: "No" }].map((option) => (
                    <label key={option.value} className="flex-1 cursor-pointer">
                      <input type="radio" name="destroyed" value={option.value} defaultChecked={existing?.destroyed === (option.value === "true")} className="peer sr-only" />
                      <span className="flex min-h-11 items-center justify-center rounded-full border border-line bg-white text-sm font-semibold peer-checked:border-brand peer-checked:bg-brand-soft">{option.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <div>
                <label htmlFor="lifetimeHours" className="text-sm font-semibold">¿Cuánto duró?</label>
                <select id="lifetimeHours" name="lifetimeHours" defaultValue={existing?.lifetime_hours ?? ""} className="mt-2 min-h-11 w-full rounded-full border border-line bg-white px-4">
                  <option value="">Aún no lo sé</option>
                  <option value="0.16">Menos de 10 minutos</option>
                  <option value="24">1 día</option>
                  <option value="168">1 semana</option>
                  <option value="720">Todavía vive 😎</option>
                </select>
              </div>
            </div>
          ) : null}

          {isEdible ? (
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <fieldset>
                <legend className="text-sm font-semibold">¿Lo aceptó?</legend>
                <div className="mt-2 flex gap-2">
                  {[{ value: "true", label: "Lo comió" }, { value: "false", label: "Lo rechazó" }].map((option) => (
                    <label key={option.value} className="flex-1 cursor-pointer">
                      <input type="radio" name="accepted" value={option.value} defaultChecked={existing?.accepted === (option.value === "true")} className="peer sr-only" />
                      <span className="flex min-h-11 items-center justify-center rounded-full border border-line bg-white px-3 text-center text-sm font-semibold peer-checked:border-brand peer-checked:bg-brand-soft">{option.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <fieldset>
                <legend className="text-sm font-semibold">¿Notaste una posible reacción?</legend>
                <div className="mt-2 flex gap-2">
                  {[{ value: "false", label: "No" }, { value: "true", label: "Sí, observar" }].map((option) => (
                    <label key={option.value} className="flex-1 cursor-pointer">
                      <input type="radio" name="possibleReaction" value={option.value} defaultChecked={existing?.possible_reaction === (option.value === "true")} className="peer sr-only" />
                      <span className="flex min-h-11 items-center justify-center rounded-full border border-line bg-white px-3 text-center text-sm font-semibold peer-checked:border-brand peer-checked:bg-brand-soft">{option.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>
          ) : null}

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-line bg-white p-4 text-sm font-semibold">
              <input type="checkbox" name="favorite" defaultChecked={existing?.favorite} className="size-4 accent-brand" />
              <Heart size={18} className="text-accent" /> Es uno de sus favoritos
            </label>
            <fieldset>
              <legend className="text-sm font-semibold">¿Lo comprarías de nuevo?</legend>
              <div className="mt-2 flex gap-2">
                {[{ value: "true", label: "Sí" }, { value: "false", label: "No" }].map((option) => (
                  <label key={option.value} className="flex-1 cursor-pointer">
                    <input type="radio" name="wouldBuyAgain" value={option.value} defaultChecked={existing?.would_buy_again === (option.value === "true")} className="peer sr-only" />
                    <span className="flex min-h-11 items-center justify-center rounded-full border border-line bg-white text-sm font-semibold peer-checked:border-brand peer-checked:bg-brand-soft">{option.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          <div className="mt-5">
            <label htmlFor="notes" className="text-sm font-semibold">Nota privada <span className="font-normal text-ink-muted">· opcional</span></label>
            <textarea id="notes" name="notes" rows={3} defaultValue={existing?.notes ?? ""} className="mt-2 w-full resize-y rounded-2xl border border-line bg-white px-4 py-3" placeholder="Algo que quieras recordar para la próxima vez…" />
          </div>
        </div>
      ) : null}

      <div className="mt-6 flex flex-col items-stretch justify-between gap-4 sm:flex-row sm:items-center">
        <FormStatus state={state} />
        <Button type="submit" size="lg" disabled={pending || !reaction} className="sm:ml-auto">
          {pending ? <LoaderCircle className="animate-spin" size={18} /> : <Heart size={18} />}
          {pending ? "Guardando…" : existing ? "Actualizar opinión" : "Guardar opinión"}
        </Button>
      </div>
    </form>
  );
}
