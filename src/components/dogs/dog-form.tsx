"use client";

import { AlertCircle, Camera, Check, Globe2, LoaderCircle, Lock, PawPrint, Save, Sparkles, Upload } from "lucide-react";
import Image from "next/image";
import { useActionState, useEffect, useState } from "react";

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
import { track } from "@/lib/analytics";
import { processDogPhoto } from "@/lib/client-photo";
import type { DogWithPhoto } from "@/types/database";

const inputClass =
  "mt-2 min-h-12 w-full rounded-sm border-2 border-ink bg-white px-4 py-2.5 text-sm text-ink shadow-[2px_2px_0_var(--ink)] placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-electric";

export function DogForm({ dog }: { dog?: DogWithPhoto }) {
  const action = dog ? updateDogAction : createDogAction;
  const [state, formAction, pending] = useActionState(action, initialActionState);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(dog?.photo_url ?? null);
  const [photoState, setPhotoState] = useState<"idle" | "processing" | "ready" | "error">(
    dog?.photo_url ? "ready" : "idle",
  );
  const [photoStats, setPhotoStats] = useState<{
    originalSize: number;
    processedSize: number;
  } | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);

  useEffect(() => {
    track("dog_creation_started", { is_edit: Boolean(dog) });
  }, [dog]);

  useEffect(() => {
    return () => {
      if (photoPreview && photoPreview.startsWith("blob:")) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setPhotoError(null);
    if (!file) {
      return;
    }

    setPhotoState("processing");
    try {
      const processed = await processDogPhoto(file);
      setPhotoFile(processed.file);
      setPhotoPreview(processed.previewUrl);
      setPhotoStats({
        originalSize: processed.originalSize,
        processedSize: processed.processedSize,
      });
      setPhotoState("ready");
      track("dog_photo_uploaded", { size_kb: Math.round(processed.processedSize / 1024) });
    } catch (err) {
      setPhotoState("error");
      const message =
        err instanceof Error && err.message.includes("No pudimos")
          ? err.message
          : "No pudimos procesar esta foto. Intenta elegir otra imagen o guardarla como JPG.";
      setPhotoError(message);
    }
  }

  return (
    <form
      action={async (formData) => {
        if (photoFile) {
          formData.set("photo", photoFile);
        }
        return formAction(formData);
      }}
      className="space-y-6"
      noValidate
    >
      {dog ? <input type="hidden" name="id" value={dog.id} /> : null}

      {/* 1. FOTO DEL PERRO */}
      <section className="edge-card p-6 shadow-[6px_6px_0_var(--ink)] sm:p-8">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center border-2 border-ink bg-sun shadow-[2px_2px_0_var(--ink)] text-ink">
            <Camera size={22} />
          </span>
          <div>
            <h2 className="font-display text-2xl uppercase tracking-tight">Su mejor foto</h2>
            <p className="text-xs text-ink/75">
              JPG, PNG, WebP o HEIC · Optimización automática para móviles · Se verá en su pasaporte canónico
            </p>
          </div>
        </div>

        <div className="mt-6 grid items-center gap-6 sm:grid-cols-[180px_1fr]">
          <div className="relative aspect-square overflow-hidden border-2 border-ink bg-cream-deep text-ink shadow-[4px_4px_0_var(--ink)]">
            {photoPreview ? (
              <Image
                src={photoPreview}
                alt="Vista previa de la foto"
                fill
                sizes="180px"
                className="object-cover"
                unoptimized={photoPreview.startsWith("blob:")}
              />
            ) : (
              <div className="flex size-full flex-col items-center justify-center gap-2 p-4 text-center text-ink/40">
                <PawPrint size={48} strokeWidth={1.5} />
                <span className="font-display text-[10px] uppercase">Sin foto aún</span>
              </div>
            )}
            {photoState === "processing" ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-cream/80 backdrop-blur-xs">
                <LoaderCircle className="animate-spin text-electric" size={28} />
                <span className="mt-2 font-display text-[11px] uppercase tracking-wider text-ink">
                  Preparando foto…
                </span>
              </div>
            ) : null}
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <label
                htmlFor="photo"
                className="inline-flex cursor-pointer items-center gap-2 border-2 border-ink bg-white px-5 py-3 font-display text-xs uppercase tracking-wider text-ink shadow-[3px_3px_0_var(--ink)] transition hover:-translate-y-0.5 hover:bg-sun disabled:opacity-50"
              >
                {photoState === "processing" ? (
                  <LoaderCircle className="animate-spin" size={16} />
                ) : (
                  <Upload size={16} />
                )}
                {photoPreview ? "Cambiar foto" : "Elegir foto del perro"}
              </label>
              <input
                id="photo"
                name="photo"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
                className="sr-only"
                onChange={handleFileChange}
                disabled={photoState === "processing" || pending}
              />
            </div>

            {photoState === "processing" ? (
              <p className="flex items-center gap-1.5 text-xs font-semibold text-electric">
                <LoaderCircle className="animate-spin" size={14} /> Preparando foto…
              </p>
            ) : null}

            {photoState === "ready" && photoFile ? (
              <div className="space-y-1">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-ink">
                  <Check size={16} className="text-electric" /> Foto lista · {photoFile.name} (
                  {(photoFile.size / 1024).toFixed(0)} KB)
                </p>
                {photoStats && photoStats.originalSize > photoStats.processedSize * 1.15 ? (
                  <p className="flex items-center gap-1 text-[11px] text-ink/75">
                    <Sparkles size={13} className="text-electric" /> Optimizada automáticamente desde{" "}
                    {(photoStats.originalSize / 1024 / 1024).toFixed(1)} MB para carga rápida.
                  </p>
                ) : null}
              </div>
            ) : !photoPreview ? (
              <p className="text-xs text-ink/70">
                Una foto cuadrada o de retrato tomada con tu teléfono resaltará en su pasaporte.
              </p>
            ) : null}

            {pending ? (
              <p className="flex items-center gap-1.5 text-xs font-semibold text-electric">
                <LoaderCircle className="animate-spin" size={14} /> Subiendo foto…
              </p>
            ) : null}

            {photoError ? (
              <p className="flex items-center gap-1.5 text-xs font-semibold text-danger" role="alert">
                <AlertCircle size={15} /> {photoError}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      {/* 2. DATOS ESENCIALES */}
      <section className="edge-card p-6 shadow-[6px_6px_0_var(--ink)] sm:p-8">
        <div>
          <p className="font-brush text-2xl text-electric">Identidad</p>
          <h2 className="mt-1 font-display text-3xl uppercase tracking-tight">
            Lo esencial de su pasaporte
          </h2>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="block font-display text-xs uppercase tracking-wider text-ink">
              Nombre *
            </label>
            <input
              id="name"
              name="name"
              required
              defaultValue={dog?.name}
              className={inputClass}
              placeholder="Ej: Rocky, Luna, Milo..."
            />
            <FieldError errors={state.fieldErrors?.name} />
          </div>

          <div>
            <label htmlFor="breed" className="block font-display text-xs uppercase tracking-wider text-ink">
              Raza o mezcla *
            </label>
            <input
              id="breed"
              name="breed"
              required
              defaultValue={dog?.breed}
              className={inputClass}
              placeholder="Ej: Golden Retriever, Mestizo, Poodle..."
            />
            <FieldError errors={state.fieldErrors?.breed} />
          </div>

          <div>
            <label htmlFor="sex" className="block font-display text-xs uppercase tracking-wider text-ink">
              Sexo
            </label>
            <select id="sex" name="sex" defaultValue={dog?.sex ?? "unknown"} className={inputClass}>
              <option value="unknown">Prefiero no indicar</option>
              <option value="female">Hembra</option>
              <option value="male">Macho</option>
            </select>
          </div>

          <div>
            <label htmlFor="weightKg" className="block font-display text-xs uppercase tracking-wider text-ink">
              Peso aproximado (kg)
            </label>
            <input
              id="weightKg"
              name="weightKg"
              type="number"
              min="0.1"
              max="150"
              step="0.1"
              defaultValue={dog?.weight_kg ?? ""}
              className={inputClass}
              placeholder="Ej: 14.5"
            />
            <FieldError errors={state.fieldErrors?.weightKg} />
          </div>

          <div>
            <label htmlFor="birthDate" className="block font-display text-xs uppercase tracking-wider text-ink">
              Fecha de nacimiento
            </label>
            <input
              id="birthDate"
              name="birthDate"
              type="date"
              defaultValue={dog?.birth_date ?? ""}
              className={inputClass}
            />
            <FieldError errors={state.fieldErrors?.birthDate} />
          </div>

          <div>
            <label htmlFor="adoptionDate" className="block font-display text-xs uppercase tracking-wider text-ink">
              Llegó a la familia
            </label>
            <input
              id="adoptionDate"
              name="adoptionDate"
              type="date"
              defaultValue={dog?.adoption_date ?? ""}
              className={inputClass}
            />
            <FieldError errors={state.fieldErrors?.adoptionDate} />
          </div>
        </div>

        <label className="mt-5 flex items-center gap-3 border-2 border-ink bg-cream p-3 text-xs font-semibold uppercase tracking-wide">
          <input
            type="checkbox"
            name="mixedBreed"
            defaultChecked={dog?.mixed_breed}
            className="size-4 accent-electric"
          />
          Es mestizo o mezcla de razas
        </label>
      </section>

      {/* 3. VISIBILIDAD & PRIVACIDAD */}
      <section className="edge-card p-6 shadow-[6px_6px_0_var(--ink)] sm:p-8">
        <div>
          <p className="font-brush text-2xl text-electric">Visibilidad</p>
          <h2 className="mt-1 font-display text-3xl uppercase tracking-tight">
            Pasaporte público
          </h2>
        </div>

        <label className="mt-5 flex cursor-pointer items-start gap-3.5 border-2 border-ink bg-cream p-4 shadow-[2px_2px_0_var(--ink)] sm:p-5">
          <input
            type="checkbox"
            name="isPublic"
            aria-label="Pasaporte público"
            defaultChecked={dog?.is_public ?? true}
            className="mt-1 size-5 accent-electric"
          />
          <div>
            <span className="flex items-center gap-2 font-display text-sm uppercase text-ink">
              <Globe2 size={18} className="text-electric" /> Pasaporte público (Recomendado)
            </span>
            <span className="mt-1 block text-xs leading-5 text-ink/75">
              Permite compartir el pasaporte con amigos o imprimir el código QR. Tu correo,
              dirección exacta y datos privados nunca se expondrán.
            </span>
          </div>
        </label>
        {!dog?.is_public && dog ? (
          <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-ink/70">
            <Lock size={14} /> Actualmente solo tú puedes ver este pasaporte.
          </div>
        ) : null}
      </section>

      {/* 4. DETALLES AVANZADOS (PERSONALIDAD, TAMAÑO, BIOGRAFÍA) */}
      <section className="edge-card p-6 shadow-[6px_6px_0_var(--ink)] sm:p-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-brush text-2xl text-electric">Detalles adicionales</p>
            <h2 className="mt-1 font-display text-2xl uppercase tracking-tight">
              Personalidad, tamaño y biografía (opcional)
            </h2>
            <p className="mt-1 text-xs text-ink/70">
              Puedes completarlos ahora o editarlos cuando quieras desde su pasaporte.
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-6 border-t-2 border-ink pt-6">
          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <label htmlFor="size" className="block font-display text-xs uppercase tracking-wider text-ink">
                Tamaño
              </label>
              <select id="size" name="size" defaultValue={dog?.size ?? "medium"} className={inputClass}>
                {sizeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="energyLevel" className="block font-display text-xs uppercase tracking-wider text-ink">
                Nivel de energía
              </label>
              <select
                id="energyLevel"
                name="energyLevel"
                defaultValue={dog?.energy_level ?? "medium"}
                className={inputClass}
              >
                {energyOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="sociability" className="block font-display text-xs uppercase tracking-wider text-ink">
                Sociabilidad
              </label>
              <select
                id="sociability"
                name="sociability"
                defaultValue={dog?.sociability ?? "social"}
                className={inputClass}
              >
                {sociabilityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="city" className="block font-display text-xs uppercase tracking-wider text-ink">
                Ciudad o Barrio
              </label>
              <input
                id="city"
                name="city"
                defaultValue={dog?.city ?? ""}
                className={inputClass}
                placeholder="Ej: Providencia, Santiago"
              />
            </div>
            <div>
              <label htmlFor="country" className="block font-display text-xs uppercase tracking-wider text-ink">
                País
              </label>
              <input
                id="country"
                name="country"
                defaultValue={dog?.country ?? "Chile"}
                className={inputClass}
                placeholder="Chile"
              />
            </div>
          </div>

            <div>
              <fieldset>
                <legend className="font-display text-xs uppercase tracking-wider text-ink">
                  Rasgos de personalidad <span className="font-normal text-ink/70">· elige hasta 6</span>
                </legend>
                <div className="mt-3 flex flex-wrap gap-2">
                  {personalityOptions.map((option) => (
                    <label key={option.value} className="group cursor-pointer">
                      <input
                        type="checkbox"
                        name="personalityTags"
                        value={option.value}
                        defaultChecked={dog?.personality_tags.includes(option.value)}
                        className="peer sr-only"
                      />
                      <span className="inline-flex min-h-9 items-center gap-1.5 border-2 border-ink bg-white px-3 py-1.5 font-display text-xs uppercase tracking-wider text-ink shadow-[2px_2px_0_var(--ink)] transition peer-checked:bg-sun">
                        <span>{option.emoji}</span> {option.label}
                        <Check className="hidden peer-checked:block" size={13} />
                      </span>
                    </label>
                  ))}
                </div>
                <FieldError errors={state.fieldErrors?.personalityTags} />
              </fieldset>
            </div>

            <div>
              <label htmlFor="bio" className="block font-display text-xs uppercase tracking-wider text-ink">
                Su historia
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={4}
                defaultValue={dog?.bio}
                className={`${inputClass} resize-y`}
                placeholder="¿Qué lo hace especial? ¿Qué le gusta hacer cuando sale al parque?"
              />
              <FieldError errors={state.fieldErrors?.bio} />
            </div>
          </div>
      </section>

      <FormStatus state={state} />

      {/* 5. BOTÓN SUBMIT FIJO */}
      <div className="sticky bottom-20 z-20 flex justify-end border-2 border-ink bg-cream p-4 shadow-[4px_4px_0_var(--ink)] lg:bottom-4">
        <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
          {pending ? (
            <LoaderCircle className="animate-spin" size={18} />
          ) : dog ? (
            <Save size={18} />
          ) : (
            <PawPrint size={18} />
          )}
          {pending
            ? "Guardando pasaporte…"
            : dog
              ? "Guardar pasaporte"
              : "Crear pasaporte"}
        </Button>
      </div>
    </form>
  );
}
