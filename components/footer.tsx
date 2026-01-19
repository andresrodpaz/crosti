import { Facebook, Instagram } from "lucide-react"
import Image from "next/image"

export function Footer() {
  return (
    <footer className="bg-[#924C14] py-6 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">
          {/* Logo */}
          <div className="w-16 h-16 flex items-center justify-center flex-shrink-0">
            <Image src="/logo-footer.png" alt="Crosti Cookies" width={64} height={64} className="object-contain" />
          </div>

          {/* Copyright - centered on mobile, normal on desktop */}
          <p className="text-[#F9E7AE]/70 text-xs md:text-sm text-center order-last md:order-none">
            © 2025 Crosti Barcelona. Todos los derechos reservados.
          </p>

          {/* Social Icons */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#F9E7AE] hover:text-white transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="w-5 h-5" />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#F9E7AE] hover:text-white transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="w-5 h-5" />
            </a>
            <a
              href="https://tiktok.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#F9E7AE] hover:text-white transition-colors"
              aria-label="TikTok"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
