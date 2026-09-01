"use client";

import { Compass, Home, PawPrint, Settings, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Inicio", icon: Home },
  { href: "/dashboard#dogs", label: "Mis perros", icon: PawPrint },
  { href: "/friend-requests", label: "Amigos", icon: Users },
  { href: "/discover", label: "Descubrir", icon: Compass },
  { href: "/settings", label: "Perfil", icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav
      className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-5 rounded-[1.5rem] border border-line bg-white/95 p-1.5 shadow-float backdrop-blur-lg lg:hidden"
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
              "flex min-h-13 flex-col items-center justify-center gap-1 rounded-[1.1rem] px-1 text-[10px] font-semibold transition",
              active ? "bg-brand-soft text-brand-strong" : "text-ink-muted hover:text-ink",
            )}
          >
            <Icon size={19} strokeWidth={active ? 2.5 : 2} aria-hidden="true" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
