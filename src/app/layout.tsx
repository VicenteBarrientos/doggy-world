import type { Metadata, Viewport } from "next";
import { Archivo_Black, Caveat_Brush, Hind } from "next/font/google";

import { absoluteUrl } from "@/lib/utils";

import "./globals.css";

const archivoBlack = Archivo_Black({
  weight: "400",
  variable: "--font-display",
  subsets: ["latin"],
});

const caveatBrush = Caveat_Brush({
  weight: "400",
  variable: "--font-brush",
  subsets: ["latin"],
});

const hind = Hind({
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
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
  themeColor: "#FBF9F3",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      className={`${archivoBlack.variable} ${caveatBrush.variable} ${hind.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
