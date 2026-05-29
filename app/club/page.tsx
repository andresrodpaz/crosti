import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DigitalCardPreview } from "@/components/club/digital-card-preview"
import { ClubRegistrationForm } from "@/components/club/club-registration-form"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Star, Gift, Shield } from "lucide-react"

export default async function ClubRegistrationPage({
  searchParams,
}: {
  searchParams: { ref?: string }
}) {
  if (process.env.NEXT_PUBLIC_LOYALTY_ENABLED !== "true") {
    redirect("/")
  }

  const supabase = await createClient()
  const { data: config } = await supabase.from("club_card_config").select("*").single()

  const cardConfig = config
    ? {
      primaryColor: config.primary_color,
      accentColor: config.accent_color,
      textColor: config.text_color,
      font: config.font,
      stampTotal: config.stamp_total,
      rewardDescription: config.reward_description,
      logoUrl: config.logo_url,
    }
    : {
      primaryColor: "#7C4A1E",
      accentColor: "#F5D89C",
      textColor: "#ffffff",
      font: "Inter",
      stampTotal: 10,
      rewardDescription: "Tu cookie gratis",
    }

  const perks = [
    { Icon: Star, text: `${cardConfig.stampTotal} sellos = ${cardConfig.rewardDescription}` },
    { Icon: Gift, text: "Sello regalo en tu cumpleaños" },
  ]

  return (
    <div className="min-h-screen bg-[#FDFAF4] flex flex-col selection:bg-[#F5D89C] selection:text-[#7C4A1E]">
      {/* Navbar */}
      <div className="bg-[#FDFAF4]">
        <Navbar />
      </div>

      {/* Subtle gradient below navbar */}
      <div className="absolute top-0 inset-x-0 h-72 bg-gradient-to-b from-[#F5D89C]/20 to-transparent pointer-events-none -z-0" />

      {/* Main content: two-column split */}
      <div className="relative z-10 flex-1 flex flex-col lg:flex-row">

        {/* ── Left Panel: card preview ── */}
        <div className="lg:w-1/2 flex flex-col items-center justify-center px-8 py-12 lg:py-20">

          {/* Brand label */}
          <div className="flex items-center gap-2 mb-10">
            <span className="text-sm font-bold tracking-widest uppercase text-[#930021]">
              Club Crosti
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#930021]" />
            <span className="text-sm text-[#7C4A1E]/50 font-medium">
              Programa de fidelidad
            </span>
          </div>

          {/* Tilted card */}
          <div className="transform rotate-[-4deg] hover:rotate-0 transition-transform duration-700 ease-out w-full max-w-[360px] mb-12 drop-shadow-2xl">
            <DigitalCardPreview
              config={cardConfig}
              customerName="Tu Nombre"
              stampCount={4}
              hideQR={false}
            />
          </div>

          {/* Perks list */}
          <ul className="space-y-3 w-full max-w-[320px]">
            {perks.map(({ Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#F5D89C]/50 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-[#930021]" />
                </div>
                <span className="text-[#4A2C11]/80 font-medium text-sm">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Right Panel: form ── */}
        <div className="lg:w-1/2 flex items-center justify-center px-6 lg:px-16 pb-16 pt-4 lg:pt-16">
          <div className="w-full max-w-md">

            <div className="mb-8">
              <h1
                className="text-4xl md:text-5xl font-bold text-[#4A2C11] tracking-tight mb-3 leading-[1.1]"
                style={{ fontFamily: "var(--font-outfit), sans-serif" }}
              >
                Únete al<br />
                <span className="text-[#930021]">Club Crosti</span>
              </h1>
              <p className="text-[#7C4A1E]/70 text-base leading-relaxed">
                Colecciona sellos en cada visita y gana recompensas exclusivas de Crosti.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-[0_4px_40px_rgba(0,0,0,0.06)] border border-[#F5D89C]/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-[#F5D89C]/30 to-transparent rounded-tr-3xl pointer-events-none" />
              <ClubRegistrationForm referralCode={searchParams.ref} />
            </div>

            <p className="text-xs text-center text-[#7C4A1E]/50 mt-5 leading-relaxed">
              Solo te escribiremos cuando tengas sellos nuevos o sorpresas especiales. Nunca spam.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}
