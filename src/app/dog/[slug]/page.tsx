import type { Metadata } from "next";
import { CalendarDays, Heart, MapPin, PawPrint, Ruler, Sparkles, Users, Zap } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DogAvatar } from "@/components/dogs/dog-avatar";
import { DogCard } from "@/components/dogs/dog-card";
import { FriendRequestForm } from "@/components/friends/friend-request-form";
import { MarketingHeader } from "@/components/layout/marketing-header";
import { ProductVisual } from "@/components/products/product-visual";
import { ShareProfile } from "@/components/share/share-profile";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { energyOptions, preferenceCategoryLabels, sociabilityOptions } from "@/lib/constants";
import { getOwnerDogs, getPublicDog } from "@/lib/data/dogs";
import { getViewer } from "@/lib/data/viewer";
import { absoluteUrl, formatAge, formatWeight, personalityLabel } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const dog = await getPublicDog(slug);
  if (!dog) return { title: "Pasaporte no encontrado" };
  return {
    title: `${dog.name} · Doggy Passport`,
    description: `${dog.name} es ${dog.breed}. Conoce su personalidad, gustos y amigos en Doggy World.`,
    alternates: { canonical: `/dog/${dog.slug}` },
  };
}

export default async function PublicDogPage({ params }: Props) {
  const { slug } = await params;
  const [dog, viewer] = await Promise.all([getPublicDog(slug), getViewer()]);
  if (!dog) notFound();
  const ownerDogs = viewer ? await getOwnerDogs() : [];
  const canRequest = viewer?.id !== dog.owner_id;
  const energy = energyOptions.find((item) => item.value === dog.energy_level)?.label;
  const sociability = sociabilityOptions.find((item) => item.value === dog.sociability)?.label;
  const profileUrl = absoluteUrl(`/dog/${dog.slug}`);

  return (
    <div className="min-h-screen bg-canvas">
      <MarketingHeader />
      <main className="px-4 pb-20 pt-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <section className="overflow-hidden rounded-[3rem] bg-brand text-white shadow-float">
            <div className="grid lg:grid-cols-[.92fr_1.08fr]">
              <DogAvatar src={dog.photo_url} name={dog.name} size="hero" priority className="min-h-[500px] rounded-none lg:min-h-[690px]" />
              <div className="passport-grid relative flex flex-col justify-between p-7 sm:p-10 lg:p-14">
                <div className="absolute right-7 top-7"><Badge className="bg-white/12 text-white backdrop-blur">Doggy Passport · Público</Badge></div>
                <div className="pt-16">
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-white/65">Identidad #{dog.id.replaceAll("-", "").slice(0, 6).toUpperCase()}</p>
                  <h1 className="mt-4 font-display text-6xl font-semibold tracking-[-0.06em] sm:text-8xl">{dog.name}</h1>
                  <p className="mt-3 text-xl text-white/75">{dog.breed} · {formatAge(dog.birth_date)}</p>
                  {dog.city ? <p className="mt-3 flex items-center gap-2 text-sm text-white/65"><MapPin size={16} /> {dog.city}{dog.country ? `, ${dog.country}` : ""}</p> : null}
                  <div className="mt-7 flex flex-wrap gap-2">
                    {dog.personality_tags.map((tag) => <span key={tag} className="rounded-full bg-white/12 px-4 py-2 text-sm font-semibold backdrop-blur">{personalityLabel(tag)}</span>)}
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

          <div className="mt-7 flex flex-col justify-between gap-4 rounded-[2rem] border border-line bg-white p-5 shadow-card sm:flex-row sm:items-center sm:p-6">
            <div className="flex items-center gap-3"><span className="flex size-11 items-center justify-center rounded-2xl bg-brand-soft text-brand"><PawPrint size={21} /></span><div><p className="font-semibold">{dog.name} tiene {dog.friend_count} {dog.friend_count === 1 ? "amigo" : "amigos"}</p><p className="text-sm text-ink-muted">Su red perruna en Doggy World</p></div></div>
            <div className="flex flex-wrap gap-2">
              <ShareProfile dogName={dog.name} profileUrl={profileUrl} />
              {viewer?.id === dog.owner_id ? <Link href={`/dogs/${dog.id}`} className={buttonStyles({ variant: "secondary", size: "lg" })}>Administrar</Link> : null}
            </div>
          </div>

          <div className="mt-8 grid gap-7 lg:grid-cols-[1fr_350px]">
            <div className="space-y-7">
              <section className="rounded-[2.25rem] border border-line bg-white p-6 shadow-card sm:p-8">
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-brand">Lo que le gusta</p>
                <h2 className="mt-2 font-display text-3xl font-semibold">Sus intereses y preferencias</h2>
                {dog.preferences.length ? <div className="mt-6 grid gap-3 sm:grid-cols-2">{dog.preferences.map((preference) => <article key={preference.id} className="flex items-start gap-3 rounded-2xl bg-surface-muted p-4"><span className="text-2xl">{preference.sentiment > 0 ? "❤️" : preference.sentiment < 0 ? "👎" : "😐"}</span><div><p className="text-xs font-bold uppercase tracking-[0.12em] text-ink-muted">{preferenceCategoryLabels[preference.category]}</p><p className="mt-1 font-semibold">{preference.value}</p></div></article>)}</div> : <p className="mt-5 text-sm text-ink-muted">Este pasaporte aún no comparte preferencias públicas.</p>}
              </section>

              <section className="rounded-[2.25rem] border border-line bg-white p-6 shadow-card sm:p-8">
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-brand">Aprobados por {dog.name}</p>
                <h2 className="mt-2 font-display text-3xl font-semibold">Productos favoritos</h2>
                {dog.favorite_products.length ? <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">{dog.favorite_products.map((product) => <Link key={product.id} href={`/products/${product.slug}`} className="group"><ProductVisual product={product} /><p className="mt-3 text-sm font-semibold group-hover:text-brand">{product.name}</p></Link>)}</div> : <p className="mt-5 text-sm text-ink-muted">Aún no hay favoritos públicos.</p>}
              </section>

              {dog.friends.length ? <section><div className="flex items-end justify-between"><div><p className="text-sm font-bold uppercase tracking-[0.16em] text-brand">Su círculo</p><h2 className="mt-2 font-display text-3xl font-semibold">Amigos de {dog.name}</h2></div><Users className="text-brand" /></div><div className="mt-6 grid gap-5 sm:grid-cols-2">{dog.friends.map((friend) => <DogCard key={friend.id} dog={friend} publicView />)}</div></section> : null}
            </div>

            <aside className="lg:sticky lg:top-28 lg:self-start">
              <section className="rounded-[2.25rem] border border-line bg-white p-6 shadow-card">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-accent-soft text-accent"><Heart size={22} /></div>
                <h2 className="mt-5 font-display text-2xl font-semibold">¿Se conocen?</h2>
                <p className="mt-2 text-sm leading-6 text-ink-muted">Conecta sus pasaportes y guarda esta amistad como parte de su historia.</p>
                {canRequest ? (
                  viewer ? <div className="mt-5"><FriendRequestForm ownerDogs={ownerDogs} recipientDogId={dog.id} recipientName={dog.name} /></div> : <Link href={`/login?next=/dog/${dog.slug}`} className={buttonStyles({ className: "mt-5 w-full" })}>Inicia sesión para agregarlo</Link>
                ) : <div className="mt-5 rounded-2xl bg-brand-soft p-4 text-sm font-medium text-brand-strong">Este es uno de tus pasaportes.</div>}
              </section>
              <p className="mt-4 px-4 text-center text-xs leading-5 text-ink-muted">Este perfil nunca expone correo, dirección exacta, notas privadas ni información sensible del dueño.</p>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
