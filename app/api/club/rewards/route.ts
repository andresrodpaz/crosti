import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"

function getAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: rewards, error } = await supabase
      .from("club_rewards")
      .select("*")
      .order("points_cost", { ascending: true })

    if (error) throw error

    return NextResponse.json(rewards)
  } catch (error: any) {
    console.error("Error fetching rewards:", error)
    return NextResponse.json({ error: error.message || "Error al obtener premios" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { id, name, description, points_cost, image_url, is_active } = await req.json()
    if (!name || !points_cost) {
      return NextResponse.json({ error: "Nombre y coste de puntos son obligatorios" }, { status: 400 })
    }

    const supabaseServer = await createClient()
    const { data: { user } } = await supabaseServer.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const adminClient = getAdminClient()

    let result
    if (id) {
      // Editar
      result = await adminClient
        .from("club_rewards")
        .update({ name, description, points_cost, image_url, is_active, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single()
    } else {
      // Crear
      result = await adminClient
        .from("club_rewards")
        .insert([{ name, description, points_cost, image_url, is_active }])
        .select()
        .single()
    }

    if (result.error) throw result.error

    return NextResponse.json({ success: true, reward: result.data })
  } catch (error: any) {
    console.error("Error saving reward:", error)
    return NextResponse.json({ error: error.message || "Error al guardar el premio" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    
    if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 })

    const supabaseServer = await createClient()
    const { data: { user } } = await supabaseServer.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const adminClient = getAdminClient()
    const { error } = await adminClient.from("club_rewards").delete().eq("id", id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error deleting reward:", error)
    return NextResponse.json({ error: error.message || "Error al eliminar el premio" }, { status: 500 })
  }
}
