import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Preguntas Frecuentes | Crosti Cookies Barcelona",
  description:
    "Resuelve tus dudas sobre Crosti Cookies: ubicación, horarios, pedidos, ingredientes y más.",
  alternates: {
    canonical: "https://crosti.es/faq",
  },
}

const faqs = [
  {
    question: "¿Dónde comprar galletas artesanales en Barcelona?",
    answer:
      "Crosti Cookies está ubicada en Carrer de Llull 223, Sant Martí, Barcelona (08005). Horneamos galletas artesanales frescas a diario con ingredientes premium. Puedes recogerlas directamente en tienda o realizar tu pedido online para envío a domicilio.",
  },
  {
    question: "¿Cuáles son las mejores galletas de Barcelona?",
    answer:
      "Crosti Cookies hornea artesanalmente cada día con ingredientes de primera calidad. Nuestros clientes nos califican con 4,9 sobre 5 basado en 159 reseñas verificadas, lo que nos posiciona entre las mejores opciones de galletas artesanales de Barcelona.",
  },
  {
    question: "¿Cuál es el horario de Crosti Cookies?",
    answer:
      "Abrimos todos los días de la semana, de lunes a domingo, de 11:00 a 20:00. No cerramos festivos para que siempre puedas venir a buscar tus galletas favoritas.",
  },
  {
    question: "¿Hacen envíos o solo pickup en tienda?",
    answer:
      "Ofrecemos dos opciones: recogida en tienda en Carrer de Llull 223 (Sant Martí, Barcelona) y envío a domicilio dentro de Barcelona. Consulta las zonas de reparto disponibles al realizar tu pedido online en crosti.es.",
  },
  {
    question: "¿Cómo puedo contactar a Crosti Cookies?",
    answer:
      "Puedes contactarnos por email en info@crosti.es, por teléfono al +34 931 234 567, o a través de nuestras redes sociales: Instagram y TikTok @crosticookies, y Facebook Crosti Cookies.",
  },
  {
    question: "¿Las galletas de Crosti tienen sabores de temporada?",
    answer:
      "Sí. Además de nuestra carta de sabores clásicos disponibles todo el año, lanzamos regularmente ediciones de temporada como la Galleta del Mes y colecciones especiales como la Colección de Primavera. Síguenos en redes sociales para estar al tanto de los nuevos lanzamientos.",
  },
  {
    question: "¿Dónde está ubicada exactamente Crosti Cookies?",
    answer:
      "Crosti Cookies se encuentra en Carrer de Llull, 223, Sant Martí, 08005 Barcelona, España. Las coordenadas GPS son 41.40281286597616, 2.204235754413818. Estamos bien comunicados en transporte público.",
  },
]

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map(({ question, answer }) => ({
    "@type": "Question",
    name: question,
    acceptedAnswer: {
      "@type": "Answer",
      text: answer,
    },
  })),
}

export default function FAQPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <main className="min-h-screen bg-[#FFFBF5] py-16 px-4 md:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-12 text-center">
            <Link
              href="/"
              className="inline-block mb-8 text-[#924C14]/70 hover:text-[#924C14] text-sm transition-colors"
            >
              ← Volver al inicio
            </Link>
            <p className="text-sm font-semibold tracking-widest uppercase text-[#930021]/60 mb-3">
              Crosti Cookies · Barcelona
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-[#930021] mb-4 leading-tight">
              Preguntas Frecuentes
            </h1>
            <p className="text-[#6B4226]/80 text-lg max-w-xl mx-auto">
              Todo lo que necesitas saber sobre nuestras galletas artesanales,
              horarios, pedidos y más.
            </p>
          </div>

          {/* FAQ list */}
          <ol className="space-y-6">
            {faqs.map(({ question, answer }, index) => (
              <li
                key={index}
                className="bg-white rounded-2xl shadow-sm border border-[#924C14]/10 overflow-hidden"
              >
                <div className="p-6 md:p-8">
                  <h2 className="text-lg md:text-xl font-bold text-[#930021] mb-3 leading-snug">
                    {question}
                  </h2>
                  <p className="text-[#4A3728] leading-relaxed text-base">
                    {answer}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          {/* Contact CTA */}
          <div className="mt-14 text-center bg-[#930021] rounded-3xl p-8 md:p-10">
            <p className="text-[#F9E7AE] font-semibold text-lg mb-2">
              ¿No encuentras lo que buscas?
            </p>
            <p className="text-white/80 mb-6 text-sm">
              Escríbenos y te respondemos en breve.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="mailto:info@crosti.es"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#F9E7AE] text-[#930021] font-bold text-sm hover:bg-white transition-colors"
              >
                info@crosti.es
              </a>
              <a
                href="tel:+34931234567"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white/10 text-white font-semibold text-sm hover:bg-white/20 transition-colors border border-white/20"
              >
                +34 931 234 567
              </a>
            </div>
          </div>

          {/* Back to footer links */}
          <div className="mt-10 text-center text-sm text-[#924C14]/60 flex items-center justify-center gap-3 flex-wrap">
            <Link href="/politica-privacidad" className="hover:text-[#924C14] transition-colors">
              Política de Privacidad
            </Link>
            <span>·</span>
            <Link href="/aviso-legal" className="hover:text-[#924C14] transition-colors">
              Aviso Legal
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}
