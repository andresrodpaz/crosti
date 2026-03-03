"use client"

"use client"

import { Button } from "@/components/ui/button"
import { X, Menu, ShoppingBag, MessageCircle, Cookie, Clock, MapPin, Phone } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { NewsBanner } from "@/components/news-banner"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

const WHATSAPP_NUMBER = "34600000000"
const WHATSAPP_MESSAGE = "Hola! Me gustaría hacer un pedido de galletas Crosti 🍪"
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`

export default function TiendaPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const scrollToSection = (sectionId: string) => {
    window.location.href = `/#${sectionId}`
    setMobileMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-[#F8E19A]">
      <NewsBanner />
      <Navbar />

      {mobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 right-0 bg-[#F8E19A] z-30 px-4 py-4 shadow-lg border-t border-[#930021]/10">
          <nav className="flex flex-col gap-4">
            <Link href="/" className="text-[#930021] text-lg font-medium py-2" onClick={() => setMobileMenuOpen(false)}>Inicio</Link>
            <button onClick={() => scrollToSection("nosotros")} className="text-[#930021] text-lg font-medium py-2 text-left">Nosotros</button>
            <button onClick={() => scrollToSection("galletas")} className="text-[#930021] text-lg font-medium py-2 text-left">Galletas</button>
            <button onClick={() => scrollToSection("contacto")} className="text-[#930021] text-lg font-medium py-2 text-left">Contacto</button>
            <Link href="/tienda" className="text-[#930021] text-lg font-bold py-2 flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
              <ShoppingBag className="w-5 h-5" />Tienda
            </Link>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center px-4 py-16 md:py-24 text-center">

        {/* Cookie illustration */}
        <div className="relative mb-10">
          <div className="w-36 h-36 rounded-full bg-white/60 border-4 border-[#930021]/20 flex items-center justify-center shadow-xl">
            <Cookie className="w-20 h-20 text-[#930021]" strokeWidth={1.2} />
          </div>
          <div className="absolute -top-2 -right-2 w-10 h-10 bg-[#930021] rounded-full flex items-center justify-center shadow-md">
            <span className="text-[#F8E19A] text-lg font-bold">!</span>
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-4xl md:text-6xl font-bold text-[#930021] mb-4 text-balance leading-tight">
          Tienda online
          <br />
          próximamente
        </h1>

        <p className="text-lg md:text-xl text-[#930021]/70 max-w-xl mb-4 text-pretty leading-relaxed">
          Estamos preparando algo delicioso. Por ahora, puedes hacer tu pedido directamente por WhatsApp y te atendemos de manera personalizada.
        </p>

        {/* Info pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          <div className="flex items-center gap-2 bg-white/70 border border-[#930021]/20 rounded-full px-4 py-2 text-sm text-[#930021] font-medium">
            <Clock className="w-4 h-4" />
            Respuesta en menos de 1h
          </div>
          <div className="flex items-center gap-2 bg-white/70 border border-[#930021]/20 rounded-full px-4 py-2 text-sm text-[#930021] font-medium">
            <MapPin className="w-4 h-4" />
            Entrega en Barcelona
          </div>
          <div className="flex items-center gap-2 bg-white/70 border border-[#930021]/20 rounded-full px-4 py-2 text-sm text-[#930021] font-medium">
            <Phone className="w-4 h-4" />
            Trato directo y personalizado
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
          <Button
            asChild
            size="lg"
            className="flex-1 h-14 text-base font-bold bg-[#25D366] hover:bg-[#20bd59] text-white shadow-lg shadow-[#25D366]/30 hover:shadow-[#25D366]/50 transition-all"
          >
            <Link href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="w-5 h-5 mr-2" />
              Pedir por WhatsApp
            </Link>
          </Button>

          <Button
            asChild
            size="lg"
            variant="outline"
            className="flex-1 h-14 text-base font-semibold border-2 border-[#930021] text-[#930021] hover:bg-[#930021] hover:text-[#F8E19A] bg-transparent transition-all"
          >
            <Link href="/galletas">
              Ver Galletas
            </Link>
          </Button>
        </div>

        {/* Divider */}
        <div className="w-full max-w-md mt-16 mb-8 border-t-2 border-[#930021]/10" />

        {/* How it works */}
        <div className="w-full max-w-2xl">
          <h2 className="text-2xl font-bold text-[#930021] mb-8">¿Cómo funciona el pedido?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: "1", title: "Elige tus galletas", desc: "Mira nuestro catálogo y decide cuáles quieres pedir" },
              { step: "2", title: "Escríbenos", desc: "Mándanos un WhatsApp con tu selección y dirección de entrega" },
              { step: "3", title: "Recibe tu pedido", desc: "Coordinamos la entrega y recibes tus galletas frescas" },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#930021] text-[#F8E19A] flex items-center justify-center text-xl font-bold shadow-md">
                  {step}
                </div>
                <h3 className="font-bold text-[#930021] text-base">{title}</h3>
                <p className="text-sm text-[#930021]/70 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

      </main>
      <Footer />
    </div>
  )
}
