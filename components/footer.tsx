"use client"

import { Facebook, Instagram } from "lucide-react"
import Image from "next/image"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { defaultSocialSettings, getSocialSettingsFromSections } from "@/lib/social-settings"

export function Footer() {
  const [social, setSocial] = useState(defaultSocialSettings)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase.from("landing_config").select("sections").single()
      setSocial(getSocialSettingsFromSections(data?.sections))
    }
    load()
  }, [])

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
              href="https://www.facebook.com/p/Crosti-Cookies-61581835744529/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#F9E7AE] hover:text-white transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="w-5 h-5" />
            </a>
            <a
              href={social.instagram_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#F9E7AE] hover:text-white transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="w-5 h-5" />
            </a>
            <a
              href={social.pinterest_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#F9E7AE] hover:text-white transition-colors"
              aria-label="Pinterest"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.04 2C6.86 2 4 5.32 4 8.94c0 2.47.94 4.66 2.95 5.48.33.14.62.01.71-.36.07-.26.22-.9.29-1.17.1-.36.06-.49-.22-.83-.62-.73-1.01-1.67-1.01-3 0-3.86 2.89-7.32 7.53-7.32 4.11 0 6.37 2.52 6.37 5.88 0 4.42-1.95 8.15-4.85 8.15-1.6 0-2.8-1.33-2.41-2.96.45-1.95 1.33-4.06 1.33-5.47 0-1.26-.68-2.31-2.08-2.31-1.65 0-2.98 1.7-2.98 3.98 0 1.45.49 2.44.49 2.44l-1.97 8.34c-.58 2.44-.09 5.43-.05 5.73.03.18.26.23.37.09.16-.2 2.24-2.77 2.94-5.32.2-.72 1.15-4.47 1.15-4.47.57 1.09 2.23 2.06 4 2.06 5.26 0 8.84-4.79 8.84-11.2C22 6.52 17.88 2 12.04 2Z" />
              </svg>
            </a>
            <a
              href="https://www.tiktok.com/@crosticookies"
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
