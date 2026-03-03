"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Menu, X, ShoppingBag } from "lucide-react"

interface NavbarProps {
  onCartClick?: () => void
  cartItemCount?: number
}

export function Navbar({ onCartClick, cartItemCount = 0 }: NavbarProps) {
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

          {/* Desktop Navigation */}
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

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-[#930021] p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-[#930021]/10 bg-[#F4E4C1]">
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
                    onClick={() => {
                      link.action && link.action()
                    }}
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
  )
}

