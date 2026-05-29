import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY || "re_mock")

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Check admin role
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (!profile || !["admin", "superadmin"].includes(profile.role)) {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 })
    }

    const { to } = await req.json()
    if (!to) {
      return NextResponse.json({ error: "Email destino requerido" }, { status: 400 })
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: "RESEND_API_KEY no configurada en el servidor" }, { status: 500 })
    }

    const emailFrom = process.env.EMAIL_FROM || "andres@entaubsi.resend.app"

    const result = await resend.emails.send({
      from: `Club Crosti Test <${emailFrom}>`,
      to,
      subject: "🧪 Email de prueba — Club Crosti",
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"></head>
        <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: Arial, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 0;">
            <tr>
              <td align="center">
                <table width="560" cellpadding="0" cellspacing="0" style="max-width: 560px; width: 100%; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
                  <tr>
                    <td style="background: #930021; padding: 32px 24px; text-align: center;">
                      <h1 style="color: #F5D78A; margin: 0; font-size: 28px; font-weight: 700;">Club Crosti 🍪</h1>
                      <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px;">Email de prueba del sistema</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 40px 32px; text-align: center;">
                      <div style="width: 64px; height: 64px; background: #d1fae5; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                        <span style="font-size: 32px;">✅</span>
                      </div>
                      <h2 style="color: #111827; margin: 0 0 12px; font-size: 22px;">¡El servicio de email funciona!</h2>
                      <p style="color: #6b7280; font-size: 15px; line-height: 1.6; margin: 0 0 8px;">
                        Este email de prueba fue enviado desde el panel de administración de Crosti.
                      </p>
                      <p style="color: #9ca3af; font-size: 13px; margin: 0;">
                        Remitente: <strong>${emailFrom}</strong>
                      </p>
                      <p style="color: #9ca3af; font-size: 13px; margin: 4px 0 0;">
                        Fecha: <strong>${new Date().toLocaleString("es-ES")}</strong>
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 0 32px 32px; text-align: center;">
                      <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://crosti.es"}/admin" style="background: #930021; color: white; padding: 12px 28px; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 15px; display: inline-block;">
                        Ir al panel admin
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    })

    console.log("[test-email] Result:", result)

    return NextResponse.json({
      success: true,
      messageId: result.data?.id,
      from: emailFrom,
      to,
    })
  } catch (error: any) {
    console.error("[test-email] Error:", error)
    return NextResponse.json(
      { error: error.message || "Error al enviar email de prueba" },
      { status: 500 }
    )
  }
}
