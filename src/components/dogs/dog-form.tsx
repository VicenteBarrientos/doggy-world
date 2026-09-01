"use client";

import { Camera, Check, Globe2, LoaderCircle, Lock, PawPrint, Save } from "lucide-react";
import Image from "next/image";
import { useActionState, useEffect, useMemo, useState } from "react";

import { createDogAction, updateDogAction } from "@/app/actions/dogs";
import { Button } from "@/components/ui/button";
import { FieldError, FormStatus } from "@/components/ui/form-feedback";
import {
  energyOptions,
  personalityOptions,
  sizeOptions,
  sociabilityOptions,
} from "@/lib/constants";
import { initialActionState } from "@/lib/forms";
import type { DogWithPhoto } from "@/types/database";

const inputClass =
  "mt-2 min-h-12 w-full rounded-2xl border border-line bg-white px-4 py-3 text-ink placeholder:text-ink-muted/65 focus:border-brand";

export function DogForm({ dog }: { dog?: DogWithPhoto }) {
  const action = dog ? updateDogAction : createDogAction;
  const [state, formAction, pending] = useActionState(action, initialActionState);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const previewUrl = useMemo(
    () => (photoFile ? URL.createObjectURL(photoFile) : dog?.photo_url ?? null),
    [photoFile, dog?.photo_url],
  );

  useEffect(() => {
    if (!photoFile || !previewUrl) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [photoFile, previewUrl]);

  return (
    <form action={formAction} className="space-y-6" noValidate>
      {dog ? <input type="hidden" name="id" value={dog.id} /> : null}

      <section className="rounded-[2.25rem] border border-line bg-white p-5 shadow-card sm:p-8">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-brand-soft text-brand"><Camera size={21} /></span>
          <div>
            <h2 className="font-display text-2xl font-semibold">Su mejor foto</h2>
            <p className="text-sm text-ink-muted">JPG, PNG o WebP · máximo 3 MB</p>
          </div>
        </div>
        <div className="mt-6 grid items-center gap-5 sm:grid-cols-[150px_1fr]">
          <div className="relative aspect-square overflow-hidden rounded-[2rem] bg-brand-soft text-brand">
            {previewUrl ? (
              <Image src={previewUrl} alt="Vista previa de la foto" fill sizes="150px" className="object-cover" unoptimized={Boolean(photoFile)} />
            ) : (
              <div className="flex size-full items-center justify-center"><PawPrint size={48} strokeWidth={1.6} /></div>
            )}
          </div>
          <div>
            <label htmlFor="photo" className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-line bg-white px-5 py-3 text-sm font-semibold shadow-sm transition hover:border-brand/30 hover:bg-brand-soft/40">
              <Camera size={17} /> {dog?.photo_url ? "Cambiar foto" : "Elegir foto"}
            </label>
            <input
              id="photo"
              name="photo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(event) => setPhotoFile(event.target.files?.[0] ?? null)}
            />
            <p className="mt-3 text-sm text-ink-muted">
              {photoFile ? photoFile.name : "Una foto vertical o cuadrada se verá mejor en su pasaporte."}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-[2.25rem] border border-line bg-white p-5 shadow-card sm:p-8">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-brand">Identidad</p>
          <h2 className="mt-2 font-display text-2xl font-semibold">Lo esencial de su pasaporte</h2>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="text-sm font-semibold">Nombre *</label>
            <input id="name" name="name" required defaultValue={dog?.name} className={inputClass} placeholder="Rocky" />
            <FieldError errors={state.fieldErrors?.name} />
          </div>
          <div>
            <label htmlFor="breed" className="text-sm font-semibold">Raza o mezcla *</label>
            <input id="breed" name="breed" required defaultValue={dog?.breed} className={inputClass} placeholder="Golden Retriever" />
            <FieldError errors={state.fieldErrors?.breed} />
          </div>
          <div>
            <label htmlFor="sex" className="text-sm font-semibold">Sexo</label>
            <select id="sex" name="sex" defaultValue={dog?.sex ?? "unknown"} className={inputClass}>
              <option value="unknown">Prefiero no indicar</option>
              <option value="female">Hembra</option>
              <option value="male">Macho</option>
            </select>
          </div>
          <div>
            <label htmlFor="weightKg" className="text-sm font-semibold">Peso aproximado (kg)</label>
            <input id="weightKg" name="weightKg" type="number" min="0.1" max="150" step="0.1" defaultValue={dog?.weight_kg ?? ""} className={inputClass} placeholder="12.5" />
            <FieldError errors={state.fieldErrors?.weightKg} />
          </div>
          <div>
            <label htmlFor="birthDate" className="text-sm font-semibold">Fecha de nacimiento</label>
            <input id="birthDate" name="birthDate" type="date" defaultValue={dog?.birth_date ?? ""} className={inputClass} />
            <FieldError errors={state.fieldErrors?.birthDate} />
          </div>
          <div>
            <label htmlFor="adoptionDate" className="text-sm font-semibold">Llegó a la familia</label>
            <input id="adoptionDate" name="adoptionDate" type="date" defaultValue={dog?.adoption_date ?? ""} className={inputClass} />
            <FieldError errors={state.fieldErrors?.adoptionDate} />
          </div>
        </div>
        <label className="mt-5 flex items-center gap-3 rounded-2xl bg-surface-muted px-4 py-3 text-sm font-medium">
          <input type="checkbox" name="mixedBreed" defaultChecked={dog?.mixed_breed} className="size-4 accent-brand" />
          Es mestizo o mezcla de razas
        </label>
      </section>

      <section className="rounded-[2.25rem] border border-line bg-white p-5 shadow-card sm:p-8">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-brand">Personalidad</p>
          <h2 className="mt-2 font-display text-2xl font-semibold">Cómo se mueve por el mundo</h2>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-3">
          <div>
            <label htmlFor="size" className="text-sm font-semibold">Tamaño *</label>
            <select id="size" name="size" defaultValue={dog?.size ?? "medium"} className={inputClass}>
              {sizeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="energyLevel" className="text-sm font-semibold">Energía *</label>
            <select id="energyLevel" name="energyLevel" defaultValue={dog?.energy_level ?? "medium"} className={inputClass}>
              {energyOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="sociability" className="text-sm font-semibold">Sociabilidad *</label>
            <select id="sociability" name="sociability" defaultValue={dog?.sociability ?? "social"} className={inputClass}>
              {sociabilityOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </div>
        </div>
        <div className="mt-6">
          <fieldset>
            <legend className="text-sm font-semibold">Rasgos de personalidad <span className="font-normal text-ink-muted">· elige hasta 6</span></legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {personalityOptions.map((option) => (
                <label key={option.value} className="group cursor-pointer">
                  <input type="checkbox" name="personalityTags" value={option.value} defaultChecked={dog?.personality_tags.includes(option.value)} className="peer sr-only" />
                  <span className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-ink-muted transition peer-checked:border-brand peer-checked:bg-brand-soft peer-checked:text-brand-strong group-hover:border-brand/30">
                    <span>{option.emoji}</span> {option.label}<Check className="hidden peer-checked:block" size={14} />
                  </span>
                </label>
              ))}
            </div>
            <FieldError errors={state.fieldErrors?.personalityTags} />
          </fieldset>
        </div>
        <div className="mt-6">
          <label htmlFor="playStyle" className="text-sm font-semibold">Cómo prefiere jugar</label>
          <input id="playStyle" name="playStyle" defaultValue={dog?.play_style ?? ""} className={inputClass} placeholder="Fetch, carreras, juegos de cuerda…" />
        </div>
        <div className="mt-5">
          <label htmlFor="bio" className="text-sm font-semibold">Su historia</label>
          <textarea id="bio" name="bio" rows={5} defaultValue={dog?.bio} className={`${inputClass} resize-y`} placeholder="Cuéntanos qué lo hace especial, qué disfruta y cómo es un día feliz para él." />
          <div className="mt-1 flex justify-between gap-3 text-xs text-ink-muted"><span>Esta biografía puede aparecer en su perfil público.</span><span>Máximo 600</span></div>
          <FieldError errors={state.fieldErrors?.bio} />
        </div>
      </section>

      <section className="rounded-[2.25rem] border border-line bg-white p-5 shadow-card sm:p-8">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-brand">Ubicación y privacidad</p>
          <h2 className="mt-2 font-display text-2xl font-semibold">Comparte solo lo necesario</h2>
          <p className="mt-2 text-sm leading-6 text-ink-muted">Nunca pedimos una dirección exacta. La ciudad ayuda a dar contexto sin revelar dónde viven.</p>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="city" className="text-sm font-semibold">Ciudad</label>
            <input id="city" name="city" defaultValue={dog?.city ?? ""} className={inputClass} placeholder="Santiago" />
          </div>
          <div>
            <label htmlFor="country" className="text-sm font-semibold">País</label>
            <input id="country" name="country" defaultValue={dog?.country ?? "Chile"} className={inputClass} placeholder="Chile" />
          </div>
        </div>
        <label className="mt-6 flex cursor-pointer items-start gap-4 rounded-[1.5rem] border border-line bg-canvas p-4 sm:p-5">
          <input
            type="checkbox"
            name="isPublic"
            aria-label="Pasaporte público"
            defaultChecked={dog?.is_public ?? true}
            className="mt-1 size-4 accent-brand"
          />
          <span>
            <span className="flex items-center gap-2 font-semibold"><Globe2 size={18} className="text-brand" /> Pasaporte público</span>
            <span className="mt-1 block text-sm leading-6 text-ink-muted">Permite abrir su perfil por enlace o QR. Tu correo, notas privadas y datos de cuenta nunca se muestran.</span>
          </span>
        </label>
        {!dog?.is_public && dog ? (
          <div className="mt-3 flex items-center gap-2 text-xs text-ink-muted"><Lock size={14} /> Actualmente solo tú puedes ver este pasaporte.</div>
        ) : null}
      </section>

      <FormStatus state={state} />
      <div className="sticky bottom-24 z-20 flex justify-end rounded-[1.75rem] border border-line bg-white/95 p-3 shadow-float backdrop-blur lg:bottom-5">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? <LoaderCircle className="animate-spin" size={18} /> : dog ? <Save size={18} /> : <PawPrint size={18} />}
          {pending ? "Guardando…" : dog ? "Guardar pasaporte" : "Crear pasaporte"}
        </Button>
      </div>
    </form>
  );
}
