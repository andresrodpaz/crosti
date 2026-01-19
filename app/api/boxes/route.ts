import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const includeHidden = searchParams.get("all") === "true"

    let query = supabase
      .from("cookie_boxes")
      .select(`
        *,
        cookies:box_cookies (
          cookie_id,
          quantity,
          cookie:cookies (
            id,
            name,
            image_urls,
            main_image_index
          )
        )
      `)
      .order("display_order", { ascending: true })

    if (!includeHidden) {
      query = query.eq("is_visible", true)
    }

    const { data, error } = await query

    if (error) {
      console.error("[Message] Error fetching boxes:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
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
    const { cookies: boxCookies, ...boxData } = body

    // Create the box
    const { data: box, error: boxError } = await supabase
      .from("cookie_boxes")
      .insert([boxData])
      .select()
      .single()

    if (boxError) {
      console.error("[Message] Error creating box:", boxError)
      return NextResponse.json({ error: boxError.message }, { status: 500 })
    }

    // Add cookies to the box if provided
    if (boxCookies && boxCookies.length > 0) {
      const boxCookieRecords = boxCookies.map((c: { cookie_id: string; quantity: number }) => ({
        box_id: box.id,
        cookie_id: c.cookie_id,
        quantity: c.quantity || 1,
      }))

      const { error: cookiesError } = await supabase.from("box_cookies").insert(boxCookieRecords)

      if (cookiesError) {
        console.error("[Message] Error adding cookies to box:", cookiesError)
      }
    }

    return NextResponse.json(box)
  } catch (error) {
    console.error("[Message] Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
