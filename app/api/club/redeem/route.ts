import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  try {
    const { customerId, rewardId } = await req.json()
    
    if (!customerId || !rewardId) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 })
    }

    const supabase = await createClient()

    // 1. Obtener datos del cliente y del premio
    const { data: customer } = await supabase.from("club_customers").select("id, stamp_count").eq("id", customerId).single()
    const { data: reward } = await supabase.from("club_rewards").select("id, points_cost, name").eq("id", rewardId).single()

    if (!customer) return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 })
    if (!reward) return NextResponse.json({ error: "Premio no encontrado" }, { status: 404 })

    // 2. Verificar saldo
    if (customer.stamp_count < reward.points_cost) {
      return NextResponse.json({ error: "Puntos insuficientes para este premio" }, { status: 400 })
    }

    // 3. Restar puntos al cliente
    const newStampCount = customer.stamp_count - reward.points_cost
    const { error: updateError } = await supabase
      .from("club_customers")
      .update({ stamp_count: newStampCount })
      .eq("id", customer.id)

    if (updateError) throw updateError

    // 4. Registrar el canje en el historial
    const { error: redemptionError } = await supabase
      .from("club_redemptions")
      .insert({
        customer_id: customer.id,
        reward_id: reward.id,
        points_spent: reward.points_cost
      })

    if (redemptionError) {
      // Si falla registrar el historial, al menos lo logueamos (el saldo ya se descontó)
      console.error("No se pudo registrar el historial de canje:", redemptionError)
    }

    return NextResponse.json({ success: true, newStampCount, rewardName: reward.name })
  } catch (error: any) {
    console.error("Error redeeming reward:", error)
    return NextResponse.json({ error: error.message || "Error al procesar el canje" }, { status: 500 })
  }
}
