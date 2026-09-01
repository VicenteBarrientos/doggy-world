import {
  ArrowRight,
  Bone,
  Check,
  Heart,
  MapPin,
  PawPrint,
  QrCode,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Users,
} from "lucide-react";
import Link from "next/link";

import { DogAvatar } from "@/components/dogs/dog-avatar";
import { MarketingHeader } from "@/components/layout/marketing-header";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { demoDogs } from "@/lib/demo-data";

const builtFeatures = [
  {
    icon: PawPrint,
    title: "Pasaporte digital",
    description: "Una identidad viva con su historia, personalidad y datos importantes.",
    tone: "bg-brand-soft text-brand",
  },
  {
    icon: Heart,
    title: "Gustos y favoritos",
    description: "Aprende qué juguetes, premios y actividades realmente disfruta.",
    tone: "bg-accent-soft text-[#9f582b]",
  },
  {
    icon: Users,
    title: "Amigos perrunos",
    description: "Conecta su pasaporte con los perros que ya son parte de su mundo.",
    tone: "bg-[#fff1bd] text-[#856414]",
  },
  {
    icon: QrCode,
    title: "Listo para compartir",
    description: "Un enlace y QR para llevar su perfil a paseos, tags y conversaciones.",
    tone: "bg-[#e8e4ff] text-[#6857a8]",
  },
];

const comingSoon = [
  { icon: MapPin, title: "Perros cerca", copy: "Descubrimiento con ubicación aproximada y privacidad." },
  { icon: Sparkles, title: "Encuentros", copy: "Compatibilidad y playdates pensados para cada perro." },
  { icon: Stethoscope, title: "Servicios", copy: "Cuidadores, paseadores y profesionales de confianza." },
  { icon: Bone, title: "Marketplace", copy: "Productos relevantes a partir de preferencias reales." },
];

