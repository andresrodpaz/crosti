import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/developer"],
    },
    sitemap: "https://crosti.es/sitemap.xml",
    host: "https://crosti.es",
  }
}
