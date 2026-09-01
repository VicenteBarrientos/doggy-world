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
    <article className="edge-card overflow-hidden rounded-sm shadow-[6px_6px_0_var(--ink)]">
      <div className="grid sm:grid-cols-[220px_1fr]">
        <Link
          href={`/dogs/${dog.id}`}
          className="relative min-h-56 overflow-hidden border-b-2 border-ink bg-cream-deep sm:border-b-0 sm:border-r-2"
        >
          <DogAvatar src={dog.photo_url} name={dog.name} size="hero" className="size-full rounded-none" />
          <span className="absolute bottom-3 left-3 border-2 border-ink bg-sun px-2.5 py-1 font-display text-[0.65rem] uppercase text-ink shadow-[2px_2px_0_var(--ink)]">
            {dog.is_public ? "Público" : "Privado"}
          </span>
        </Link>
        <div className="p-5 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl uppercase tracking-[-0.03em]">{dog.name}</h2>
              <p className="mt-1 text-xs text-ink/70">
                {dog.breed} · {formatAge(dog.birth_date)}
              </p>
            </div>
            <Link
              href={`/dogs/${dog.id}`}
              className={buttonStyles({ variant: "outline", size: "sm", className: "shrink-0" })}
            >
              Ver <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
          <div className="mt-5">
            <Progress value={completeness} label="Pasaporte completo" />
          </div>
          <div className="mt-6 grid grid-cols-4 gap-2">
            <Link
              href={`/dogs/${dog.id}`}
              className="flex min-h-14 flex-col items-center justify-center gap-1 border-2 border-ink bg-cream px-1 text-center font-display text-[10px] uppercase shadow-[2px_2px_0_var(--ink)] transition hover:bg-sun"
            >
              <Heart size={16} aria-hidden="true" /> Perfil
            </Link>
            <Link
              href={`/dogs/${dog.id}/products`}
              className="flex min-h-14 flex-col items-center justify-center gap-1 border-2 border-ink bg-cream px-1 text-center font-display text-[10px] uppercase shadow-[2px_2px_0_var(--ink)] transition hover:bg-sun"
            >
              <Package size={16} aria-hidden="true" /> Productos
            </Link>
            <Link
              href={`/dogs/${dog.id}/friends`}
              className="flex min-h-14 flex-col items-center justify-center gap-1 border-2 border-ink bg-cream px-1 text-center font-display text-[10px] uppercase shadow-[2px_2px_0_var(--ink)] transition hover:bg-sun"
            >
              <Users size={16} aria-hidden="true" /> Amigos
            </Link>
            <Link
              href={`/dog/${dog.slug}#share`}
              className="flex min-h-14 flex-col items-center justify-center gap-1 border-2 border-ink bg-cream px-1 text-center font-display text-[10px] uppercase shadow-[2px_2px_0_var(--ink)] transition hover:bg-sun"
            >
              <Share2 size={16} aria-hidden="true" /> Compartir
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
