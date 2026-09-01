import type { Metadata } from "next";
import { CalendarDays, Heart, MapPin, PawPrint, Ruler, Sparkles, Users, Zap } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CelebrationBanner } from "@/components/dogs/celebration-banner";
import { DogAvatar } from "@/components/dogs/dog-avatar";
import { DogCard } from "@/components/dogs/dog-card";
import { FriendRequestForm } from "@/components/friends/friend-request-form";
import { MarketingHeader } from "@/components/layout/marketing-header";
import { ProductVisual } from "@/components/products/product-visual";
import { ShareProfile } from "@/components/share/share-profile";
import { TrackEvent } from "@/components/analytics/track-event";
import { InstagramIcon } from "@/components/icons/instagram-icon";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { energyOptions, preferenceCategoryLabels, sociabilityOptions } from "@/lib/constants";
import { getOwnerDogs, getPublicDog } from "@/lib/data/dogs";
import { getViewer } from "@/lib/data/viewer";
import { absoluteUrl, formatAge, formatWeight, personalityLabel } from "@/lib/utils";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ created?: string }>;
};

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

export default async function PublicDogPage({ params, searchParams }: Props) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const [dog, viewer] = await Promise.all([getPublicDog(slug), getViewer()]);
  if (!dog) notFound();

  const isOwner = viewer?.id === dog.owner_id;
  const isNewlyCreated = query.created === "true" && isOwner;
  const ownerDogs = viewer ? await getOwnerDogs() : [];
  const canRequest = viewer?.id !== dog.owner_id;
  const energy = energyOptions.find((item) => item.value === dog.energy_level)?.label;
  const sociability = sociabilityOptions.find((item) => item.value === dog.sociability)?.label;
  const profileUrl = absoluteUrl(`/dog/${dog.slug}`);

  return (
    <div className="min-h-screen bg-cream text-ink">
      <TrackEvent
        name={isOwner ? "passport_viewed_owner" : "passport_viewed_public"}
        properties={{ breed: dog.breed }}
      />
      {isNewlyCreated ? (
        <TrackEvent name="dog_created" properties={{ breed: dog.breed }} />
      ) : null}

      <MarketingHeader />
      <main className="px-4 pb-24 pt-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {/* CELEBRATION ON FIRST CREATION */}
          {isNewlyCreated ? (
            <CelebrationBanner
              dogName={dog.name}
              dogId={dog.id}
            />
          ) : null}

          {/* PASSPORT HERO CONTAINER */}
          <section className="edge-card overflow-hidden rounded-sm bg-white shadow-[8px_8px_0_var(--ink)]">
            <div className="grid lg:grid-cols-[.92fr_1.08fr]">
              <div className="relative border-b-2 border-ink lg:border-b-0 lg:border-r-2">
                <DogAvatar
                  src={dog.photo_url}
                  name={dog.name}
                  size="hero"
                  priority
                  className="min-h-[460px] rounded-none lg:min-h-[640px]"
                />
              </div>
              <div className="relative flex flex-col justify-between p-6 sm:p-10 lg:p-12">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-display text-xs uppercase tracking-widest text-ink/70">
                    IDENTIDAD #{dog.id.replaceAll("-", "").slice(0, 6).toUpperCase()}
                  </p>
                  <Badge tone="yellow">Doggy Passport · Público</Badge>
                </div>

                <div className="pt-8 sm:pt-10">
                  <h1 className="font-display text-5xl uppercase tracking-[-0.04em] text-ink sm:text-7xl">
                    {dog.name}
                  </h1>
                  <p className="mt-2 text-lg text-ink/80">
                    {dog.breed} · {formatAge(dog.birth_date)}
                  </p>
                  {dog.city ? (
                    <p className="mt-2 flex items-center gap-2 text-sm text-ink/70">
                      <MapPin size={15} /> {dog.city}
                      {dog.country ? `, ${dog.country}` : ""}
                    </p>
                  ) : null}

                  {dog.instagram_handle ? (
                    <div className="mt-3">
                      <a
                        href={`https://www.instagram.com/${dog.instagram_handle}/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 border-2 border-ink bg-white px-3 py-1 font-display text-xs uppercase tracking-wider text-ink shadow-[2px_2px_0_var(--ink)] transition hover:-translate-y-0.5 hover:bg-cream-deep"
                      >
                        <InstagramIcon size={14} />
                        <span>@{dog.instagram_handle}</span>
                      </a>
                    </div>
                  ) : null}

                  <div className="mt-6 flex flex-wrap gap-2">
                    {dog.personality_tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-sm border-2 border-ink bg-sun px-3 py-1 font-display text-xs uppercase text-ink shadow-[2px_2px_0_var(--ink)]"
                      >
                        {personalityLabel(tag)}
                      </span>
                    ))}
                  </div>

                  {dog.bio ? (
                    <p className="mt-6 max-w-xl text-base leading-7 text-ink/80 sm:text-lg">
                      “{dog.bio}”
                    </p>
                  ) : null}
                </div>

                <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="border-2 border-ink bg-cream p-3.5 shadow-[2px_2px_0_var(--ink)]">
                    <Ruler size={16} className="text-ink/60" />
                    <p className="mt-2 text-[10px] font-display uppercase tracking-wider text-ink/60">
                      Peso
                    </p>
                    <p className="mt-0.5 font-display text-base text-ink">
                      {formatWeight(dog.weight_kg)}
                    </p>
                  </div>
                  <div className="border-2 border-ink bg-cream p-3.5 shadow-[2px_2px_0_var(--ink)]">
                    <Zap size={16} className="text-ink/60" />
                    <p className="mt-2 text-[10px] font-display uppercase tracking-wider text-ink/60">
                      Energía
                    </p>
                    <p className="mt-0.5 font-display text-base text-ink">{energy}</p>
                  </div>
                  <div className="border-2 border-ink bg-cream p-3.5 shadow-[2px_2px_0_var(--ink)]">
                    <Sparkles size={16} className="text-ink/60" />
                    <p className="mt-2 text-[10px] font-display uppercase tracking-wider text-ink/60">
                      Carácter
                    </p>
                    <p className="mt-0.5 font-display text-base text-ink">{sociability}</p>
                  </div>
                  <div className="border-2 border-ink bg-cream p-3.5 shadow-[2px_2px_0_var(--ink)]">
                    <CalendarDays size={16} className="text-ink/60" />
                    <p className="mt-2 text-[10px] font-display uppercase tracking-wider text-ink/60">
                      Registro
                    </p>
                    <p className="mt-0.5 font-display text-base text-ink">
                      {new Date(dog.created_at).getFullYear()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* COMMUNITY & SHARE STATUS */}
          <div className="mt-8 flex flex-col justify-between gap-4 border-2 border-ink bg-cream-deep p-5 shadow-[4px_4px_0_var(--ink)] sm:flex-row sm:items-center sm:p-6">
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center border-2 border-ink bg-sun text-ink shadow-[2px_2px_0_var(--ink)]">
                <PawPrint size={22} />
              </span>
              <div>
                <p className="font-display text-lg uppercase">
                  {dog.name} tiene {dog.friend_count}{" "}
                  {dog.friend_count === 1 ? "amigo" : "amigos"}
                </p>
                <p className="text-xs text-ink/75">Su red perruna verificada en Doggy World</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <ShareProfile
                dogName={dog.name}
                profileUrl={profileUrl}
                initialOpen={isNewlyCreated}
              />
              {viewer?.id === dog.owner_id ? (
                <Link
                  href={`/dogs/${dog.id}`}
                  className={buttonStyles({ variant: "outline", size: "sm" })}
                >
                  Administrar perfil
                </Link>
              ) : null}
            </div>
          </div>

          {/* DETAILS & SIDEBAR */}
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
            <div className="space-y-8">
              {/* Preferences */}
              <section className="edge-card p-6 sm:p-8">
                <p className="font-brush text-2xl text-electric">Lo que le gusta</p>
                <h2 className="mt-1 text-3xl">Intereses y gustos</h2>
                {dog.preferences.length ? (
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {dog.preferences.map((preference) => (
                      <article
                        key={preference.id}
                        className="flex items-start gap-3 border-2 border-ink bg-cream p-4 shadow-[2px_2px_0_var(--ink)]"
                      >
                        <span className="text-2xl">
                          {preference.sentiment > 0
                            ? "❤️"
                            : preference.sentiment < 0
                              ? "👎"
                              : "😐"}
                        </span>
                        <div>
                          <p className="font-display text-[10px] uppercase tracking-wider text-ink/65">
                            {preferenceCategoryLabels[preference.category]}
                          </p>
                          <p className="mt-1 font-semibold text-sm">{preference.value}</p>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="mt-5 text-sm text-ink/70">
                    Este pasaporte aún no comparte preferencias públicas.
                  </p>
                )}
              </section>

              {/* Favorites */}
              <section className="edge-card p-6 sm:p-8">
                <p className="font-brush text-2xl text-electric">Aprobados por {dog.name}</p>
                <h2 className="mt-1 text-3xl">Productos favoritos</h2>
                {dog.favorite_products.length ? (
                  <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
                    {dog.favorite_products.map((product) => (
                      <Link
                        key={product.id}
                        href={`/products/${product.slug}`}
                        className="group block border-2 border-ink bg-cream p-3 shadow-[2px_2px_0_var(--ink)] transition hover:-translate-y-0.5"
                      >
                        <ProductVisual product={product} />
                        <p className="mt-2 font-display text-xs uppercase group-hover:text-electric">
                          {product.name}
                        </p>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="mt-5 text-sm text-ink/70">Aún no hay favoritos públicos registrados.</p>
                )}
              </section>

              {/* Friends */}
              {dog.friends.length ? (
                <section>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="font-brush text-2xl text-electric">Su manada</p>
                      <h2 className="mt-1 text-3xl">Amigos de {dog.name}</h2>
                    </div>
                    <Users className="text-electric" size={24} />
                  </div>
                  <div className="mt-6 grid gap-6 sm:grid-cols-2">
                    {dog.friends.map((friend) => (
                      <DogCard key={friend.id} dog={friend} publicView />
                    ))}
                  </div>
                </section>
              ) : null}
            </div>

            {/* Aside */}
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <section className="edge-card p-6">
                <div className="flex size-12 items-center justify-center border-2 border-ink bg-sun text-ink shadow-[2px_2px_0_var(--ink)]">
                  <Heart size={22} />
                </div>
                <h2 className="mt-4 text-2xl">¿Se conocen?</h2>
                <p className="mt-2 text-sm leading-6 text-ink/75">
                  Conecta sus pasaportes y guarda esta amistad como parte de su historia en la
                  comunidad.
                </p>
                {canRequest ? (
                  viewer ? (
                    <div className="mt-5">
                      <FriendRequestForm
                        ownerDogs={ownerDogs}
                        recipientDogId={dog.id}
                        recipientName={dog.name}
                      />
                    </div>
                  ) : (
                    <Link
                      href={`/login?next=/dog/${dog.slug}`}
                      className={buttonStyles({ variant: "primary", className: "mt-5 w-full" })}
                    >
                      Inicia sesión para conectar
                    </Link>
                  )
                ) : (
                  <div className="mt-5 border-2 border-ink bg-sun p-4 text-xs font-display uppercase tracking-wide text-ink">
                    Este es uno de tus pasaportes.
                  </div>
                )}
              </section>
              <p className="mt-4 px-3 text-center text-xs leading-5 text-ink/65">
                Doggy Passport nunca expone correo, dirección exacta, notas privadas ni
                datos sensibles del dueño.
              </p>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
