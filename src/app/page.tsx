import Image from "next/image";
import Link from "next/link";

import { Wordmark } from "@/components/brand/wordmark";
import { MarketingHeader } from "@/components/layout/marketing-header";
import { ConstructionBadge } from "@/components/ui/badge";
import { TrackEvent } from "@/components/analytics/track-event";

const marquee = [
  "Juguetes certificados",
  "Perros reales",
  "Snacks premium",
  "Comunidad perruna",
  "Paseos verificados",
  "Hecho en construcción",
];

const bentoFeatures = [
  {
    title: "Cajas y juguetes",
    description: "Lo que llega a tu casa, mordido y aprobado por tu perro.",
  },
  {
    title: "Su identidad",
    description: "Un pasaporte digital con todo lo que lo hace único.",
  },
  {
    title: "Su manada",
    description: "Amigos, playdates y comunidad cerca de ti.",
  },
];

const faqs = [
  {
    q: "¿Qué es Doggy World?",
    a: "Un ecosistema digital centrado en la identidad de tu perro: su pasaporte digital, sus amigos, sus productos favoritos y su comunidad.",
  },
  {
    q: "¿Ya puedo usarlo?",
    a: "Puedes explorar la versión demo interactiva, crear el pasaporte de tu perro y conocer las historias de otros perros de la comunidad.",
  },
  {
    q: "¿Tiene costo?",
    a: "El pasaporte digital y la comunidad son totalmente gratuitos y de código abierto.",
  },
  {
    q: "¿Cómo se protege la privacidad de mi perro?",
    a: "Tú decides qué mostrar. Los pasaportes públicos nunca revelan tu correo, tu dirección exacta ni ubicaciones en tiempo real.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-cream text-ink">
      <MarketingHeader />

      <main>
        <TrackEvent name="landing_view" />
        {/* HERO SECTION */}
        <section className="relative overflow-hidden border-b-2 border-ink">
          <div className="pointer-events-none absolute right-0 top-16 h-[400px] w-[400px] rounded-full bg-sun/60 sm:h-[560px] sm:w-[560px] md:right-[6%]" />
          <div className="relative mx-auto grid max-w-7xl items-end gap-8 px-5 pt-12 md:grid-cols-[1.05fr_1fr] md:pt-20">
            <div className="pb-16">
              <p className="font-brush text-3xl text-electric sm:text-4xl">¿Conoces Doggy World?</p>
              <h1 className="mt-3 text-5xl sm:text-6xl md:text-[5.4rem]">
                Todo el mundo
                <br />
                de tu perro.
              </h1>
              <p className="mt-5 max-w-md text-lg text-ink/80">
                Perfil, amigos, paseos, tienda y bienestar. Lo físico que tu perro ama, conectado a
                un ecosistema digital hecho para él.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link href="/sign-up" className="btn-base btn-electric">
                  Crear su mundo
                </Link>
                <Link href="/dashboard" className="btn-base btn-outline-ink">
                  Explorar demo
                </Link>
              </div>
              <div className="mt-7 flex items-center gap-3">
                <div className="flex -space-x-3">
                  {["/images/dog-poodle.png", "/images/dog-pug.png", "/images/dog-jack.png"].map(
                    (src, i) => (
                      <div
                        key={i}
                        className="relative h-11 w-11 overflow-hidden rounded-full border-2 border-ink bg-white"
                      >
                        <Image
                          src={src}
                          alt="Perro de la comunidad"
                          fill
                          sizes="44px"
                          className="object-cover"
                        />
                      </div>
                    ),
                  )}
                </div>
                <p className="text-sm">
                  <strong>+1.200 perros</strong> listos para conectar
                </p>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[520px]">
              <div className="relative z-10 mx-auto aspect-[1200/1408] w-full max-w-[480px]">
                <Image
                  src="/images/hero-dog.png"
                  alt="Perro de Doggy World"
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 500px"
                  className="object-contain drop-shadow-2xl"
                />
              </div>

              {/* Floating editorial badges */}
              <div className="absolute -left-2 top-8 z-20 hidden rounded-sm border-2 border-ink bg-white px-3 py-1.5 font-display text-[0.7rem] uppercase shadow-[4px_4px_0_var(--ink)] md:block">
                Passport
              </div>
              <div className="absolute -right-1 top-1/3 z-20 hidden rounded-sm border-2 border-ink bg-electric px-3 py-1.5 font-display text-[0.7rem] uppercase text-white shadow-[4px_4px_0_var(--ink)] md:block">
                Amigos
              </div>
              <div className="absolute -left-4 bottom-28 z-20 hidden rounded-sm border-2 border-ink bg-sun px-3 py-1.5 font-display text-[0.7rem] uppercase text-ink shadow-[4px_4px_0_var(--ink)] md:block">
                Servicios
              </div>
              <div className="absolute bottom-14 right-6 z-20 hidden rounded-sm border-2 border-ink bg-white px-3 py-1.5 font-display text-[0.7rem] uppercase shadow-[4px_4px_0_var(--ink)] md:block">
                Catálogo
              </div>

              <div className="relative z-0 -mt-12 mx-auto aspect-[420/200] w-full max-w-[400px]">
                <Image
                  src="/images/toys.png"
                  alt="Juguetes aprobados por perros"
                  fill
                  sizes="400px"
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </section>

        {/* MARQUEE */}
        <div className="overflow-hidden border-b-2 border-ink bg-electric py-3">
          <div className="marquee-track font-display text-xs uppercase tracking-wider text-white sm:text-sm">
            {[...marquee, ...marquee].map((m, i) => (
              <span key={i} className="flex items-center gap-3">
                {m} <span className="text-sun">★</span>
              </span>
            ))}
          </div>
        </div>

        {/* MUNDO FÍSICO + DIGITAL */}
        <section className="mx-auto max-w-7xl px-5 py-20 text-center">
          <p className="font-brush text-3xl text-electric">Mundo físico + mundo digital</p>
          <h2 className="mx-auto mt-2 max-w-3xl text-4xl md:text-6xl">
            Los juguetes son reales.
            <br />
            El mundo, infinito.
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {bentoFeatures.map((c) => (
              <div key={c.title} className="soft-card p-8 text-left">
                <h3 className="text-2xl">{c.title}</h3>
                <p className="mt-2 text-ink/70">{c.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* EL MUNDO — BENTO FEATURES */}
        <section id="mundo" className="border-y-2 border-ink bg-cream-deep py-20">
          <div className="mx-auto max-w-7xl px-5">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="font-brush text-3xl text-electric">Lo que estamos construyendo</p>
                <h2 className="mt-1 text-4xl md:text-6xl">El mundo de tu perro</h2>
              </div>
              <ConstructionBadge />
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-12">
              {/* Doggy Friends */}
              <article className="edge-card relative overflow-hidden p-8 md:col-span-7">
                <ConstructionBadge className="absolute right-5 top-5" />
                <h3 className="text-3xl">Doggy Friends</h3>
                <p className="mt-2 max-w-sm text-ink/75">
                  Perros que se caen bien de verdad. Conexiones por barrio, energía y tamaño.
                </p>
                <div className="mt-8 flex items-center">
                  {["/images/dog-poodle.png", "/images/dog-pug.png", "/images/dog-jack.png"].map(
                    (src, i) => (
                      <div
                        key={i}
                        className="-mr-6 relative h-24 w-24 overflow-hidden rounded-full border-2 border-ink bg-white sm:h-28 sm:w-28"
                      >
                        <Image
                          src={src}
                          alt="Amigo de la comunidad"
                          fill
                          sizes="112px"
                          className="object-cover"
                        />
                      </div>
                    ),
                  )}
                  <span className="ml-10 flex h-24 w-24 items-center justify-center rounded-full border-2 border-dashed border-ink font-display text-xl sm:h-28 sm:w-28">
                    +48
                  </span>
                </div>
              </article>

              {/* Friend Finder */}
              <article className="edge-card relative overflow-hidden md:col-span-5">
                <div className="relative h-52 bg-electric">
                  <svg viewBox="0 0 400 220" className="h-full w-full opacity-40">
                    <g stroke="var(--electric-foreground)" strokeWidth="6" fill="none">
                      <path d="M0 60 H400 M0 150 H400 M110 0 V220 M270 0 V220" />
                    </g>
                  </svg>
                  {[
                    [70, 40],
                    [200, 120],
                    [310, 70],
                  ].map(([x, y], i) => (
                    <span
                      key={i}
                      style={{ left: `${x}px`, top: `${y}px` }}
                      className="absolute h-9 w-9 rounded-full border-2 border-ink bg-sun shadow-[2px_2px_0_var(--ink)]"
                    />
                  ))}
                </div>
                <div className="p-7">
                  <h3 className="text-2xl">Friend Finder</h3>
                  <p className="mt-2 text-ink/75">
                    Descubre perros y personas respetando la privacidad en cada paseo.
                  </p>
                  <ConstructionBadge className="mt-5" />
                </div>
              </article>

              {/* Passport */}
              <article className="edge-card relative p-8 md:col-span-5">
                <div className="flex items-center gap-4">
                  <div className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-ink bg-white">
                    <Image
                      src="/images/dog-jack.png"
                      alt="Perfil de Rocky"
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-2xl">Doggy Passport</h3>
                    <p className="text-sm text-ink/70">Rocky · Golden Retriever · Muy sociable</p>
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-3 border-t-2 border-ink pt-5 text-center">
                  {[
                    ["100%", "Perfil"],
                    ["31 kg", "Peso"],
                    ["⚡ Alta", "Energía"],
                  ].map(([v, l]) => (
                    <div key={l}>
                      <p className="font-display text-xl">{v}</p>
                      <p className="text-xs uppercase text-ink/65">{l}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <Link href="/dog/rocky-111111" className="btn-base btn-electric py-2 text-xs">
                    Ver pasaporte real
                  </Link>
                  <span className="font-display text-xs uppercase text-electric">Disponible hoy</span>
                </div>
              </article>

              {/* Salud y actividad */}
              <article className="edge-card p-8 md:col-span-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-3xl">Salud y actividad</h3>
                    <p className="mt-2 text-ink/75">
                      Vacunas, peso y energía semanal. Sin planillas ni pérdidas de datos.
                    </p>
                  </div>
                  <ConstructionBadge />
                </div>
                <div className="mt-8 flex h-28 items-end gap-3 sm:h-32">
                  {[45, 70, 38, 90, 60, 100, 52].map((h, i) => (
                    <div
                      key={i}
                      style={{ height: `${h}%` }}
                      className={`flex-1 border-2 border-ink ${i === 5 ? "bg-electric" : "bg-sun"}`}
                    />
                  ))}
                </div>
                <p className="mt-3 font-display text-xs uppercase text-ink/70">L M M J V S D</p>
              </article>

              {/* Doggy Match */}
              <article className="edge-card p-8 md:col-span-6">
                <h3 className="text-3xl">Doggy Match</h3>
                <div className="mt-6 flex items-center gap-4">
                  <div className="relative h-20 w-20 overflow-hidden rounded-sm border-2 border-ink bg-white sm:h-24 sm:w-24">
                    <Image
                      src="/images/dog-poodle.png"
                      alt="Perro candidato"
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-electric font-display text-sm text-white shadow-[2px_2px_0_var(--ink)] sm:h-14 sm:w-14">
                    92%
                  </div>
                  <div className="relative h-20 w-20 overflow-hidden rounded-sm border-2 border-ink bg-white sm:h-24 sm:w-24">
                    <Image
                      src="/images/dog-pug.png"
                      alt="Perro candidato"
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  </div>
                </div>
                <p className="mt-5 text-ink/75">
                  Compatibilidad por temperamento, nivel de energía y estilo de juego.
                </p>
                <ConstructionBadge className="mt-5" />
              </article>

              {/* Servicios */}
              <article id="servicios" className="edge-card overflow-hidden md:col-span-6">
                <div className="relative h-48 w-full border-b-2 border-ink sm:h-52">
                  <Image
                    src="/images/walker.jpg"
                    alt="Paseos de perros"
                    fill
                    sizes="(max-width: 768px) 100vw, 600px"
                    className="object-cover"
                  />
                </div>
                <div className="p-8">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-2xl">Servicios para perros</h3>
                      <p className="mt-2 text-ink/75">
                        Paseadores, cuidadores, grooming y veterinarios con opiniones verificadas.
                      </p>
                    </div>
                    <ConstructionBadge />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 font-display text-[0.65rem] uppercase">
                    {["Paseos", "Cuidado", "Grooming", "Veterinaria"].map((s) => (
                      <span key={s} className="border-2 border-ink bg-cream px-2 py-1">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* CATÁLOGO EXPERIMENTAL */}
        <section id="tienda" className="mx-auto max-w-7xl px-5 py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-brush text-3xl text-electric">Catálogo experimental</p>
              <h2 className="mt-1 text-4xl md:text-6xl">Juguetes y premios</h2>
            </div>
            <Link href="/products" className="btn-base btn-electric py-3 text-xs">
              Ver catálogo completo
            </Link>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { n: "Cuerda resistente", cat: "Juguete", href: "/products/cuerda-resistente" },
              { n: "Zorro de felpa con sonido", cat: "Juguete", href: "/products/zorro-felpa-sonido" },
              { n: "Premios de salmón", cat: "Premio", href: "/products/premios-salmon" },
              { n: "Puzzle de snacks", cat: "Enriquecimiento", href: "/products/puzzle-snacks" },
            ].map((prod) => (
              <article key={prod.n} className="edge-card p-5">
                <div className="relative aspect-square w-full overflow-hidden border-2 border-ink bg-cream-deep">
                  <Image
                    src="/images/toys.png"
                    alt={prod.n}
                    fill
                    sizes="260px"
                    className="object-contain p-3"
                  />
                  <span className="absolute left-2 top-2 border-2 border-ink bg-sun px-2 py-0.5 font-display text-[0.6rem] uppercase">
                    {prod.cat}
                  </span>
                </div>
                <h3 className="mt-4 text-xl">{prod.n}</h3>
                <p className="mt-1 text-sm text-ink/75">Opiniones y feedback real de perros.</p>
                <Link href={prod.href} className="btn-base btn-outline-ink mt-4 w-full py-2 text-xs">
                  Ver feedback
                </Link>
              </article>
            ))}
          </div>
        </section>

        {/* EN CONSTRUCCIÓN — BANNER DE OBRA */}
        <section className="border-y-2 border-ink bg-ink py-20 text-cream">
          <div className="stripe-warning mb-14 h-4 w-full" />
          <div className="mx-auto max-w-4xl px-5 text-center">
            <h2 className="text-4xl text-cream md:text-6xl">Estamos construyendo algo nuevo</h2>
            <p className="mt-5 text-lg text-cream/75">
              Doggy World se arma pieza por pieza, como una caja de juguetes. La base de identidad y
              comunidad ya está viva; el resto llega con cuidado y calidad.
            </p>
            <div className="mt-10 grid gap-4 text-left sm:grid-cols-3">
              {[
                ["Fase 1", "Doggy Passport y comunidad", "Disponible hoy"],
                ["Fase 2", "Feedback y catálogo", "Disponible hoy"],
                ["Fase 3", "Servicios, match y salud", "En construcción"],
              ].map(([f, t, s]) => (
                <div key={f} className="border-2 border-cream/30 p-6">
                  <p className="font-display text-xs uppercase text-sun">{f}</p>
                  <h3 className="mt-2 text-xl text-cream">{t}</h3>
                  <p className="mt-3 font-display text-[0.65rem] uppercase text-cream/70">{s}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="stripe-warning mt-14 h-4 w-full" />
        </section>

        {/* FAQ */}
        <section id="faq" className="mx-auto max-w-4xl px-5 py-20">
          <h2 className="text-4xl md:text-5xl">Preguntas frecuentes</h2>
          <div className="mt-8 divide-y-2 divide-ink border-y-2 border-ink">
            {faqs.map(({ q, a }) => (
              <details key={q} className="group py-5">
                <summary className="flex cursor-pointer items-center justify-between font-display text-sm uppercase">
                  {q}
                  <span className="text-xl text-electric transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-base text-ink/75">{a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* CALL TO ACTION */}
        <section id="sumate" className="border-t-2 border-ink bg-sun py-20">
          <div className="mx-auto max-w-5xl px-5 text-center">
            <h2 className="text-4xl md:text-6xl">Crea el pasaporte de tu perro</h2>
            <p className="mt-3 text-lg">
              Empieza gratis en menos de dos minutos. Guarda sus gustos y compártelo con orgullo.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href="/sign-up" className="btn-base btn-electric">
                Crear pasaporte gratis
              </Link>
              <Link href="/discover" className="btn-base btn-outline-ink">
                Ver perros de la comunidad
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t-2 border-ink bg-cream px-5 py-10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <Wordmark className="text-xl" />
          <p className="text-sm text-ink/70">
            © {new Date().getFullYear()} Doggy World — Ecosistema digital para perros.
          </p>
        </div>
      </footer>
    </div>
  );
}
