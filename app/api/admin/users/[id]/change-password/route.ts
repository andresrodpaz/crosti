import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { password } = await request.json()
    const { id } = await params

    if (!password || password.length < 6) {
      return NextResponse.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 })
    }

    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (!profile || !["admin", "developer"].includes(profile.role)) {
      return NextResponse.json({ error: "No tienes permisos para cambiar contraseñas" }, { status: 403 })
    }

    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(id, {
      password: password,
    })

    if (updateError) {
      console.error("[Message] Error updating password:", updateError)
      return NextResponse.json({ error: updateError.message }, { status: 400 })
    }

    console.log("[Message] Password updated successfully for user:", id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[Message] Error changing password:", error)
    return NextResponse.json({ error: "Error al cambiar la contraseña" }, { status: 500 })
  }
}
