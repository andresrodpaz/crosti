import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const showAll = searchParams.get("all") === "true"

    let query = supabase.from("banners").select("*").order("display_order", { ascending: true })

    if (!showAll) {
      query = query.eq("is_active", true)
    }

    const { data, error } = await query

    if (error) {
      console.error("[Message] Error fetching banners:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Filter by date if starts_at/ends_at are set (only for public view)
    if (!showAll) {
      const now = new Date()
      const activeBanners = (data || []).filter((banner) => {
        if (banner.starts_at && new Date(banner.starts_at) > now) return false
        if (banner.ends_at && new Date(banner.ends_at) < now) return false
        return true
      })
      return NextResponse.json(activeBanners)
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error("[Message] Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { data, error } = await supabase
      .from("banners")
      .insert([body])
      .select()
      .single()

    if (error) {
      console.error("[Message] Error creating banner:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("[Message] Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
