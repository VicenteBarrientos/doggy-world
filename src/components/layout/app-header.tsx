import { LogOut } from "lucide-react";
import Link from "next/link";

import { signOutAction } from "@/app/actions/auth";
import { Logo } from "@/components/brand/logo";
import { BetaFeedbackDialog } from "@/components/feedback/beta-feedback-dialog";
import { Button, buttonStyles } from "@/components/ui/button";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-30 border-b-2 border-ink bg-cream px-4 py-3 sm:px-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <Logo />
        <nav className="hidden items-center gap-2 lg:flex" aria-label="Cuenta">
          <Link href="/dashboard" className={buttonStyles({ variant: "ghost", size: "sm" })}>
            Inicio
          </Link>
          <Link href="/products" className={buttonStyles({ variant: "ghost", size: "sm" })}>
            Productos
          </Link>
          <Link href="/friend-requests" className={buttonStyles({ variant: "ghost", size: "sm" })}>
            Amigos
          </Link>
          <Link href="/discover" className={buttonStyles({ variant: "ghost", size: "sm" })}>
            Comunidad
          </Link>
          <Link href="/settings" className={buttonStyles({ variant: "ghost", size: "sm" })}>
            Perfil
          </Link>
        </nav>
        <div className="flex items-center gap-2.5">
          <BetaFeedbackDialog triggerVariant="badge" />
          <form action={signOutAction}>
            <Button variant="secondary" size="sm" type="submit">
              <LogOut size={16} aria-hidden="true" />
              <span className="hidden sm:inline">Salir</span>
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
