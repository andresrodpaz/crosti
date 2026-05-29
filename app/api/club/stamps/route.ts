import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { Resend } from "resend"
import { generateStampNotificationEmailHTML, generateRewardUnlockedEmailHTML } from "@/lib/club-email-templates"

const resend = new Resend(process.env.RESEND_API_KEY || "re_mock")

export async function POST(req: Request) {
  try {
    const { email, cardNumber, amount = 1, origin, platform, orderId, force } = await req.json()

    if (!email && !cardNumber) {
      return NextResponse.json({ error: "Email o número de tarjeta requerido" }, { status: 400 })
    }

    const supabase = await createClient()

    // 1. Find customer by email OR card_number
    let customerQuery = supabase.from("club_customers").select("*")
    if (cardNumber) {
      customerQuery = customerQuery.eq("card_number", cardNumber)
    } else {
      customerQuery = customerQuery.eq("email", email)
    }
    const { data: customer } = await customerQuery.single()

    if (!customer) {
      return NextResponse.json({ error: "El cliente no está registrado en el Club" }, { status: 404 })
    }

    // 2. Anti-duplicate validation for Delivery
    if (origin === "delivery" && orderId && !force) {
      const { data: existingEvent } = await supabase
        .from("club_stamp_events")
        .select("id")
        .eq("external_order_id", orderId)
        .eq("platform", platform)
        .single()

      if (existingEvent) {
        return NextResponse.json({ error: "DUPLICATE_ORDER" }, { status: 400 })
      }
    }

    // 3. Fetch Config
    const { data: config } = await supabase.from("club_card_config").select("*").single()
    const stampTotal = config?.stamp_total || 10

    // 4. Update Customer Stamps
    const newStampCount = customer.stamp_count + amount
    const newTotalStampsEver = (customer.total_stamps_ever || 0) + amount
    const rewardUnlocked = customer.stamp_count < stampTotal && newStampCount >= stampTotal

    const { error: updateError } = await supabase
      .from("club_customers")
      .update({
        stamp_count: newStampCount,
        total_stamps_ever: newTotalStampsEver,
        last_visit: new Date().toISOString(),
      })
      .eq("id", customer.id)

    if (updateError) throw updateError

    // 5. Insert Stamp Event
    await supabase.from("club_stamp_events").insert({
      customer_id: customer.id,
      given_by: "staff",
      stamps_given: amount,
      origin: origin || "counter",
      platform: platform || null,
      external_order_id: orderId || null,
    })

    // 6. Notifications
    if (process.env.RESEND_API_KEY) {
      if (rewardUnlocked && config?.notif_reward) {
        await resend.emails.send({
          from: "Crosti Club <club@crosti.es>",
          to: customer.email,
          subject: "¡Premio desbloqueado! 🎉",
          html: generateRewardUnlockedEmailHTML(config.reward_description || "Tu cookie gratis"),
        })
      } else if (config?.notif_stamp) {
        await resend.emails.send({
          from: "Crosti Club <club@crosti.es>",
          to: customer.email,
          subject: `+${amount} Sello${amount > 1 ? "s" : ""} añadido${amount > 1 ? "s" : ""} 🍪`,
          html: generateStampNotificationEmailHTML(amount, newStampCount, stampTotal),
        })
      }
    }

    return NextResponse.json({
      success: true,
      newStampCount,
      rewardUnlocked,
      customerName: customer.name,
      customerEmail: customer.email,
    })
  } catch (error: any) {
    console.error("Stamps error:", error)
    return NextResponse.json({ error: error.message || "Error en el servidor" }, { status: 500 })
  }
}
