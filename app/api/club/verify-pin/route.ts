import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  try {
    const { pin } = await req.json()
    if (!pin) return NextResponse.json({ error: "PIN requerido" }, { status: 400 })

    const supabase = await createClient()
    const { data: config } = await supabase.from("club_card_config").select("staff_pin").single()

    if (!config?.staff_pin) {
      // Default fallback si no se ha configurado (para desarrollo)
      if (pin === "1234") return NextResponse.json({ success: true })
      return NextResponse.json({ error: "PIN incorrecto" }, { status: 401 })
    }

    const isValid = await bcrypt.compare(pin, config.staff_pin)
    if (isValid) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: "PIN incorrecto" }, { status: 401 })
    }
  } catch (error) {
    console.error("Error verifying PIN:", error)
    return NextResponse.json({ error: "Error de servidor" }, { status: 500 })
  }
}
