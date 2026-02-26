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
  ]

  return (
    <header className="bg-[#F8E19A] py-4 md:py-6 px-4 md:px-8 lg:px-16 shadow-sm sticky top-0 z-40 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center hover:opacity-90 transition-opacity">
          <Image
            src="/images/crosti-logo-transparent.png"
            alt="Crosti Cookies Logo"
            width={180}
            height={80}
            className="h-14 md:h-16 lg:h-20 w-auto"
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8 lg:gap-10 ml-auto">
          <nav className="flex items-center gap-6 lg:gap-8">
            {navLinks.map((link) => (
              link.href ? (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-[#930021] hover:opacity-80 transition-opacity text-base lg:text-lg font-bold"
                >
                  {link.name}
                </Link>
              ) : (
                <button
                  key={link.name}
                  onClick={link.action}
                  className="text-[#930021] hover:opacity-80 transition-opacity text-base lg:text-lg font-bold"
                >
                  {link.name}
                </button>
              )
            ))}
            
            <Link
              href="/tienda"
              className="text-[#930021] hover:opacity-80 transition-opacity text-base lg:text-lg font-bold flex items-center gap-2"
            >
              <ShoppingBag className="w-5 h-5" />
              Tienda
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {onCartClick && (
              <button
                className="relative text-[#930021] p-2 hover:bg-[#930021]/10 rounded-full transition-colors lg:hidden"
                onClick={onCartClick}
                aria-label="Cart"
              >
                <ShoppingBag className="w-6 h-6" />
                {cartItemCount > 0 && (
                  <span className="absolute top-0 right-0 bg-[#930021] text-[#F8E19A] w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold">
                    {cartItemCount}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-3 md:hidden">
            {onCartClick && (
              <button
                className="relative text-[#930021] p-2 hover:bg-[#930021]/10 rounded-full transition-colors"
                onClick={onCartClick}
                aria-label="Cart"
              >
                <ShoppingBag className="w-6 h-6" />
                {cartItemCount > 0 && (
                  <span className="absolute top-0 right-0 bg-[#930021] text-[#F8E19A] w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold">
                    {cartItemCount}
                  </span>
                )}
              </button>
            )}
            <button
            className="text-[#930021] p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
            >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-4 pt-4 border-t border-[#930021]/10 bg-[#F8E19A]">
          <nav className="flex flex-col gap-4 px-4 pb-4">
            {navLinks.map((link) => (
               link.href ? (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-[#930021] text-lg font-bold py-2"
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
                  className="text-[#930021] text-lg font-bold py-2 text-left"
                >
                  {link.name}
                </button>
               )
            ))}
            <Link
              href="/tienda"
              className="text-[#930021] text-lg font-bold py-2 flex items-center gap-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <ShoppingBag className="w-5 h-5" />
              Tienda
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}

