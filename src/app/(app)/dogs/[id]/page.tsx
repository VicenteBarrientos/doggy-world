import type { Metadata } from "next";
import {
  ArrowLeft,
  CalendarDays,
  Edit3,
  Globe2,
  Package,
  QrCode,
  Ruler,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DeleteDogButton } from "@/components/dogs/delete-dog-button";
import { DogAvatar } from "@/components/dogs/dog-avatar";
import { PreferenceForm } from "@/components/dogs/preference-form";
import { ProductVisual } from "@/components/products/product-visual";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  energyOptions,
  preferenceCategoryLabels,
  sociabilityOptions,
} from "@/lib/constants";
import { getOwnerDog, getProducts } from "@/lib/data/dogs";
import { getDogFriends } from "@/lib/data/friendships";
import {
  calculateProfileCompleteness,
  formatAge,
  formatWeight,
  personalityLabel,
} from "@/lib/utils";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const data = await getOwnerDog(id);
  return { title: data ? `${data.dog.name} · Pasaporte` : "Pasaporte" };
}

export default async function DogManagementPage({ params }: Props) {
  const { id } = await params;
  const [data, products, friends] = await Promise.all([
    getOwnerDog(id),
    getProducts(),
    getDogFriends(id),
  ]);
  if (!data) notFound();

  const { dog, preferences, interactions } = data;
  const completeness = calculateProfileCompleteness(dog, preferences);
  const productMap = new Map(products.map((product) => [product.id, product]));
  const favoriteProducts = interactions
    .filter((interaction) => interaction.favorite)
    .map((interaction) => productMap.get(interaction.product_id))
    .filter((product) => Boolean(product));
  const energy = energyOptions.find((item) => item.value === dog.energy_level)?.label;
  const sociability = sociabilityOptions.find((item) => item.value === dog.sociability)?.label;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/dashboard" className={buttonStyles({ variant: "ghost", size: "sm", className: "-ml-3" })}>
          <ArrowLeft size={16} /> Tus perros
        </Link>
        <div className="flex flex-wrap gap-2">
          <Link href={`/dogs/${dog.id}/edit`} className={buttonStyles({ variant: "secondary", size: "sm" })}>
            <Edit3 size={16} /> Editar
          </Link>
          {dog.is_public ? (
            <Link href={`/dog/${dog.slug}#share`} className={buttonStyles({ size: "sm" })}>
              <QrCode size={16} /> Compartir
            </Link>
          ) : null}
        </div>
      </div>

      <section className="mt-6 overflow-hidden rounded-[2.75rem] bg-brand text-white shadow-float">
        <div className="grid lg:grid-cols-[.86fr_1.14fr]">
          <DogAvatar src={dog.photo_url} name={dog.name} size="hero" priority className="min-h-[420px] rounded-none lg:min-h-[600px]" />
          <div className="passport-grid relative flex flex-col justify-between p-7 sm:p-10 lg:p-14">
            <div className="absolute right-6 top-6"><Badge className="bg-white/12 text-white backdrop-blur">Doggy Passport</Badge></div>
            <div className="pt-16 sm:pt-12">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-white/65">Identidad #{dog.id.replaceAll("-", "").slice(0, 6).toUpperCase()}</p>
              <h1 className="mt-4 font-display text-6xl font-semibold tracking-[-0.055em] sm:text-7xl">{dog.name}</h1>
              <p className="mt-3 text-lg text-white/75">{dog.breed} · {formatAge(dog.birth_date)}</p>
              <div className="mt-7 flex flex-wrap gap-2">
                {dog.personality_tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-white/12 px-4 py-2 text-sm font-semibold backdrop-blur">{personalityLabel(tag)}</span>
                ))}
              </div>
              {dog.bio ? <p className="mt-8 max-w-xl text-lg leading-8 text-white/78">“{dog.bio}”</p> : null}
            </div>
            <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-2xl bg-white/10 p-4"><Ruler size={18} className="text-white/60" /><p className="mt-3 text-xs text-white/60">Peso</p><p className="mt-1 font-semibold">{formatWeight(dog.weight_kg)}</p></div>
              <div className="rounded-2xl bg-white/10 p-4"><Zap size={18} className="text-white/60" /><p className="mt-3 text-xs text-white/60">Energía</p><p className="mt-1 font-semibold">{energy}</p></div>
              <div className="rounded-2xl bg-white/10 p-4"><Sparkles size={18} className="text-white/60" /><p className="mt-3 text-xs text-white/60">Sociabilidad</p><p className="mt-1 font-semibold">{sociability}</p></div>
              <div className="rounded-2xl bg-white/10 p-4"><CalendarDays size={18} className="text-white/60" /><p className="mt-3 text-xs text-white/60">Miembro desde</p><p className="mt-1 font-semibold">{new Date(dog.created_at).getFullYear()}</p></div>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <section className="rounded-[2.25rem] border border-line bg-white p-6 shadow-card sm:p-8">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-brand">Sus gustos</p>
                <h2 className="mt-2 font-display text-3xl font-semibold">Preferencias estructuradas</h2>
              </div>
              <Badge tone="green">{preferences.length} registradas</Badge>
            </div>
            {preferences.length ? (
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {preferences.map((preference) => (
                  <article key={preference.id} className="rounded-2xl border border-line bg-white p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.12em] text-ink-muted">{preferenceCategoryLabels[preference.category]}</p>
                        <h3 className="mt-1 font-semibold">{preference.value}</h3>
                      </div>
                      <span className="text-xl" aria-label={preference.sentiment > 0 ? "Le gusta" : preference.sentiment < 0 ? "No le gusta" : "Indiferente"}>
                        {preference.sentiment >= 2 ? "😍" : preference.sentiment === 1 ? "🙂" : preference.sentiment === 0 ? "😐" : "👎"}
                      </span>
                    </div>
                    <p className="mt-3 text-xs text-ink-muted">{preference.is_public ? "Visible en el perfil público" : "Solo para ti"}</p>
                  </article>
                ))}
              </div>
            ) : (
              <p className="mt-5 rounded-2xl bg-surface-muted p-4 text-sm text-ink-muted">Todavía no hay preferencias. Agrega la primera para enriquecer su pasaporte.</p>
            )}
            <div className="mt-6"><PreferenceForm dogId={dog.id} /></div>
          </section>

          <section className="rounded-[2.25rem] border border-line bg-white p-6 shadow-card sm:p-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-brand">Lo que funciona</p>
                <h2 className="mt-2 font-display text-3xl font-semibold">Productos favoritos</h2>
              </div>
              <Link href={`/dogs/${dog.id}/products`} className={buttonStyles({ variant: "secondary", size: "sm" })}>Dar feedback</Link>
            </div>
            {favoriteProducts.length ? (
              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {favoriteProducts.map((product) => product ? (
                  <Link key={product.id} href={`/dogs/${dog.id}/products?product=${product.id}`} className="group">
                    <ProductVisual product={product} />
                    <p className="mt-3 text-sm font-semibold group-hover:text-brand">{product.name}</p>
                  </Link>
                ) : null)}
              </div>
            ) : (
              <p className="mt-5 rounded-2xl bg-surface-muted p-4 text-sm text-ink-muted">Aún no marcaste productos favoritos. Una opinión toma menos de un minuto.</p>
            )}
          </section>
        </div>

        <aside className="space-y-5">
          <section className="rounded-[2rem] border border-line bg-white p-6 shadow-card">
            <Progress value={completeness} label="Perfil completo" />
            <p className="mt-4 text-sm leading-6 text-ink-muted">
              {completeness === 100 ? "Su pasaporte tiene todos los elementos esenciales." : "Una foto, su historia y preferencias hacen que el perfil sea más útil."}
            </p>
            <Link href={`/dogs/${dog.id}/edit`} className={buttonStyles({ variant: "secondary", size: "sm", className: "mt-5 w-full" })}>Completar perfil</Link>
          </section>
          <section className="rounded-[2rem] border border-line bg-white p-6 shadow-card">
            <h2 className="font-display text-2xl font-semibold">Su mundo</h2>
            <div className="mt-5 space-y-2">
              <Link href={`/dogs/${dog.id}/friends`} className="flex items-center justify-between rounded-2xl bg-surface-muted p-4 text-sm font-semibold hover:bg-brand-soft"><span className="flex items-center gap-2"><Users size={17} /> Amigos</span><span>{friends.length}</span></Link>
              <Link href={`/dogs/${dog.id}/products`} className="flex items-center justify-between rounded-2xl bg-surface-muted p-4 text-sm font-semibold hover:bg-brand-soft"><span className="flex items-center gap-2"><Package size={17} /> Opiniones</span><span>{interactions.length}</span></Link>
              {dog.is_public ? <Link href={`/dog/${dog.slug}`} className="flex items-center justify-between rounded-2xl bg-surface-muted p-4 text-sm font-semibold hover:bg-brand-soft"><span className="flex items-center gap-2"><Globe2 size={17} /> Perfil público</span><span>↗</span></Link> : null}
            </div>
          </section>
          <section className="rounded-[2rem] border border-red-100 bg-red-50/60 p-6">
            <h2 className="text-sm font-semibold text-danger">Zona sensible</h2>
            <p className="mt-2 text-xs leading-5 text-ink-muted">Eliminar un pasaporte también elimina sus preferencias, opiniones y amistades.</p>
            <div className="mt-4"><DeleteDogButton dogId={dog.id} dogName={dog.name} /></div>
          </section>
        </aside>
      </div>
    </div>
  );
}
