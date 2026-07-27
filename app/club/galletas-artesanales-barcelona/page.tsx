import type { Metadata } from "next"
import Link from "next/link"
import { buildBreadcrumbJsonLd, buildWebPageJsonLd, localBusinessJsonLd } from "@/lib/seo"

export const metadata: Metadata = {
  title: "Club Crosti Barcelona | Galletas Artesanales y Recompensas",
  description:
    "Únete al club de Crosti en Barcelona y acumula sellos con tus compras de galletas artesanales.",
  alternates: {
    canonical: "https://crosti.es/club/galletas-artesanales-barcelona",
  },
}

const breadcrumbItems = [
  { name: "Inicio", url: "https://crosti.es/" },
  { name: "Club", url: "https://crosti.es/club" },
  { name: "Club Crosti Barcelona", url: "https://crosti.es/club/galletas-artesanales-barcelona" },
]

export default function ClubLocalPage() {
  return (
    <main className="min-h-screen bg-[#FFF3E2] text-[#930021]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd(breadcrumbItems)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildWebPageJsonLd({
        title: "Club Crosti Barcelona | Galletas Artesanales y Recompensas",
        description: "El club de Crosti en Barcelona reúne a fans de las galletas artesanales con recompensas y premios especiales.",
        url: "https://crosti.es/club/galletas-artesanales-barcelona",
        breadcrumbItems,
      })) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }} />

      <section className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-20 md:px-10 lg:px-16">
        <div className="rounded-[2rem] border border-[#930021]/10 bg-white/90 p-8 shadow-sm md:p-12">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.35em] text-[#924C14]">Club Crosti · Barcelona</p>
          <h1 className="text-4xl font-black leading-tight md:text-5xl">Acumula sellos por tus compras de galletas artesanales</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-[#4A3728]">
            Descubre cómo participar en el club de Crosti, disfrutar de recompensas y convertir cada compra en una experiencia más especial.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/club" className="rounded-full bg-[#930021] px-5 py-3 font-semibold text-[#F9E7AE]">Entrar al club</Link>
            <Link href="/galletas" className="rounded-full border border-[#930021] px-5 py-3 font-semibold text-[#930021]">Ver galletas</Link>
          </div>
        </div>
      </section>
    </main>
  )
}
