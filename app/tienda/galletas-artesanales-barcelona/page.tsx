import type { Metadata } from "next"
import Link from "next/link"
import { buildBreadcrumbJsonLd, buildWebPageJsonLd, localBusinessJsonLd } from "@/lib/seo"

export const metadata: Metadata = {
  title: "Comprar Galletas Artesanales en Barcelona | Crosti Cookies",
  description:
    "Compra galletas artesanales en Barcelona desde Crosti Cookies. Elige tus favoritos, arma tu pedido y recibe confirmación directa para tu compra.",
  alternates: {
    canonical: "https://crosti.es/tienda/galletas-artesanales-barcelona",
  },
}

const breadcrumbItems = [
  { name: "Inicio", url: "https://crosti.es/" },
  { name: "Tienda", url: "https://crosti.es/tienda" },
  { name: "Comprar galletas artesanales en Barcelona", url: "https://crosti.es/tienda/galletas-artesanales-barcelona" },
]

export default function StoreBarcelonaPage() {
  return (
    <main className="min-h-screen bg-[#F8E19A] text-[#930021]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd(breadcrumbItems)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildWebPageJsonLd({
        title: "Comprar Galletas Artesanales en Barcelona | Crosti Cookies",
        description: "Compra galletas artesanales en Barcelona con Crosti Cookies y recibe tu pedido con atención personalizada.",
        url: "https://crosti.es/tienda/galletas-artesanales-barcelona",
        breadcrumbItems,
      })) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }} />

      <section className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-20 md:px-10 lg:px-16">
        <div className="rounded-[2rem] border border-[#930021]/10 bg-white/90 p-8 shadow-sm md:p-12">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.35em] text-[#924C14]">Tienda online · Barcelona</p>
          <h1 className="text-4xl font-black leading-tight md:text-5xl">Compra galletas artesanales en Barcelona desde la web</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-[#4A3728]">
            Elige tus galletas favoritas, selecciona el formato que mejor te convenga y confirma tu pedido con un equipo cercano a tu zona.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/tienda" className="rounded-full bg-[#930021] px-5 py-3 font-semibold text-[#F9E7AE]">Ir a la tienda</Link>
            <Link href="/faq" className="rounded-full border border-[#930021] px-5 py-3 font-semibold text-[#930021]">Consultar dudas frecuentes</Link>
          </div>
        </div>
      </section>
    </main>
  )
}
