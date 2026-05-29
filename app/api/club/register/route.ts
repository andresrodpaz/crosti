import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { Resend } from "resend"
import { generateClubWelcomeEmailHTML } from "@/lib/club-email-templates"

const resend = new Resend(process.env.RESEND_API_KEY || "re_mock")

function generateCardNumber(): string {
  const num = Math.floor(Math.random() * 99999999).toString().padStart(8, "0")
  return `CC-${num}`
}

export async function POST(req: Request) {
  try {
    const { email, name, birthday, referralCode } = await req.json()
    if (!email) return NextResponse.json({ error: "Email requerido" }, { status: 400 })

    const supabase = await createClient()
    const { data: config } = await supabase.from("club_card_config").select("*").maybeSingle()
    const rewardDesc = config?.reward_description || "Tu cookie gratis"

    // Check if customer exists
    const { data: existing } = await supabase.from("club_customers").select("id").eq("email", email).single()
    if (existing) {
      return NextResponse.json({ error: "Este email ya está registrado en el Club" }, { status: 400 })
    }

    // Generate unique card number
    let cardNumber = generateCardNumber()
    let attempts = 0
    while (attempts < 5) {
      const { data: cardExists } = await supabase
        .from("club_customers")
        .select("id")
        .eq("card_number", cardNumber)
        .single()
      if (!cardExists) break
      cardNumber = generateCardNumber()
      attempts++
    }

    // Handle Referral
    let referredBy = null
    if (referralCode) {
      const { data: referer } = await supabase
        .from("club_customers")
        .select("id, stamp_count")
        .eq("referral_code", referralCode)
        .single()
      if (referer) {
        referredBy = referer.id
        await supabase.from("club_stamp_events").insert({
          customer_id: referer.id,
          given_by: "system_referral",
          stamps_given: 1,
          origin: "campaign",
          note: `Bonus por invitar a ${email}`,
        })
        await supabase
          .from("club_customers")
          .update({ stamp_count: referer.stamp_count + 1 })
          .eq("id", referer.id)
      }
    }

    // Insert new customer
    const { data: customer, error: insertError } = await supabase
      .from("club_customers")
      .insert([
        {
          email,
          name,
          birthday: birthday || null,
          referred_by: referredBy,
          stamp_count: 0,
          card_number: cardNumber,
        },
      ])
      .select()
      .single()

    if (insertError) throw insertError

    // Send Welcome Email
    const emailFrom = process.env.EMAIL_FROM || "andres@entaubsi.resend.app"
    if (process.env.RESEND_API_KEY) {
      try {
        const emailResult = await resend.emails.send({
          from: `Crosti Club <${emailFrom}>`,
          to: email,
          subject: "¡Bienvenido al Club Crosti! 🍪",
          html: generateClubWelcomeEmailHTML(name, 0, rewardDesc),
        })
        console.log("[register] Welcome email sent:", emailResult)
      } catch (emailErr) {
        console.error("[register] Error sending welcome email:", emailErr)
        // Don't fail the registration if email fails
      }
    }

    return NextResponse.json({ success: true, customerId: customer.id, cardNumber })
  } catch (error: any) {
    console.error("Register error:", error)
    return NextResponse.json({ error: error.message || "Error en el servidor" }, { status: 500 })
  }
}
