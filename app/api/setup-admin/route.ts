// Ruta API para crear el usuario admin - SOLO EJECUTAR UNA VEZ
import { createClient } from "@supabase/supabase-js"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  // Verificar que sea una solicitud autorizada
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.ADMIN_SETUP_TOKEN}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const supabaseAdmin = createClient(process.env.SUPABASE_URL || "", process.env.SUPABASE_SERVICE_ROLE_KEY || "")

    // Crear usuario en Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: "admin@crosti.com",
      password: "crosti2025",
      email_confirm: true,
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: "No se pudo crear el usuario" }, { status: 400 })
    }

    // Crear perfil del usuario
    const { error: profileError } = await supabaseAdmin.from("profiles").insert({
      id: authData.user.id,
      email: "admin@crosti.com",
      name: "Administrador",
      role: "admin",
    })

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 })
    }

    return NextResponse.json(
      {
        success: true,
        userId: authData.user.id,
        message: "Usuario admin creado exitosamente",
      },
      { status: 201 },
    )
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
