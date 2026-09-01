import type { Metadata } from "next";
import { Eye, LockKeyhole, MapPinned, ShieldCheck } from "lucide-react";

import { ProfileForm } from "@/components/profile/profile-form";
import { Badge } from "@/components/ui/badge";
import { requireViewer } from "@/lib/data/viewer";
import { getInitials } from "@/lib/utils";

export const metadata: Metadata = { title: "Mi perfil" };

export default async function SettingsPage() {
  const viewer = await requireViewer();
  return (
    <div className="mx-auto max-w-5xl">
      <div className="max-w-2xl">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-brand">Tu cuenta</p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Perfil del dueño</h1>
        <p className="mt-4 text-base leading-7 text-ink-muted">Esta información administra tu cuenta. Los perfiles públicos muestran al perro, no tus datos de acceso.</p>
      </div>
      <div className="mt-9 grid gap-6 lg:grid-cols-[1fr_300px]">
        <section className="rounded-[2.25rem] border border-line bg-white p-6 shadow-card sm:p-8">
          <div className="mb-7 flex items-center gap-4">
            <div className="flex size-16 items-center justify-center rounded-[1.5rem] bg-brand text-xl font-bold text-white">{getInitials(viewer.profile.display_name)}</div>
            <div><h2 className="font-display text-2xl font-semibold">{viewer.profile.display_name}</h2><p className="text-sm text-ink-muted">{viewer.profile.username ? `@${viewer.profile.username}` : "Sin nombre de usuario"}</p></div>
          </div>
          {viewer.isDemo ? <Badge tone="yellow" className="mb-5">Vista demo · edición deshabilitada</Badge> : null}
          <ProfileForm profile={viewer.profile} email={viewer.email} disabled={viewer.isDemo} />
        </section>
        <aside className="space-y-4">
          {[{ icon: LockKeyhole, title: "Correo privado", copy: "Solo se usa para autenticar tu cuenta." }, { icon: MapPinned, title: "Ubicación amplia", copy: "Guardamos ciudad y país, nunca una dirección exacta." }, { icon: Eye, title: "Visibilidad por perro", copy: "Cada pasaporte puede ser público o privado." }, { icon: ShieldCheck, title: "RLS activo", copy: "La base de datos valida quién puede leer y cambiar cada fila." }].map(({ icon: Icon, title, copy }) => (
            <article key={title} className="rounded-[1.75rem] border border-line bg-white p-5 shadow-card"><Icon className="text-brand" size={21} /><h3 className="mt-4 font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-ink-muted">{copy}</p></article>
          ))}
        </aside>
      </div>
    </div>
  );
}