export default function LandingPage() {
  const rocky = demoDogs[0];
  return (
    <div className="min-h-screen overflow-hidden bg-canvas">
      <MarketingHeader />

      <main>
        <section className="relative px-4 pb-20 pt-8 sm:px-6 sm:pb-28 sm:pt-14 lg:px-8 lg:pt-20">
          <div className="absolute -left-32 top-0 size-80 rounded-full bg-brand-soft/70 blur-3xl" />
          <div className="absolute -right-28 top-24 size-96 rounded-full bg-accent-soft/60 blur-3xl" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.02fr_.98fr] lg:gap-20">
            <div>
              <Badge tone="green" className="mb-6 px-4 py-2">
                <Sparkles size={14} aria-hidden="true" /> La identidad digital de tu perro
              </Badge>
              <h1 className="text-balance font-display text-[clamp(3.2rem,8vw,6.8rem)] font-semibold leading-[0.92] tracking-[-0.055em] text-ink">
                Todo el mundo de tu perro,
                <span className="text-brand"> en un solo lugar.</span>
              </h1>
              <p className="mt-7 max-w-xl text-balance text-lg leading-8 text-ink-muted sm:text-xl">
                Crea su perfil, guarda lo que le gusta, conecta con amigos y construye su historia con el tiempo.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link href="/sign-up" className={buttonStyles({ size: "lg" })}>
                  Crear el perfil de mi perro <ArrowRight size={18} aria-hidden="true" />
                </Link>
                <Link href="/dashboard" className={buttonStyles({ variant: "secondary", size: "lg" })}>
                  Ver la experiencia demo
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-ink-muted">
                <span className="flex items-center gap-2">
                  <Check className="text-brand" size={17} aria-hidden="true" /> Gratis y open source
                </span>
                <span className="flex items-center gap-2">
                  <ShieldCheck className="text-brand" size={17} aria-hidden="true" /> Tú controlas su privacidad
                </span>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[570px] lg:max-w-none">
              <div className="absolute -left-7 top-14 hidden rounded-3xl bg-white p-4 shadow-float sm:block">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-2xl bg-accent-soft">🎾</span>
                  <div>
                    <p className="text-xs text-ink-muted">Favorito</p>
                    <p className="text-sm font-semibold">Buscar la pelota</p>
                  </div>
                </div>
              </div>
              <div className="absolute -right-4 bottom-16 z-10 rounded-3xl bg-white p-4 shadow-float sm:-right-8">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-2xl bg-brand-soft">🐾</span>
                  <div>
                    <p className="text-xs text-ink-muted">Su mundo crece</p>
                    <p className="text-sm font-semibold">1 nuevo amigo</p>
                  </div>
                </div>
              </div>
              <div className="rotate-[2deg] rounded-[3rem] border border-white/80 bg-white p-3 shadow-float">
                <div className="relative overflow-hidden rounded-[2.45rem]">
                  <DogAvatar
                    src={rocky.photo_url}
                    name={rocky.name}
                    size="hero"
                    priority
                    className="aspect-[4/5] rounded-[2.45rem]"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#152b24]/95 via-[#152b24]/55 to-transparent px-7 pb-7 pt-28 text-white sm:px-9 sm:pb-9">
                    <Badge className="mb-3 bg-white/16 text-white backdrop-blur">Pasaporte #111111</Badge>
                    <h2 className="font-display text-4xl font-semibold">Rocky</h2>
                    <p className="mt-1 text-sm text-white/80">Golden Retriever · 3 años</p>
                    <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
                      <span className="rounded-full bg-white/15 px-3 py-1.5 backdrop-blur">⚡ Energía alta</span>
                      <span className="rounded-full bg-white/15 px-3 py-1.5 backdrop-blur">🐾 Muy sociable</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="como-funciona" className="border-y border-line bg-white px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand">Su identidad primero</p>
              <h2 className="mt-4 text-balance font-display text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">
                Mucho más que una ficha de datos.
              </h2>
              <p className="mt-5 text-lg leading-8 text-ink-muted">
                Cada interacción enriquece el mismo pasaporte persistente. Ese es el corazón de Doggy World.
              </p>
            </div>
            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {builtFeatures.map(({ icon: Icon, title, description, tone }) => (
                <article key={title} className="rounded-[2rem] border border-line bg-canvas/70 p-6 sm:p-7">
                  <div className={`flex size-13 items-center justify-center rounded-2xl ${tone}`}>
                    <Icon size={24} aria-hidden="true" />
                  </div>
                  <h3 className="mt-6 font-display text-2xl font-semibold">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-ink-muted">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
            <div>
              <Badge tone="orange">Construido para crecer</Badge>
              <h2 className="mt-5 text-balance font-display text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">
                Empieza con su historia. El resto viene después.
              </h2>
              <p className="mt-5 text-lg leading-8 text-ink-muted">
                No estamos simulando funciones que aún no existen. Estas áreas están diseñadas en la arquitectura y llegarán cuando el pasaporte tenga una base realmente útil.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {comingSoon.map(({ icon: Icon, title, copy }) => (
                <article key={title} className="rounded-[2rem] border border-line bg-white p-6 shadow-card">
                  <div className="flex items-center justify-between">
                    <span className="flex size-11 items-center justify-center rounded-2xl bg-surface-muted text-ink-muted">
                      <Icon size={21} aria-hidden="true" />
                    </span>
                    <Badge>Próximamente</Badge>
                  </div>
                  <h3 className="mt-5 font-display text-xl font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-ink-muted">{copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 pb-20 sm:px-6 sm:pb-28 lg:px-8">
          <div className="passport-grid relative mx-auto max-w-7xl overflow-hidden rounded-[2.75rem] bg-brand px-6 py-14 text-white sm:px-12 sm:py-20 lg:px-20">
            <div className="absolute -right-10 -top-14 text-[15rem] opacity-[0.08]" aria-hidden="true">🐾</div>
            <div className="relative max-w-3xl">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-white/70">Su mundo comienza aquí</p>
              <h2 className="mt-4 text-balance font-display text-4xl font-semibold tracking-[-0.04em] sm:text-6xl">
                Dale a tu perro un perfil tan único como él.
              </h2>
              <p className="mt-5 max-w-xl text-lg leading-8 text-white/75">
                Crea su pasaporte en minutos y sigue enriqueciéndolo con cada descubrimiento.
              </p>
              <Link
                href="/sign-up"
                className={buttonStyles({
                  variant: "secondary",
                  size: "lg",
                  className: "mt-8 border-white bg-white text-brand-strong hover:bg-accent-soft",
                })}
              >
                Crear su pasaporte <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-center text-sm text-ink-muted sm:flex-row sm:text-left">
          <p>© 2026 Doggy World. Un experimento open source para perros y sus personas.</p>
          <div className="flex gap-5">
            <Link href="/discover" className="hover:text-ink">Explorar</Link>
            <Link href="/products" className="hover:text-ink">Productos</Link>
            <a href="https://opensource.org/license/mit" className="hover:text-ink">MIT</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
