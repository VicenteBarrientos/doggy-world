import { ArrowRight, Heart, Package, Share2, Users } from "lucide-react";
import Link from "next/link";

import { DogAvatar } from "@/components/dogs/dog-avatar";
import { Progress } from "@/components/ui/progress";
import { buttonStyles } from "@/components/ui/button";
import { formatAge } from "@/lib/utils";
import type { DogWithPhoto } from "@/types/database";

export function DashboardDogCard({
  dog,
  completeness,
}: {
  dog: DogWithPhoto;
  completeness: number;
}) {
  return (
    <article className="overflow-hidden rounded-[2.25rem] border border-line bg-white shadow-card">
      <div className="grid sm:grid-cols-[220px_1fr]">
        <Link href={`/dogs/${dog.id}`} className="relative min-h-56 overflow-hidden bg-brand-soft">
          <DogAvatar src={dog.photo_url} name={dog.name} size="hero" className="size-full rounded-none" />
          <span className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-brand-strong backdrop-blur">
            {dog.is_public ? "Pasaporte público" : "Pasaporte privado"}
          </span>
        </Link>
        <div className="p-5 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl font-semibold tracking-[-0.03em]">{dog.name}</h2>
              <p className="mt-1 text-sm text-ink-muted">{dog.breed} · {formatAge(dog.birth_date)}</p>
            </div>
            <Link
              href={`/dogs/${dog.id}`}
              className={buttonStyles({ variant: "secondary", size: "sm", className: "shrink-0" })}
            >
              Ver <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
          <div className="mt-6">
            <Progress value={completeness} label="Perfil completo" />
          </div>
          <div className="mt-6 grid grid-cols-4 gap-2">
            <Link href={`/dogs/${dog.id}`} className="flex min-h-16 flex-col items-center justify-center gap-1 rounded-2xl bg-surface-muted px-2 text-center text-[11px] font-semibold text-ink-muted hover:bg-brand-soft hover:text-brand-strong">
              <Heart size={18} aria-hidden="true" /> Perfil
            </Link>
            <Link href={`/dogs/${dog.id}/products`} className="flex min-h-16 flex-col items-center justify-center gap-1 rounded-2xl bg-surface-muted px-2 text-center text-[11px] font-semibold text-ink-muted hover:bg-brand-soft hover:text-brand-strong">
              <Package size={18} aria-hidden="true" /> Productos
            </Link>
            <Link href={`/dogs/${dog.id}/friends`} className="flex min-h-16 flex-col items-center justify-center gap-1 rounded-2xl bg-surface-muted px-2 text-center text-[11px] font-semibold text-ink-muted hover:bg-brand-soft hover:text-brand-strong">
              <Users size={18} aria-hidden="true" /> Amigos
            </Link>
            <Link href={`/dog/${dog.slug}#share`} className="flex min-h-16 flex-col items-center justify-center gap-1 rounded-2xl bg-surface-muted px-2 text-center text-[11px] font-semibold text-ink-muted hover:bg-brand-soft hover:text-brand-strong">
              <Share2 size={18} aria-hidden="true" /> Compartir
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
