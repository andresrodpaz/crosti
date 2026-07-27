"use client"

import { Loader2 } from "lucide-react"

export function AdminSpinner({ message = "Cargando..." }: { message?: string }) {
  return (
    <div className="p-12 flex flex-col items-center justify-center min-h-[220px] w-full text-center">
      <Loader2 className="w-9 h-9 text-[#930021] animate-spin mb-3" />
      <p className="text-sm font-medium text-gray-600">{message}</p>
    </div>
  )
}
