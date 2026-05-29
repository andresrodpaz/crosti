import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY || "re_mock")

// ── Convert visual editor blocks to email HTML ────────────────────────────
function blocksToHtml(blocks: any[], styleConfig: any): string {
  const font = styleConfig.font || "Arial, sans-serif"
  const primaryColor = styleConfig.primaryColor || "#930021"
  const bgColor = styleConfig.bgColor || "#ffffff"
  const textColor = styleConfig.textColor || "#1f2937"

  const blockHtml = blocks.map((block: any) => {
    switch (block.type) {
      case "header":
        return `
          <tr>
            <td style="background-color: ${block.bgColor || primaryColor}; padding: ${block.padding || '32px 24px'}; text-align: ${block.align || 'center'};">
              <h1 style="color: ${block.textColor || "#ffffff"}; margin: 0; font-size: ${block.titleSize || '28px'}; font-family: ${block.font || font}; font-weight: 700;">
                ${block.title || "Club Crosti"}
              </h1>
              ${block.subtitle ? `<p style="color: ${block.textColor || "#ffffff"}; opacity: 0.85; margin: 8px 0 0; font-size: ${block.subtitleSize || '15px'};">${block.subtitle}</p>` : ""}
            </td>
          </tr>`
      case "text":
        return `
          <tr>
            <td style="background-color: ${block.bgColor || 'transparent'}; padding: ${block.padding || "24px"}; font-family: ${font}; color: ${block.textColor || textColor}; font-size: ${block.fontSize || "16px"}; line-height: 1.6; text-align: ${block.align || 'left'};">
              ${block.content?.replace(/\n/g, "<br>") || ""}
            </td>
          </tr>`
      case "image":
        if (!block.url) return ""
        return `
          <tr>
            <td style="background-color: ${block.bgColor || 'transparent'}; padding: ${block.padding || '16px 24px'}; text-align: ${block.align || 'center'};">
              <img src="${block.url}" alt="${block.alt || ""}" style="max-width: ${block.width || "100%"}; height: auto; border-radius: ${block.borderRadius || '12px'}; display: inline-block; margin: 0 auto;" />
              ${block.caption ? `<p style="font-size: 12px; color: #9ca3af; margin: 8px 0 0; font-family: ${font}; text-align: center;">${block.caption}</p>` : ""}
            </td>
          </tr>`
      case "button":
        return `
          <tr>
            <td style="background-color: ${block.blockBgColor || 'transparent'}; padding: ${block.padding || '16px 24px'}; text-align: ${block.align || "center"};">
              <a href="${block.url || "#"}" style="background-color: ${block.bgColor || primaryColor}; color: ${block.textColor || "#ffffff"}; padding: 14px 32px; text-decoration: none; border-radius: ${block.borderRadius || '10px'}; font-weight: 700; font-size: ${block.fontSize || '16px'}; display: inline-block; font-family: ${font};">
                ${block.text || "Ver más"}
              </a>
            </td>
          </tr>`
      case "divider":
        return `
          <tr>
            <td style="background-color: ${block.bgColor || 'transparent'}; padding: ${block.padding || '16px 24px'};">
              <hr style="border: none; border-top: ${block.thickness || "1"}px ${block.style || 'solid'} ${block.color || "#e5e7eb"}; margin: 0;" />
            </td>
          </tr>`
      default:
        return ""
    }
  }).join("")

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: ${font};">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 32px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: ${bgColor}; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
              ${blockHtml}
              <tr>
                <td style="padding: 24px; text-align: center; font-family: ${font};">
                  <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                    Eres socio del Club Crosti. 
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://crosti.es'}/club" style="color: ${primaryColor};">Gestionar preferencias</a>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `
}

export async function POST(req: Request) {
  try {
    const { campaignId } = await req.json()
    if (!campaignId) {
      return NextResponse.json({ error: "Campaign ID requerido" }, { status: 400 })
    }

    const supabase = await createClient()

    // 1. Get campaign
    const { data: campaign, error: campaignError } = await supabase
      .from("club_campaigns")
      .select("*")
      .eq("id", campaignId)
      .single()

    if (campaignError || !campaign) {
      return NextResponse.json({ error: "Campaña no encontrada" }, { status: 404 })
    }

    if (campaign.status === "sent") {
      return NextResponse.json({ error: "Esta campaña ya fue enviada" }, { status: 400 })
    }

    // 2. Get recipients based on segment
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    let recipientsQuery = supabase.from("club_customers").select("id, email, name")

    if (campaign.target_segment === "active") {
      recipientsQuery = recipientsQuery.gte("last_visit", thirtyDaysAgo.toISOString())
    } else if (campaign.target_segment === "inactive") {
      recipientsQuery = recipientsQuery
        .or(`last_visit.lt.${thirtyDaysAgo.toISOString()},last_visit.is.null`)
    }

    const { data: recipients } = await recipientsQuery

    if (!recipients || recipients.length === 0) {
      return NextResponse.json({ error: "No hay destinatarios para este segmento" }, { status: 400 })
    }

    // 3. Send emails via Resend
    let sentCount = 0
    const subject = campaign.subject || campaign.name

    // Detect if message is JSON blocks (new visual editor) or plain text (legacy)
    let messageHtml = ""
    let parsedBlocks: any[] | null = null
    let parsedStyleConfig: any = {}
    
    try {
      const parsed = JSON.parse(campaign.message)
      if (Array.isArray(parsed)) {
        parsedBlocks = parsed
      } else if (parsed && parsed.blocks && Array.isArray(parsed.blocks)) {
        parsedBlocks = parsed.blocks
        parsedStyleConfig = parsed.styleConfig || {}
      }
    } catch {
      // plain text
    }

    if (parsedBlocks) {
      // Combine parsedStyleConfig with campaign.style_config (if it exists in DB)
      const finalStyleConfig = { ...parsedStyleConfig, ...(campaign.style_config || {}) }
      messageHtml = blocksToHtml(parsedBlocks, finalStyleConfig)
    } else {
      const bgColor = campaign.style_config?.bgColor || "#fff8f0"
      const primaryColor = campaign.style_config?.primaryColor || "#930021"
      messageHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: ${primaryColor}; font-size: 28px; margin: 0;">Club Crosti 🍪</h1>
        </div>
        <div style="background: ${bgColor}; border-radius: 16px; padding: 32px; border: 1px solid #f5d89c;">
          <p style="color: #4a2c11; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
            ${campaign.message.replace(/\n/g, "<br>")}
          </p>
        </div>
        <div style="text-align: center; margin-top: 32px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://crosti.es'}/club" style="background: ${primaryColor}; color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">
            Ver mi tarjeta
          </a>
        </div>
        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 32px;">
          Eres socio del Club Crosti. <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://crosti.es'}/club" style="color: ${primaryColor};">Gestionar preferencias</a>
        </p>
      </div>
    `
    }

    const emailFrom = process.env.EMAIL_FROM || "andres@entaubsi.resend.app"
    if (process.env.RESEND_API_KEY) {
      // Send in batches of 50
      const batchSize = 50
      for (let i = 0; i < recipients.length; i += batchSize) {
        const batch = recipients.slice(i, i + batchSize)
        const results = await Promise.allSettled(
          batch.map((r) =>
            resend.emails.send({
              from: `Crosti Club <${emailFrom}>`,
              to: r.email,
              subject,
              html: messageHtml.replace("Hola", `Hola ${r.name || ""}`),
            })
          )
        )
        results.forEach((result, idx) => {
          if (result.status === "rejected") {
            console.error(`[campaigns/send] Failed to send to ${batch[idx]?.email}:`, result.reason)
          } else {
            console.log(`[campaigns/send] Sent to ${batch[idx]?.email}:`, result.value)
          }
        })
        sentCount += results.filter(r => r.status === "fulfilled").length
      }
    } else {
      // Dev mode — just count recipients
      sentCount = recipients.length
    }

    // 4. Update campaign status
    await supabase
      .from("club_campaigns")
      .update({
        status: "sent",
        sent_at: new Date().toISOString(),
        sent_count: sentCount,
        reach_count: recipients.length,
      })
      .eq("id", campaignId)

    return NextResponse.json({ success: true, sentCount, reachCount: recipients.length })
  } catch (error: any) {
    console.error("Campaign send error:", error)
    return NextResponse.json({ error: error.message || "Error en el servidor" }, { status: 500 })
  }
}
