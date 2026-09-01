"use client";

import { LoaderCircle, Plus } from "lucide-react";
import { useActionState } from "react";

import { addPreferenceAction } from "@/app/actions/preferences";
import { Button } from "@/components/ui/button";
import { FieldError, FormStatus } from "@/components/ui/form-feedback";
import { preferenceCategoryLabels } from "@/lib/constants";
import { initialActionState } from "@/lib/forms";

export function PreferenceForm({ dogId }: { dogId: string }) {
  const [state, action, pending] = useActionState(addPreferenceAction, initialActionState);
  return (
    <form action={action} className="rounded-[2rem] border border-line bg-canvas p-5" noValidate>
      <input type="hidden" name="dogId" value={dogId} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="preference-category" className="text-sm font-semibold">Categoría</label>
          <select id="preference-category" name="category" className="mt-2 min-h-11 w-full rounded-2xl border border-line bg-white px-4 py-2.5">
            {Object.entries(preferenceCategoryLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="preference-sentiment" className="text-sm font-semibold">¿Qué siente?</label>
          <select id="preference-sentiment" name="sentiment" defaultValue="2" className="mt-2 min-h-11 w-full rounded-2xl border border-line bg-white px-4 py-2.5">
            <option value="2">Le encanta</option>
            <option value="1">Le gusta</option>
            <option value="0">Indiferente</option>
            <option value="-1">No le gusta</option>
            <option value="-2">Lo evita</option>
          </select>
        </div>
        <div>
          <label htmlFor="preference-key" className="text-sm font-semibold">Clave breve</label>
          <input id="preference-key" name="preferenceKey" required pattern="[a-z0-9_:-]+" className="mt-2 min-h-11 w-full rounded-2xl border border-line bg-white px-4 py-2.5" placeholder="rope_toys" />
          <FieldError errors={state.fieldErrors?.preferenceKey} />
        </div>
        <div>
          <label htmlFor="preference-value" className="text-sm font-semibold">Cómo lo describirías</label>
          <input id="preference-value" name="value" required className="mt-2 min-h-11 w-full rounded-2xl border border-line bg-white px-4 py-2.5" placeholder="Juegos de cuerda" />
          <FieldError errors={state.fieldErrors?.value} />
        </div>
      </div>
      <label className="mt-4 flex items-center gap-3 text-sm text-ink-muted">
        <input type="checkbox" name="isPublic" defaultChecked className="size-4 accent-brand" />
        Mostrar esta preferencia en su pasaporte público
      </label>
      <div className="mt-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <FormStatus state={state} />
        <Button type="submit" size="sm" disabled={pending} className="shrink-0">
          {pending ? <LoaderCircle className="animate-spin" size={16} /> : <Plus size={16} />}
          Agregar preferencia
        </Button>
      </div>
    </form>
  );
}
