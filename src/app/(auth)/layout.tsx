import { Check } from "lucide-react";
import Link from "next/link";

import { Logo } from "@/components/brand/logo";
import { DogAvatar } from "@/components/dogs/dog-avatar";
import { demoDogs } from "@/lib/demo-data";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const luna = demoDogs[1];
  return (
    <main className="grid min-h-screen bg-cream text-ink lg:grid-cols-[1.05fr_.95fr]">
      <section className="flex min-h-screen flex-col px-5 py-6 sm:px-10 sm:py-8 lg:px-16 xl:px-24">
        <Logo />
        <div className="mx-auto flex w-full max-w-md flex-1 items-center py-12">{children}</div>
        <p className="text-center text-xs text-ink/70 sm:text-left">
          Al continuar aceptas cuidar los datos de tu perro con responsabilidad y respeto.
        </p>
      </section>
      <aside className="relative hidden overflow-hidden border-l-2 border-ink bg-electric p-8 text-white lg:flex xl:p-12">
        <div className="relative flex w-full flex-col justify-between">
          <div className="flex justify-end">
            <Link
              href="/demo"
              className="border-2 border-white bg-white px-4 py-2 font-display text-xs uppercase tracking-wide text-ink shadow-[3px_3px_0_var(--ink)] transition hover:bg-sun"
            >
              Ver demo
            </Link>
          </div>
          <div className="mx-auto w-full max-w-lg">
            <div className="border-2 border-white">
              <DogAvatar
                src={luna.photo_url}
                name={luna.name}
                size="hero"
                priority
                className="aspect-[4/3] rounded-none"
              />
            </div>
            <div className="edge-card relative -mt-12 mx-4 p-6 text-ink shadow-[6px_6px_0_var(--ink)] xl:mx-6 xl:p-7">
              <p className="font-display text-[10px] uppercase tracking-widest text-electric">
                Su historia empieza aquí
              </p>
              <h2 className="mt-1 font-display text-2xl uppercase leading-tight">
                Un pasaporte para todo lo que hace única a {luna.name}.
              </h2>
              <div className="mt-4 grid gap-2 text-xs text-ink/80 sm:grid-cols-2">
                {[
                  "Perfil persistente",
                  "Gustos estructurados",
                  "Amigos perrunos",
                  "QR compartible",
                ].map((item) => (
                  <span key={item} className="flex items-center gap-2 font-medium">
                    <Check className="text-electric" size={15} aria-hidden="true" /> {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <p className="text-center font-display text-xs uppercase tracking-wide text-white/75">
            Doggy World · Open Source · MIT
          </p>
        </div>
      </aside>
    </main>
  );
}
