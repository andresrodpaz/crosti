import type { MetadataRoute } from "next"
import { STORE_ENABLED } from "@/lib/feature-flags"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://crosti.es"
  const routes = [
    "",
    "/galletas",
    "/galletas/galletas-artesanales-barcelona",
    // Rutas de tienda sólo cuando la tienda está activa
    ...(STORE_ENABLED ? ["/tienda", "/tienda/galletas-artesanales-barcelona"] : []),
    "/club",
    "/club/galletas-artesanales-barcelona",
    "/faq",
    "/aviso-legal",
    "/politica-privacidad",
  ]

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : 0.8,
  }))
}
