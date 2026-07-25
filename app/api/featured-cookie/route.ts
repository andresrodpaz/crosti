import { createPublicClient } from "@/lib/supabase/public"
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// GET /api/featured-cookie — Devuelve la galleta del mes activa con sus datos completos
export async function GET() {
  try {
    const supabase = createPublicClient()

    const { data: featuredRows, error } = await supabase
      .from("featured_cookie")
      .select("id, cookie_id, custom_description, is_active")
      .eq("is_active", true)
      .limit(1)

    if (error) throw error
    const featuredRow = featuredRows && featuredRows.length > 0 ? featuredRows[0] : null
    
    if (!featuredRow?.cookie_id) return NextResponse.json(null)

    // Fetch de la cookie completa
    const { data: cookieData, error: cookieError } = await supabase
      .from("cookies")
      .select(`
        id, name, description, price, image_urls, image_url, main_image_index, is_visible, ingredients,
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

    // Try to parse style_config from custom_description
    let parsedDescription = featuredRow.custom_description
    let parsedStyleConfig = null

    try {
      if (featuredRow.custom_description && featuredRow.custom_description.startsWith("{")) {
        const parsed = JSON.parse(featuredRow.custom_description)
        if (parsed.text !== undefined) {
          parsedDescription = parsed.text
          parsedStyleConfig = parsed.styleConfig || null
        }
      }
    } catch (e) {
      // It's just regular text
    }

    return NextResponse.json({
      featured_id: featuredRow.id,
      custom_description: parsedDescription,
      style_config: parsedStyleConfig,
      ...cookieData,
      image_urls: imageUrls,
      tags,
      cookie_tags: undefined
    }, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' }
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
    const { cookie_id, custom_description, style_config } = body

    // Check if row exists safely
    const { data: existingRows, error: checkError } = await supabase
      .from("featured_cookie")
      .select("id")
      .limit(1)
      
    if (checkError) {
      console.error("Check Error:", checkError)
    }

    const existingId = existingRows && existingRows.length > 0 ? existingRows[0].id : null

    // Pack the style_config into custom_description since the DB column might not exist
    const packedDescription = style_config 
      ? JSON.stringify({ text: custom_description, styleConfig: style_config })
      : custom_description;

    if (existingId) {
      const { error } = await supabase
        .from("featured_cookie")
        .update({ cookie_id, custom_description: packedDescription, is_active: !!cookie_id })
        .eq("id", existingId)
      if (error) throw error
    } else {
      const { error } = await supabase
        .from("featured_cookie")
        .insert([{ cookie_id, custom_description: packedDescription, is_active: !!cookie_id }])
      if (error) throw error
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error("[featured-cookie PUT]", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
