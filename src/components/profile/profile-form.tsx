"use client";

import { LoaderCircle, Save } from "lucide-react";
import { useActionState } from "react";

import { updateProfileAction } from "@/app/actions/profile";
import { Button } from "@/components/ui/button";
import { FieldError, FormStatus } from "@/components/ui/form-feedback";
import { initialActionState } from "@/lib/forms";
import type { Profile } from "@/types/database";

const inputClass = "mt-2 min-h-12 w-full rounded-2xl border border-line bg-white px-4 py-3";

export function ProfileForm({ profile, email, disabled }: { profile: Profile; email: string | null; disabled: boolean }) {
  const [state, action, pending] = useActionState(updateProfileAction, initialActionState);
  return (
    <form action={action} className="space-y-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="displayName" className="text-sm font-semibold">Nombre visible</label>
          <input id="displayName" name="displayName" defaultValue={profile.display_name} required className={inputClass} disabled={disabled} />
          <FieldError errors={state.fieldErrors?.displayName} />
        </div>
        <div>
          <label htmlFor="username" className="text-sm font-semibold">Nombre de usuario</label>
          <input id="username" name="username" defaultValue={profile.username ?? ""} className={inputClass} placeholder="sofi_perruna" disabled={disabled} />
          <FieldError errors={state.fieldErrors?.username} />
        </div>
        <div>
          <label htmlFor="city" className="text-sm font-semibold">Ciudad</label>
          <input id="city" name="city" defaultValue={profile.city ?? ""} className={inputClass} placeholder="Santiago" disabled={disabled} />
        </div>
        <div>
          <label htmlFor="country" className="text-sm font-semibold">País</label>
          <input id="country" name="country" defaultValue={profile.country ?? ""} className={inputClass} placeholder="Chile" disabled={disabled} />
        </div>
      </div>
      <div>
        <label htmlFor="account-email" className="text-sm font-semibold">Correo de la cuenta</label>
        <input id="account-email" value={email ?? "No disponible"} disabled className={`${inputClass} cursor-not-allowed bg-surface-muted text-ink-muted`} />
        <p className="mt-2 text-xs text-ink-muted">Tu correo nunca aparece en pasaportes públicos.</p>
      </div>
      <FormStatus state={state} />
      <Button type="submit" disabled={pending || disabled}>
        {pending ? <LoaderCircle className="animate-spin" size={17} /> : <Save size={17} />}
        Guardar perfil
      </Button>
    </form>
  );
}
