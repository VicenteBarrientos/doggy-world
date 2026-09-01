import { Check } from "lucide-react";
import Link from "next/link";

import { Logo } from "@/components/brand/logo";
import { DogAvatar } from "@/components/dogs/dog-avatar";
import { demoDogs } from "@/lib/demo-data";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const luna = demoDogs[1];
  return (
    <main className="grid min-h-screen bg-canvas lg:grid-cols-[1.05fr_.95fr]">
      <section className="flex min-h-screen flex-col px-5 py-5 sm:px-10 sm:py-8 lg:px-16 xl:px-24">
        <Logo />
        <div className="mx-auto flex w-full max-w-md flex-1 items-center py-12">{children}</div>
        <p className="text-center text-xs text-ink-muted sm:text-left">
          Al continuar aceptas cuidar los datos de tu perro con responsabilidad.
        </p>
      </section>
      <aside className="relative hidden overflow-hidden bg-brand p-8 text-white lg:flex xl:p-12">
        <div className="passport-grid absolute inset-0 opacity-50" />
        <div className="relative flex w-full flex-col justify-between">
          <div className="flex justify-end">
            <Link href="/dashboard" className="rounded-full bg-white/12 px-4 py-2 text-sm font-semibold backdrop-blur hover:bg-white/20">
              Ver demo
            </Link>
          </div>
          <div className="mx-auto w-full max-w-lg">
            <DogAvatar
              src={luna.photo_url}
              name={luna.name}
              size="hero"
              priority
              className="aspect-[4/3] border-8 border-white/10"
            />
            <div className="relative -mt-16 mx-5 rounded-[2rem] bg-white p-6 text-ink shadow-float xl:mx-8 xl:p-7">
              <p className="text-xs font-bold uppercase tracking-[0.17em] text-brand">Su historia empieza aquí</p>
              <h2 className="mt-2 font-display text-3xl font-semibold">Un lugar para todo lo que hace única a {luna.name}.</h2>
              <div className="mt-5 grid gap-2 text-sm text-ink-muted sm:grid-cols-2">
                {["Perfil persistente", "Gustos estructurados", "Amigos perrunos", "QR compartible"].map((item) => (
                  <span key={item} className="flex items-center gap-2">
                    <Check className="text-brand" size={16} aria-hidden="true" /> {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <p className="text-center text-sm text-white/65">Doggy World · open source · MIT</p>
        </div>
      </aside>
    </main>
  );
}
