import type { Metadata } from "next";
import { CalendarHeart, MapPin, Sparkles } from "lucide-react";

import { DogCard } from "@/components/dogs/dog-card";
import { Badge, ConstructionBadge } from "@/components/ui/badge";
import { getPublicDogs } from "@/lib/data/dogs";

export const metadata: Metadata = { title: "Descubrir perros" };

export default async function DiscoverPage() {
  const dogs = await getPublicDogs();
  return (
    <div>
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div className="max-w-2xl">
          <p className="font-brush text-3xl text-electric">Comunidad pública</p>
          <h1 className="mt-2 text-4xl sm:text-6xl">Conoce sus historias.</h1>
          <p className="mt-4 text-base leading-7 text-ink/75">
            Explora pasaportes que sus dueños eligieron compartir con la manada. Sin ubicaciones
            exactas ni datos privados.
          </p>
        </div>
        <Badge tone="electric" className="w-fit px-4 py-2 text-xs">
          {dogs.length} pasaportes para explorar
        </Badge>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {dogs.map((dog) => (
          <DogCard key={dog.id} dog={dog} publicView />
        ))}
      </div>

      <section className="edge-card mt-16 p-8 sm:p-10 shadow-[8px_8px_0_var(--ink)]">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <ConstructionBadge />
            <h2 className="mt-4 text-3xl sm:text-4xl">
              Descubrimiento con contexto, no solo distancia.
            </h2>
            <p className="mt-3 text-sm leading-6 text-ink/75">
              La futura compatibilidad considerará temperamento, energía, tamaño, edad,
              sociabilidad y estilo de juego entre perros.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:w-[500px]">
            {[
              { icon: MapPin, label: "Perros cerca" },
              { icon: Sparkles, label: "Compatibilidad" },
              { icon: CalendarHeart, label: "Playdates" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="border-2 border-ink bg-cream p-4 text-center text-xs font-display uppercase tracking-wider text-ink shadow-[2px_2px_0_var(--ink)]"
              >
                <Icon className="mx-auto mb-2 text-electric" size={22} />
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
