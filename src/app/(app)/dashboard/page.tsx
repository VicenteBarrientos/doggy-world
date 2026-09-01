import { ArrowRight, Compass, Package, PawPrint, Plus, QrCode, Users } from "lucide-react";
import Link from "next/link";

import { DashboardDogCard } from "@/components/dogs/dashboard-dog-card";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonStyles } from "@/components/ui/button";
import { getOwnerDog, getOwnerDogs } from "@/lib/data/dogs";
import { getFriendRequests } from "@/lib/data/friendships";
import { requireViewer } from "@/lib/data/viewer";
import { calculateProfileCompleteness } from "@/lib/utils";

export default async function DashboardPage() {
  const [viewer, dogs, friendRequests] = await Promise.all([
    requireViewer(),
    getOwnerDogs(),
    getFriendRequests(),
  ]);
  const dogDetails = await Promise.all(dogs.map((dog) => getOwnerDog(dog.id)));
  const completeness = new Map(
    dogs.map((dog, index) => [
      dog.id,
      calculateProfileCompleteness(dog, dogDetails[index]?.preferences ?? []),
    ]),
  );

  return (
    <div>
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="font-brush text-3xl text-electric">Tu manada</p>
          <h1 className="mt-1 text-4xl sm:text-6xl">
            Hola, {viewer.profile.display_name.split(" ")[0]} <span aria-hidden="true">🐾</span>
          </h1>
          <p className="mt-3 max-w-xl text-base leading-7 text-ink/75">
            Cada dato que agregas hace que el pasaporte de tus perros sea más útil y completo.
          </p>
        </div>
        <Link href="/dogs/new" className={buttonStyles({ variant: "primary", size: "lg" })}>
          <Plus size={18} aria-hidden="true" /> Agregar perro
        </Link>
      </div>

      <section id="dogs" className="mt-12 scroll-mt-28">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl">Tus perros</h2>
            <p className="mt-1 text-xs text-ink/70">
              {dogs.length === 1 ? "1 pasaporte activo" : `${dogs.length} pasaportes activos`}
            </p>
          </div>
        </div>
        {dogs.length ? (
          <div className="grid gap-6 xl:grid-cols-2">
            {dogs.map((dog) => (
              <DashboardDogCard
                key={dog.id}
                dog={dog}
                completeness={completeness.get(dog.id) ?? 0}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<PawPrint size={26} />}
            title="Tu primer pasaporte empieza aquí"
            description="Agrega a tu perro, sube su foto y crea una identidad digital que lo acompañará siempre."
            action={
              <Link href="/dogs/new" className={buttonStyles({ variant: "primary" })}>
                Agregar mi perro <ArrowRight size={16} aria-hidden="true" />
              </Link>
            }
          />
        )}
      </section>

      <section className="mt-16">
        <div>
          <p className="font-brush text-3xl text-electric">Hoy en su mundo</p>
          <h2 className="mt-1 text-3xl">Acciones de tu manada</h2>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <Link
            href="/friend-requests"
            className="edge-card group p-6 shadow-[6px_6px_0_var(--ink)] transition hover:-translate-y-1"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="flex size-12 items-center justify-center border-2 border-ink bg-sun shadow-[2px_2px_0_var(--ink)] text-ink">
                <Users size={22} />
              </span>
              <span className="font-display text-3xl text-electric">{friendRequests.length}</span>
            </div>
            <h3 className="mt-5 font-display text-xl uppercase">Solicitudes de amistad</h3>
            <p className="mt-2 text-xs leading-5 text-ink/75">
              Revisa quién quiere sumarse a su círculo.
            </p>
          </Link>
          <Link
            href="/products"
            className="edge-card group p-6 shadow-[6px_6px_0_var(--ink)] transition hover:-translate-y-1"
          >
            <span className="flex size-12 items-center justify-center border-2 border-ink bg-electric shadow-[2px_2px_0_var(--ink)] text-white">
              <Package size={22} />
            </span>
            <h3 className="mt-5 font-display text-xl uppercase">Registrar reacción</h3>
            <p className="mt-2 text-xs leading-5 text-ink/75">
              Convierte pruebas de juguetes y premios en feedback útil.
            </p>
          </Link>
          <Link
            href={dogs[0] ? `/dog/${dogs[0].slug}#share` : "/dogs/new"}
            className="edge-card group p-6 shadow-[6px_6px_0_var(--ink)] transition hover:-translate-y-1"
          >
            <span className="flex size-12 items-center justify-center border-2 border-ink bg-cream-deep shadow-[2px_2px_0_var(--ink)] text-ink">
              <QrCode size={22} />
            </span>
            <h3 className="mt-5 font-display text-xl uppercase">Compartir pasaporte</h3>
            <p className="mt-2 text-xs leading-5 text-ink/75">
              Abre el enlace o QR público de tu perro.
            </p>
          </Link>
          <Link
            href="/discover"
            className="edge-card group p-6 shadow-[6px_6px_0_var(--ink)] transition hover:-translate-y-1"
          >
            <span className="flex size-12 items-center justify-center border-2 border-ink bg-sun shadow-[2px_2px_0_var(--ink)] text-ink">
              <Compass size={22} />
            </span>
            <h3 className="mt-5 font-display text-xl uppercase">Conocer otros perros</h3>
            <p className="mt-2 text-xs leading-5 text-ink/75">
              Explora historias y perfiles de la comunidad.
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}
