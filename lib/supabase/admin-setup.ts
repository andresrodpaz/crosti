// Script para crear el usuario admin directamente desde Supabase
// Usa createServerClient para operaciones de administrador
import { createClient } from "@supabase/supabase-js"

export async function createAdminUser() {
  const supabaseAdmin = createClient(process.env.SUPABASE_URL || "", process.env.SUPABASE_SERVICE_ROLE_KEY || "", {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  // Crear usuario en Auth
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: "admin@crosti.com",
    password: "crosti2025",
    email_confirm: true, // Confirmar automáticamente el email
  })

  if (authError) {
    console.error("Error creando usuario:", authError)
    return { error: authError.message }
  }

  if (!authData.user) {
    return { error: "No se pudo crear el usuario" }
  }

  // Crear perfil del usuario
  const { error: profileError } = await supabaseAdmin.from("profiles").insert({
    id: authData.user.id,
    email: "admin@crosti.com",
    name: "Administrador",
    role: "admin",
  })

  if (profileError) {
    console.error("Error creando perfil:", profileError)
    return { error: profileError.message }
  }

  return { success: true, userId: authData.user.id }
}
