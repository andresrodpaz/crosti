"use client"

import { Truck, Award, Leaf, Menu, X, ShoppingBag } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState } from "react"

export function CrostiHero() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
      setMobileMenuOpen(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8E19A] relative overflow-hidden flex flex-col">
      <header className="relative z-20 flex items-center justify-between px-4 md:px-8 lg:px-16 py-4 md:py-5">
        <Link href="/" className="flex items-center">
          <Image
            src="/images/crosti-logo-transparent.png"
            alt="Crosti Cookies Logo"
            width={200}
            height={90}
            className="h-14 md:h-16 lg:h-20 w-auto"
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 lg:gap-10">
          <Link
            href="/"
            className="text-[#930021] hover:opacity-80 transition-opacity text-base lg:text-lg font-medium"
          >
            Inicio
          </Link>
          <button
            onClick={() => scrollToSection("nosotros")}
            className="text-[#930021] hover:opacity-80 transition-opacity text-base lg:text-lg font-medium"
          >
            Nosotros
          </button>
          <button
            onClick={() => scrollToSection("galletas")}
            className="text-[#930021] hover:opacity-80 transition-opacity text-base lg:text-lg font-medium"
          >
            Galletas
          </button>
          <button
            onClick={() => scrollToSection("contacto")}
            className="text-[#930021] hover:opacity-80 transition-opacity text-base lg:text-lg font-medium"
          >
            Contacto
          </button>
          <Link
            href="/tienda"
            className="text-[#930021] hover:opacity-80 transition-opacity text-base lg:text-lg font-medium flex items-center gap-2"
          >
            <ShoppingBag className="w-5 h-5" />
            Tienda
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-[#930021] p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 right-0 bg-[#F8E19A] z-30 px-4 py-4 shadow-lg border-t border-[#930021]/10">
          <nav className="flex flex-col gap-4">
            <Link href="/" className="text-[#930021] text-lg font-medium py-2" onClick={() => setMobileMenuOpen(false)}>
              Inicio
            </Link>
            <button
              onClick={() => scrollToSection("nosotros")}
              className="text-[#930021] text-lg font-medium py-2 text-left"
            >
              Nosotros
            </button>
            <button
              onClick={() => scrollToSection("galletas")}
              className="text-[#930021] text-lg font-medium py-2 text-left"
            >
              Galletas
            </button>
            <button
              onClick={() => scrollToSection("contacto")}
              className="text-[#930021] text-lg font-medium py-2 text-left"
            >
              Contacto
            </button>
            <Link
              href="/tienda"
              className="text-[#930021] text-lg font-medium py-2 flex items-center gap-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <ShoppingBag className="w-5 h-5" />
              Tienda
            </Link>
          </nav>
        </div>
      )}

      <section className="relative z-10 px-4 md:px-8 lg:px-16 py-8 flex-1 flex items-center">
        <div className="grid md:grid-cols-2 gap-8 items-center w-full max-w-7xl mx-auto">
          <div className="space-y-4 text-center md:text-left">
            <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold text-[#930021] leading-[1.1]">
              <span className="block">Fresh baked</span>
              <span className="inline-block">cookies</span>
            </h1>
            <p className="text-[#930021]/80 text-lg md:text-xl">Cookies Artesanales hechas con amor</p>
          </div>

          <div className="relative h-[500px] md:h-[600px] overflow-hidden">
            <div className="w-full h-full bg-white rounded-3xl shadow-lg flex items-center justify-center overflow-hidden border-8 border-[#930021]">
              <Image src="/images/crosti-022.jpg" alt="Crosti Cookies" fill className="object-cover" priority />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#924C14] py-5 mt-auto">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full border-2 border-[#F8E19A] flex items-center justify-center flex-shrink-0">
                <Truck className="w-6 h-6 text-[#F8E19A]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#F8E19A] text-base md:text-lg">Haz tu pedido en</h3>
                <p className="text-[#F8E19A]/90 text-sm md:text-base font-medium">Glovo & Uber Eats</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full border-2 border-[#F8E19A] flex items-center justify-center flex-shrink-0">
                <Award className="w-6 h-6 text-[#F8E19A]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#F8E19A] text-base md:text-lg">Ingredientes premium</h3>
                <p className="text-[#F8E19A]/70 text-sm md:text-base">Chocolate belga y avellanas</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full border-2 border-[#F8E19A] flex items-center justify-center flex-shrink-0">
                <Leaf className="w-6 h-6 text-[#F8E19A]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#F8E19A] text-base md:text-lg">Opciones veganas</h3>
                <p className="text-[#F8E19A]/70 text-sm md:text-base">Deliciosas galletas para todos</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
