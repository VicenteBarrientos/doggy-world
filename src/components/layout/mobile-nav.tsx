"use client";

import { Compass, Home, PawPrint, Settings, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Inicio", icon: Home },
  { href: "/dashboard#dogs", label: "Perros", icon: PawPrint },
  { href: "/friend-requests", label: "Amigos", icon: Users },
  { href: "/discover", label: "Comunidad", icon: Compass },
  { href: "/settings", label: "Perfil", icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t-2 border-ink bg-cream p-1 shadow-[0_-4px_0_var(--ink)] lg:hidden"
      aria-label="Navegación de la cuenta"
    >
      {items.map(({ href, label, icon: Icon }) => {
        const path = href.split("#")[0];
        const active = pathname === path || (path !== "/dashboard" && pathname.startsWith(path));
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex min-h-12 flex-col items-center justify-center gap-1 rounded-sm px-1 font-display text-[9px] uppercase tracking-wide transition",
              active
                ? "border-2 border-ink bg-sun text-ink shadow-[2px_2px_0_var(--ink)]"
                : "text-ink hover:bg-cream-deep",
            )}
          >
            <Icon size={18} strokeWidth={active ? 2.5 : 2} aria-hidden="true" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
