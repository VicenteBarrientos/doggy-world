import { Menu } from "lucide-react";
import Link from "next/link";

import { Logo } from "@/components/brand/logo";
import { buttonStyles } from "@/components/ui/button";

export function MarketingHeader() {
  return (
    <header className="relative z-20 px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Logo />
        <nav className="hidden items-center gap-7 text-sm font-medium text-ink-muted md:flex" aria-label="Principal">
          <Link className="transition hover:text-ink" href="/#como-funciona">
            Cómo funciona
          </Link>
          <Link className="transition hover:text-ink" href="/discover">
            Explorar
          </Link>
          <Link className="transition hover:text-ink" href="/products">
            Productos
          </Link>
        </nav>
        <div className="hidden items-center gap-2 sm:flex">
          <Link href="/login" className={buttonStyles({ variant: "ghost" })}>
            Iniciar sesión
          </Link>
          <Link href="/sign-up" className={buttonStyles({ size: "md" })}>
            Crear perfil
          </Link>
        </div>
        <Link
          href="/login"
          className="flex size-11 items-center justify-center rounded-full border border-line bg-white sm:hidden"
          aria-label="Abrir acceso"
        >
          <Menu size={20} aria-hidden="true" />
        </Link>
      </div>
    </header>
  );
}
