import { ArrowUpRight, MapPin, Sparkles, Zap } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { DogAvatar } from "@/components/dogs/dog-avatar";
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
      className="group block overflow-hidden rounded-[2rem] border border-line bg-white shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-float"
    >
      <div className="relative aspect-[5/4] overflow-hidden bg-brand-soft">
        <DogAvatar
          src={dog.photo_url}
          name={dog.name}
          size="hero"
          className="size-full rounded-none transition duration-500 group-hover:scale-[1.03]"
        />
        <span className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full bg-white/90 text-ink shadow-sm backdrop-blur">
          <ArrowUpRight size={18} aria-hidden="true" />
        </span>
      </div>
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-2xl font-semibold tracking-[-0.02em]">{dog.name}</h3>
            <p className="mt-0.5 text-sm text-ink-muted">
              {dog.breed} · {formatAge(dog.birth_date)}
            </p>
          </div>
          {dog.is_public ? <Badge tone="green">Público</Badge> : <Badge>Privado</Badge>}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge tone="orange">
            <Zap size={13} aria-hidden="true" /> Energía {energy?.toLowerCase()}
          </Badge>
          <Badge tone="green">
            <Sparkles size={13} aria-hidden="true" /> {sociability}
          </Badge>
          {dog.personality_tags[0] ? <Badge>{personalityLabel(dog.personality_tags[0])}</Badge> : null}
        </div>
        {dog.city ? (
          <p className="mt-4 flex items-center gap-1.5 text-xs text-ink-muted">
            <MapPin size={14} aria-hidden="true" /> {dog.city}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
