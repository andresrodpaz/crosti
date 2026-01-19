"use client"

import type React from "react"
import Link from "next/link"
import { ShoppingBag, MapPin } from "lucide-react"

export function CTASection() {
  const scrollToContact = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const element = document.getElementById("contacto")
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <section className="relative py-16 md:py-20 px-4 md:px-8">
      {/* Background image - melted chocolate */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('/images/image.png')`,
        }}
      />
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/40" />

      <div className="relative z-10 text-center max-w-3xl mx-auto">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 md:mb-4">
          ¿Listo para probar Crosti?
        </h2>
        <p className="text-white/90 text-sm mb-6 md:mb-8 max-w-md mx-auto px-4">
          Compra online con entrega programada o visita nuestra tienda en Barcelona
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4">
          <Link
            href="/tienda"
            className="inline-flex items-center gap-2 px-6 md:px-8 py-2.5 md:py-3 bg-[#930021] text-white rounded-full font-semibold text-sm hover:bg-[#7a001a] transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            Comprar Online
          </Link>
          <a
            href="#contacto"
            onClick={scrollToContact}
            className="inline-flex items-center gap-2 px-6 md:px-8 py-2.5 md:py-3 bg-white text-[#930021] rounded-full font-semibold text-sm hover:bg-[#F9E7AE] transition-colors"
          >
            <MapPin className="w-4 h-4" />
            Visítanos Hoy
          </a>
        </div>
      </div>
    </section>
  )
}
