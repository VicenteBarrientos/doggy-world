import type { Metadata, Viewport } from "next";
import { Fraunces, Geist } from "next/font/google";

import { absoluteUrl } from "@/lib/utils";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(absoluteUrl()),
  title: {
    default: "Doggy World — El mundo de tu perro",
    template: "%s · Doggy World",
  },
  description:
    "Crea el pasaporte digital de tu perro, guarda sus gustos, comparte su perfil y conecta con sus amigos.",
  applicationName: "Doggy World",
  openGraph: {
    title: "Doggy World — El mundo de tu perro",
    description:
      "Una identidad digital persistente para cada perro y todo lo que le importa.",
    type: "website",
    locale: "es_CL",
    siteName: "Doggy World",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fffaf2",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${geistSans.variable} ${fraunces.variable}`}>
      <body>{children}</body>
    </html>
  );
}
