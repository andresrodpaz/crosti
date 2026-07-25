import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()

    // 1. Get active collection (simple query, no joins)
    const { data: collectionData, error: collectionError } = await supabase
      .from("monthly_collections")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (collectionError) {
      console.error("[Message] Error fetching active collection:", collectionError)
      return NextResponse.json({ error: collectionError.message }, { status: 500 })
    }

    if (!collectionData) {
      return NextResponse.json(null)
    }

    // 2. Get collection items + cookie ids (simple, no join)
    const { data: itemsRaw, error: itemsError } = await supabase
      .from("monthly_collection_items")
      .select("cookie_id, is_hero, custom_tag, display_order")
      .eq("collection_id", collectionData.id)
      .order("display_order", { ascending: true })

    if (itemsError) {
      console.error("[Message] Error fetching collection items:", itemsError)
      return NextResponse.json({ error: itemsError.message }, { status: 500 })
    }

    if (!itemsRaw || itemsRaw.length === 0) {
      return NextResponse.json({ ...collectionData, items: [] })
    }

    // 3. Fetch the actual cookies (simple query using .in())
    const cookieIds = itemsRaw.map((i) => i.cookie_id).filter(Boolean)
    const { data: cookiesData, error: cookiesError } = await supabase
      .from("cookies")
      .select("id, name, description, price, image_urls, ingredients, main_image_index")
      .in("id", cookieIds)

    if (cookiesError) {
      console.error("[Message] Error fetching cookies for collection:", cookiesError)
      return NextResponse.json({ error: cookiesError.message }, { status: 500 })
    }

    // Build lookup map
    const cookieMap: Record<string, any> = {}
    for (const c of cookiesData ?? []) {
      cookieMap[c.id] = c
    }

    // Assemble items
    const items = itemsRaw
      .filter((item) => cookieMap[item.cookie_id])
      .map((item) => {
        const cookie = cookieMap[item.cookie_id]
        const imageUrls = Array.isArray(cookie.image_urls) ? cookie.image_urls : []
        return {
          is_hero: item.is_hero,
          custom_tag: item.custom_tag,
          display_order: item.display_order,
          cookie: {
            id: cookie.id,
            name: cookie.name || "",
            description: cookie.description || "",
            price: cookie.price || 0,
            image_url: imageUrls[cookie.main_image_index ?? 0] || imageUrls[0] || "",
            image_urls: imageUrls,
            ingredients: cookie.ingredients || [],
            main_image_index: cookie.main_image_index || 0,
            tags: [],
          },
        }
      })

    return NextResponse.json(
      {
        id: collectionData.id,
        title: collectionData.title,
        subtitle: collectionData.subtitle,
        description: collectionData.description,
        bg_color: collectionData.bg_color || "#FEFCF5",
        text_color: collectionData.text_color || "#924c14",
        title_color: collectionData.title_color || "#930021",
        items,
      },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    )
  } catch (error) {
    console.error("[Message] Unexpected error in monthly-collection API:", error)
    const message = error instanceof Error ? error.message : "Internal server error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
