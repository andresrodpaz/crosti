import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const carouselOnly = searchParams.get("carousel") === "true"
  const visibleOnly = searchParams.get("visible") === "true"

  try {
    const supabase = await createClient()

    // Optimize query to include tags in a single request
    let query = supabase.from("cookies").select(`
      *,
      cookie_tags (
        tags (
          id,
          name,
          color_id,
          colors (
            hex
          )
        )
      )
    `)

    const includeAll = searchParams.get("all") === "true"

    if (carouselOnly) {
      query = query.eq("in_carousel", true).order("carousel_order", { ascending: true }).limit(8)
    } else if (visibleOnly || !includeAll) {
      query = query.eq("is_visible", true).order("name")
    } else {
      query = query.order("name")
    }

    const { data: cookiesData, error } = await query

    if (error) {
      console.error("[Message] Database error fetching cookies:", error)

      // timeout fallback: return mock data instead de 500
      if (error.code === "57014") {
        const { getCookies } = await import("@/lib/cookies-store")
        const mockCookies = getCookies().map((c) => ({
          ...c,
          image_urls: c.imageUrl ? [c.imageUrl] : [],
          tags: [],
          is_visible: true,
          main_image_index: 0,
        }))
        return NextResponse.json(mockCookies)
      }

      return NextResponse.json({ error: error.message, cookies: [] }, { status: 500 })
    }

    if (cookiesData && cookiesData.length > 0) {
      const formattedCookies = cookiesData.map((cookie) => {
        // Flatten the nested structure from the join
        const tags = cookie.cookie_tags?.map((ct: any) => ({
             id: ct.tags?.id,
             name: ct.tags?.name,
             color_hex: ct.tags?.colors?.hex || "#6b7280"
        })).filter((t: any) => t.id) || []

        let imageUrls: string[] = []
        if (cookie.image_urls) {
          imageUrls = Array.isArray(cookie.image_urls) ? cookie.image_urls : []
        }

        return {
          ...cookie,
          image_urls: imageUrls,
          main_image_index: cookie.main_image_index || 0,
          tags,
          // remove raw relation data
          cookie_tags: undefined
        }
      })
      
      return NextResponse.json(formattedCookies, {
        headers: {
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
        }
      })
    }

    return NextResponse.json([])
  } catch (error) {
    console.error("[Message] Unexpected error in cookies API:", error)
    
    // FALLBACK: Use mock data if DB fails (e.g. timeout)
    console.log("[Message] ⚠️ Using fallback mock data due to DB error")
    const { getCookies } = await import("@/lib/cookies-store")
    const mockCookies = getCookies().map(c => ({
      ...c,
      image_urls: c.imageUrl ? [c.imageUrl] : [],
      tags: [],
      is_visible: true,
      main_image_index: 0
    }))
    
    return NextResponse.json(mockCookies)
  }
}
