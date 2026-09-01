import type { Metadata } from "next";
import { CalendarHeart, MapPin, Sparkles } from "lucide-react";

import { DogCard } from "@/components/dogs/dog-card";
import { Badge } from "@/components/ui/badge";
import { getPublicDogs } from "@/lib/data/dogs";

export const metadata: Metadata = { title: "Descubrir perros" };

export default async function DiscoverPage() {
  const dogs = await getPublicDogs();
  return (
    <div>
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div className="max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-brand">Comunidad pública</p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Conoce sus historias.</h1>
          <p className="mt-4 text-base leading-7 text-ink-muted">Explora pasaportes que sus dueños eligieron compartir. Sin ubicaciones exactas ni información privada.</p>
        </div>
        <Badge tone="green" className="w-fit px-4 py-2">{dogs.length} pasaportes para explorar</Badge>
      </div>
      <div className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {dogs.map((dog) => <DogCard key={dog.id} dog={dog} publicView />)}
      </div>
      <section className="mt-14 rounded-[2.5rem] border border-line bg-white p-6 shadow-card sm:p-9">
        <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl"><Badge>Próximamente</Badge><h2 className="mt-4 font-display text-3xl font-semibold">Descubrimiento con contexto, no solo distancia.</h2><p className="mt-3 text-sm leading-6 text-ink-muted">La futura compatibilidad considerará tamaño, energía, edad, sociabilidad, estilo de juego y distancia aproximada.</p></div>
          <div className="grid gap-3 sm:grid-cols-3 lg:w-[520px]">
            {[{ icon: MapPin, label: "Perros cerca" }, { icon: Sparkles, label: "Compatibilidad" }, { icon: CalendarHeart, label: "Playdates" }].map(({ icon: Icon, label }) => <div key={label} className="rounded-2xl bg-surface-muted p-4 text-center text-sm font-semibold text-ink-muted"><Icon className="mx-auto mb-2" size={21} />{label}</div>)}
          </div>
        </div>
      </section>
    </div>
  );
}
