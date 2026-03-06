"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Menu, X, Truck, Cookie, Leaf } from "lucide-react"

export function CrostiHero() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const isHome = pathname === "/"

  const scrollToSection = (sectionId: string) => {
    if (isHome) {
      const element = document.getElementById(sectionId)
      if (element) {
        element.scrollIntoView({ behavior: "smooth" })
      }
    } else {
      window.location.href = `/#${sectionId}`
    }
    setMobileMenuOpen(false)
  }

  const navLinks = [
    { name: "Inicio", href: "/" },
    { name: "Nosotros", action: () => scrollToSection("nosotros") },
    { name: "Galletas", href: "/galletas" },
    { name: "Contacto", action: () => scrollToSection("contacto") },
    { name: "Tienda", href: "/tienda" },
  ]

  return (
    <div className="min-h-screen bg-[#F8E19A] relative overflow-visible flex flex-col">

      {/* Mobile squiggle — se oculta cuando el menú está abierto */}
      {!mobileMenuOpen && (
        <svg
          className="block sm:hidden absolute inset-0 w-full h-full pointer-events-none z-[100]"
          viewBox="0 0 390 844"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice"
          stroke="#9b001c"
          fill="none"
          strokeWidth="11"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M300 -50
               C280 0,290 80,320 100
               C330 110,345 95,340 80
               C335 65,320 70,318 85
               C315 200,350 220,380 240
               C410 260,410 380,380 420
               C360 450,380 500,390 560
               C392 580,380 600,370 620" />
        </svg>
      )}

      {/* Navbar */}
      <header className="relative z-50 py-4 md:py-6 px-4 md:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center hover:opacity-90 transition-opacity">
            <Image
              src="/images/crosti-logo-transparent.png"
              alt="Crosti Cookies Logo"
              width={240}
              height={110}
              className="h-16 md:h-20 lg:h-24 w-auto"
              priority
            />
          </Link>

          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            {navLinks.map((link) => (
              link.href ? (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-[#930021] hover:opacity-80 transition-opacity text-base lg:text-lg font-medium"
                >
                  {link.name}
                </Link>
              ) : (
                <button
                  key={link.name}
                  onClick={link.action}
                  className="text-[#930021] hover:opacity-80 transition-opacity text-base lg:text-lg font-medium"
                >
                  {link.name}
                </button>
              )
            ))}
          </nav>

          <button
            className="md:hidden text-[#930021] p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-[#930021]/10 bg-[#F8E19A]">
            <nav className="flex flex-col gap-4 px-4 pb-4">
              {navLinks.map((link) => (
                link.href ? (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="text-[#930021] text-lg font-medium py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                ) : (
                  <button
                    key={link.name}
                    onClick={() => { link.action && link.action() }}
                    className="text-[#930021] text-lg font-medium py-2 text-left"
                  >
                    {link.name}
                  </button>
                )
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* Hero Content */}
      <section className="relative px-4 md:px-8 lg:px-16 py-8 flex-1 flex items-center">
        <div className="grid md:grid-cols-2 gap-8 items-center w-full max-w-7xl mx-auto relative z-20">
          <div className="space-y-6 text-left">
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-[#930021] leading-[1.1]">
              <span className="block">Fresh baked</span>
              <span className="block">cookies</span>
            </h1>
            <p className="text-[#930021] text-lg md:text-xl font-normal">
              Galletas artesanales hechas con amor desde Barcelona
            </p>
          </div>

          <div className="relative h-[400px] md:h-[500px] lg:h-[550px] flex items-center justify-center">
            <div className="relative w-full max-w-[450px] h-full rounded-[2rem] overflow-hidden shadow-2xl border-2 border-[#930021] z-[10]">
              <Image
                src="/images/crosti-cookies-hero.jpg"
                alt="Crosti Cookies Stack"
                fill
                className="object-cover object-center scale-115 transition-transform duration-700 ease-in-out hover:scale-125"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-[#924C14] py-5 mt-auto relative z-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full border-2 border-[#F8E19A] flex items-center justify-center flex-shrink-0">
                <Truck className="w-6 h-6 text-[#F8E19A]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#F8E19A] text-base md:text-lg">Entregas en Barcelona</h3>
                <p className="text-[#F8E19A]/90 text-sm md:text-base">Galletas en la puerta de tu casa</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full border-2 border-[#F8E19A] flex items-center justify-center flex-shrink-0">
                <Cookie className="w-6 h-6 text-[#F8E19A]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#F8E19A] text-base md:text-lg">Ingredientes premium</h3>
                <p className="text-[#F8E19A]/90 text-sm md:text-base">Chocolate belga y avellanas del Piamonte</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full border-2 border-[#F8E19A] flex items-center justify-center flex-shrink-0">
                <Leaf className="w-6 h-6 text-[#F8E19A]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#F8E19A] text-base md:text-lg">Opciones veganas</h3>
                <p className="text-[#F8E19A]/90 text-sm md:text-base">Deliciosas galletas para todos</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}