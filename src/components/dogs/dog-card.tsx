import { ArrowUpRight, MapPin, Sparkles, Zap } from "lucide-react";
import Link from "next/link";

import { DogAvatar } from "@/components/dogs/dog-avatar";
import { Badge } from "@/components/ui/badge";
import { energyOptions, sociabilityOptions } from "@/lib/constants";
import { formatAge, personalityLabel } from "@/lib/utils";
import type { DogWithPhoto } from "@/types/database";

export function DogCard({
  dog,
  href,
  publicView = false,
}: {
  dog: DogWithPhoto;
  href?: string;
  publicView?: boolean;
}) {
  const energy = energyOptions.find((option) => option.value === dog.energy_level)?.label;
  const sociability = sociabilityOptions.find(
    (option) => option.value === dog.sociability,
  )?.label;
  const destination = href ?? (publicView ? `/dog/${dog.slug}` : `/dogs/${dog.id}`);

  return (
    <Link
      href={destination}
      className="edge-card group block overflow-hidden rounded-sm transition duration-200 hover:-translate-y-1 hover:shadow-[8px_8px_0_var(--ink)]"
    >
      <div className="relative aspect-[5/4] overflow-hidden border-b-2 border-ink bg-cream-deep">
        <DogAvatar
          src={dog.photo_url}
          name={dog.name}
          size="hero"
          className="size-full rounded-none transition duration-500 group-hover:scale-105"
        />
        <span className="absolute right-3 top-3 flex size-9 items-center justify-center border-2 border-ink bg-white shadow-[2px_2px_0_var(--ink)] text-ink">
          <ArrowUpRight size={18} aria-hidden="true" />
        </span>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-2xl uppercase tracking-[-0.02em]">{dog.name}</h3>
            <p className="mt-0.5 text-xs text-ink/75">
              {dog.breed} · {formatAge(dog.birth_date)}
            </p>
          </div>
          {dog.is_public ? <Badge tone="electric">Público</Badge> : <Badge>Privado</Badge>}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge tone="yellow">
            <Zap size={12} aria-hidden="true" /> Energía {energy?.toLowerCase()}
          </Badge>
          <Badge tone="electric">
            <Sparkles size={12} aria-hidden="true" /> {sociability}
          </Badge>
          {dog.personality_tags[0] ? <Badge>{personalityLabel(dog.personality_tags[0])}</Badge> : null}
        </div>
        {dog.city ? (
          <p className="mt-4 flex items-center gap-1.5 text-xs text-ink/70">
            <MapPin size={13} aria-hidden="true" /> {dog.city}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
