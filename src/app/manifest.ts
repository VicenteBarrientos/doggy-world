import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Doggy World",
    short_name: "Doggy World",
    description: "El pasaporte digital de tu perro y todo su mundo.",
    start_url: "/",
    display: "standalone",
    background_color: "#fffaf2",
    theme_color: "#196b52",
    lang: "es",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
