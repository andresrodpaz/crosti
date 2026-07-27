import type { Metadata } from "next"
import Link from "next/link"
import { localBusinessJsonLd, buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/lib/seo"
import { STORE_ENABLED } from "@/lib/feature-flags"

export const metadata: Metadata = {
  title: "Galletas Artesanales en Barcelona | Crosti Cookies",
  description:
    "Descubre las mejores galletas artesanales en Barcelona. Pedidos online, sabores de temporada y entrega en Barcelona desde Crosti Cookies.",
  alternates: {
    canonical: "https://crosti.es/galletas/galletas-artesanales-barcelona",
  },
  openGraph: {
    title: "Galletas Artesanales en Barcelona | Crosti Cookies",
    description:
      "Galletas artesanales horneadas en Barcelona con ingredientes premium, sabores únicos y servicio de pedido online.",
    url: "https://crosti.es/galletas/galletas-artesanales-barcelona",
    type: "article",
  },
}

const breadcrumbItems = [
  { name: "Inicio", url: "https://crosti.es/" },
  { name: "Galletas", url: "https://crosti.es/galletas" },
  { name: "Galletas Artesanales en Barcelona", url: "https://crosti.es/galletas/galletas-artesanales-barcelona" },
]

export default function BarcelonaCookiesPage() {
  return (
    <main className="min-h-screen bg-[#FFF3E2] text-[#930021]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd(breadcrumbItems)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildWebPageJsonLd({
          title: "Galletas Artesanales en Barcelona | Crosti Cookies",
          description:
            "Descubre las mejores galletas artesanales en Barcelona con Crosti Cookies. Pedidos online, sabores de temporada y reparto en Barcelona.",
          url: "https://crosti.es/galletas/galletas-artesanales-barcelona",
          breadcrumbItems,
        })) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />

      <section className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-20 md:px-10 lg:px-16">
        <div className="rounded-[2rem] border border-[#930021]/10 bg-white/80 p-8 shadow-sm md:p-12">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.35em] text-[#924C14]">
            SEO local · Barcelona
          </p>
          <h1 className="text-4xl font-black leading-tight md:text-5xl">
            Galletas artesanales en Barcelona: sabor local, pedido online y entrega rápida
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-[#4A3728]">
            En Crosti Cookies elaboramos galletas artesanales en Barcelona con recetas pensadas para sorprender en cada bocado. Desde galletas clásicas hasta sabores de temporada, atendemos pedidos para llevar y para regalar.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/galletas" className="rounded-full bg-[#930021] px-5 py-3 font-semibold text-[#F9E7AE]">
              Ver catálogo completo
            </Link>
            {STORE_ENABLED && (
              <Link href="/tienda" className="rounded-full border border-[#930021] px-5 py-3 font-semibold text-[#930021]">
                Pedir online
              </Link>
            )}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <article className="rounded-[1.5rem] border border-[#930021]/10 bg-white p-7 shadow-sm">
            <h2 className="text-2xl font-bold text-[#930021]">¿Por qué elegir Crosti en Barcelona?</h2>
            <p className="mt-3 text-[#4A3728] leading-7">
              Horneamos cada día con ingredientes premium, buscamos sabores memorables y ofrecemos una experiencia cercana para clientes de Barcelona y alrededores.
            </p>
          </article>
          <article className="rounded-[1.5rem] border border-[#930021]/10 bg-white p-7 shadow-sm">
            <h2 className="text-2xl font-bold text-[#930021]">Pedidos para eventos y regalos</h2>
            <p className="mt-3 text-[#4A3728] leading-7">
              Ya sea para una celebración, un detalle o un pedido semanal, nuestras galletas artesanales son una opción única para compartir.
            </p>
          </article>
        </div>
      </section>
    </main>
  )
}
