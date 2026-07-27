import type { ReactNode } from "react"
import { redirect } from "next/navigation"
import { STORE_ENABLED } from "@/lib/feature-flags"

// Con la tienda deshabilitada, todo /tienda/* (catálogo, checkout, pago,
// confirmación y la landing SEO) redirige a la portada.
export default function TiendaLayout({ children }: { children: ReactNode }) {
  if (!STORE_ENABLED) {
    redirect("/")
  }

  return <>{children}</>
}
