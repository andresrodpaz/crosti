import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// GET /api/featured-cookie — Devuelve la galleta del mes activa con sus datos completos
export async function GET() {
  try {
    const supabase = await createClient()

    const { data: featuredRow, error } = await supabase
      .from("featured_cookie")
      .select("id, cookie_id, custom_description, is_active")
      .eq("is_active", true)
      .maybeSingle()

    if (error) throw error
    if (!featuredRow?.cookie_id) return NextResponse.json(null)

    // Fetch de la cookie completa
    const { data: cookieData, error: cookieError } = await supabase
      .from("cookies")
      .select(`
        id, name, description, price, image_urls, image_url, main_image_index, is_visible,
        cookie_tags (
          tags (
            id, name, color_id,
            colors ( hex )
          )
        )
      `)
      .eq("id", featuredRow.cookie_id)
      .single()

    if (cookieError || !cookieData) return NextResponse.json(null)

    const tags = cookieData.cookie_tags?.map((ct: any) => ({
      id: ct.tags?.id,
      name: ct.tags?.name,
      color_hex: ct.tags?.colors?.hex || "#6b7280"
    })).filter((t: any) => t.id) || []

    let imageUrls: string[] = []
    if (cookieData.image_urls) {
      imageUrls = Array.isArray(cookieData.image_urls) ? cookieData.image_urls : []
    } else if (cookieData.image_url) {
      imageUrls = [cookieData.image_url]
    }

    return NextResponse.json({
      featured_id: featuredRow.id,
      custom_description: featuredRow.custom_description,
      ...cookieData,
      image_urls: imageUrls,
      tags,
      cookie_tags: undefined
    }, {
      headers: { 'Cache-Control': 'no-store, max-age=0' }
    })
  } catch (err) {
    console.error("[featured-cookie GET]", err)
    return NextResponse.json(null)
  }
}

// PUT /api/featured-cookie — Upserts la galleta del mes
export async function PUT(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { cookie_id, custom_description } = body

    // Check if row exists
    const { data: existing } = await supabase
      .from("featured_cookie")
      .select("id")
      .maybeSingle()

    if (existing?.id) {
      const { error } = await supabase
        .from("featured_cookie")
        .update({ cookie_id, custom_description, is_active: !!cookie_id })
        .eq("id", existing.id)
      if (error) throw error
    } else {
      const { error } = await supabase
        .from("featured_cookie")
        .insert([{ cookie_id, custom_description, is_active: !!cookie_id }])
      if (error) throw error
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error("[featured-cookie PUT]", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
