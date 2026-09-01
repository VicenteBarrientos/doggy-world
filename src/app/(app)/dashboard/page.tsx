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
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-brand">Tu manada</p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
            Hola, {viewer.profile.display_name.split(" ")[0]} <span aria-hidden="true">👋</span>
          </h1>
          <p className="mt-3 max-w-xl text-base leading-7 text-ink-muted">
            Cada dato que agregas hace que el mundo de tus perros sea un poco más útil.
          </p>
        </div>
        <Link href="/dogs/new" className={buttonStyles({ size: "lg" })}>
          <Plus size={18} aria-hidden="true" /> Agregar perro
        </Link>
      </div>

      <section id="dogs" className="mt-10 scroll-mt-28">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-semibold">Tus perros</h2>
            <p className="mt-1 text-sm text-ink-muted">{dogs.length === 1 ? "1 pasaporte" : `${dogs.length} pasaportes`} bajo tu cuidado</p>
          </div>
        </div>
        {dogs.length ? (
          <div className="grid gap-6 xl:grid-cols-2">
            {dogs.map((dog) => (
              <DashboardDogCard key={dog.id} dog={dog} completeness={completeness.get(dog.id) ?? 0} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<PawPrint size={26} />}
            title="Tu primer pasaporte empieza aquí"
            description="Agrega a tu perro, sube su mejor foto y crea una identidad que seguirá creciendo con él."
            action={
              <Link href="/dogs/new" className={buttonStyles()}>
                Agregar mi perro <ArrowRight size={16} aria-hidden="true" />
              </Link>
            }
          />
        )}
      </section>

      <section className="mt-12">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-brand">Hoy en su mundo</p>
          <h2 className="mt-2 font-display text-3xl font-semibold">Acciones útiles, sin ruido.</h2>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Link href="/friend-requests" className="group rounded-[2rem] border border-line bg-white p-6 shadow-card transition hover:-translate-y-1">
            <div className="flex items-start justify-between gap-3">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-brand-soft text-brand"><Users size={22} /></span>
              <span className="font-display text-3xl font-semibold text-brand">{friendRequests.length}</span>
            </div>
            <h3 className="mt-5 font-semibold">Solicitudes de amistad</h3>
            <p className="mt-2 text-sm leading-6 text-ink-muted">Revisa quién quiere sumarse a su círculo.</p>
          </Link>
          <Link href="/products" className="group rounded-[2rem] border border-line bg-white p-6 shadow-card transition hover:-translate-y-1">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-accent-soft text-[#9f582b]"><Package size={22} /></span>
            <h3 className="mt-5 font-semibold">Registrar una reacción</h3>
            <p className="mt-2 text-sm leading-6 text-ink-muted">Convierte una prueba de producto en datos útiles.</p>
          </Link>
          <Link href={dogs[0] ? `/dog/${dogs[0].slug}#share` : "/dogs/new"} className="group rounded-[2rem] border border-line bg-white p-6 shadow-card transition hover:-translate-y-1">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-[#e8e4ff] text-[#6857a8]"><QrCode size={22} /></span>
            <h3 className="mt-5 font-semibold">Compartir pasaporte</h3>
            <p className="mt-2 text-sm leading-6 text-ink-muted">Abre el enlace o QR público de tu perro.</p>
          </Link>
          <Link href="/discover" className="group rounded-[2rem] border border-line bg-white p-6 shadow-card transition hover:-translate-y-1">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-[#fff1bd] text-[#856414]"><Compass size={22} /></span>
            <h3 className="mt-5 font-semibold">Conocer otros perros</h3>
            <p className="mt-2 text-sm leading-6 text-ink-muted">Explora pasaportes públicos de la comunidad.</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
