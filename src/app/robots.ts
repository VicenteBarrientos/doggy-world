import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/utils";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/dog/", "/discover", "/products"],
      disallow: ["/dashboard", "/dogs/", "/friend-requests", "/settings"],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
