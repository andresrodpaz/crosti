import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const carouselOnly = searchParams.get("carousel") === "true"
  const visibleOnly = searchParams.get("visible") === "true"

  try {
    const supabase = await createClient()

    let query = supabase.from("cookies").select("*")

    if (carouselOnly) {
      query = query.eq("in_carousel", true).order("carousel_order", { ascending: true }).limit(8)
    } else if (visibleOnly) {
      query = query.eq("is_visible", true).order("name")
    } else {
      query = query.order("name")
    }

    const { data: cookiesData, error } = await query

    if (error) {
      console.error("[Message] Database error fetching cookies:", error)

      const errorMessage = error.message || String(error)

      if (
        error.code === "PGRST116" ||
        error.code === "PGRST204" ||
        error.code === "PGRST205" ||
        errorMessage.includes("does not exist") ||
        errorMessage.includes("Could not find")
      ) {
        console.error("[Message] ❌ DATABASE NOT INITIALIZED")
        console.error("[Message] 📝 Please run the SQL scripts in the scripts/ folder:")
        console.error("[Message]    1. scripts/001_create_tables.sql")
        console.error("[Message]    2. scripts/002_seed_initial_data.sql")
        console.error("[Message]    3. scripts/003_enable_rls.sql")

        return NextResponse.json(
          {
            error:
              "Database not initialized. Please run the SQL scripts in order: 001_create_tables.sql, 002_seed_initial_data.sql, 003_enable_rls.sql",
            hint: "Run scripts from the scripts/ folder",
            cookies: [],
          },
          { status: 503 },
        )
      }

      return NextResponse.json({ error: errorMessage, cookies: [] }, { status: 500 })
    }

    if (cookiesData && cookiesData.length > 0) {
      const cookiesWithTags = await Promise.all(
        cookiesData.map(async (cookie) => {
          const { data: tagData } = await supabase
            .from("cookie_tags")
            .select("tag_id, tags(id, name, color_id, colors(hex))")
            .eq("cookie_id", cookie.id)

          const tags =
            tagData
              ?.map((t: any) => ({
                id: t.tags?.id,
                name: t.tags?.name,
                color_hex: t.tags?.colors?.hex || "#6b7280",
              }))
              .filter((t) => t.id) || []

          let imageUrls: string[] = []
          if (cookie.image_urls) {
            imageUrls = Array.isArray(cookie.image_urls) ? cookie.image_urls : []
          }

          return {
            ...cookie,
            image_urls: imageUrls,
            main_image_index: cookie.main_image_index || 0,
            tags,
          }
        }),
      )
      return NextResponse.json(cookiesWithTags)
    }

    return NextResponse.json([])
  } catch (error) {
    console.error("[Message] Unexpected error in cookies API:", error)
    const errorMessage = error instanceof Error ? error.message : String(error)

    if (errorMessage.includes("JSON") || errorMessage.includes("Unexpected token")) {
      console.error("[Message] ❌ SUPABASE RESPONSE ERROR - Database likely not initialized")
      return NextResponse.json(
        {
          error: "Database connection error. Please ensure SQL scripts have been executed.",
          hint: "Run all scripts from the scripts/ folder in order",
          cookies: [],
        },
        { status: 503 },
      )
    }

    return NextResponse.json({ error: errorMessage, cookies: [] }, { status: 500 })
  }
}
