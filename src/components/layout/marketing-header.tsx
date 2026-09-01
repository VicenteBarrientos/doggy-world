import { Menu } from "lucide-react";
import Link from "next/link";

import { Logo } from "@/components/brand/logo";
import { buttonStyles } from "@/components/ui/button";

export function MarketingHeader() {
  return (
    <>
      <div className="border-b-2 border-ink bg-electric py-2 text-center font-display text-[0.72rem] tracking-wider text-white uppercase">
        Estamos construyendo el mundo de tu perro — sé de los primeros
      </div>
      <header className="sticky top-0 z-50 border-b-2 border-ink bg-cream px-4 py-3 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Logo />
          <nav
            className="hidden items-center gap-7 font-display text-xs uppercase tracking-wide text-ink md:flex"
            aria-label="Principal"
          >
            <Link className="transition hover:text-electric" href="/#mundo">
              El mundo
            </Link>
            <Link className="transition hover:text-electric" href="/discover">
              Comunidad
            </Link>
            <Link className="transition hover:text-electric" href="/products">
              Tienda
            </Link>
            <Link className="transition hover:text-electric" href="/#faq">
              Preguntas
            </Link>
          </nav>
          <div className="hidden items-center gap-3 sm:flex">
            <Link href="/login" className={buttonStyles({ variant: "ghost", size: "sm" })}>
              Iniciar sesión
            </Link>
            <Link href="/sign-up" className={buttonStyles({ variant: "primary", size: "sm" })}>
              Crear su mundo
            </Link>
          </div>
          <Link
            href="/login"
            className="flex size-10 items-center justify-center border-2 border-ink bg-white shadow-[2px_2px_0_var(--ink)] sm:hidden"
            aria-label="Abrir acceso"
          >
            <Menu size={20} aria-hidden="true" />
          </Link>
        </div>
      </header>
    </>
  );
}
