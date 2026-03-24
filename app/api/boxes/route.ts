import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const includeHidden = searchParams.get("all") === "true"
    const visibleOnly = searchParams.get("visible") === "true"
    const limit = Math.min(Number(searchParams.get("limit") || 100), 200)

    // Step 1: Fetch boxes list only
    let boxesQuery = supabase
      .from("cookie_boxes")
      .select("id, name, description, price, quantity, image_url, is_visible, display_order")
      .order("display_order", { ascending: true })
      .limit(limit)

    if (visibleOnly || !includeHidden) {
      boxesQuery = boxesQuery.eq("is_visible", true)
    }

    const { data: boxesData, error: boxesError } = await boxesQuery

    if (boxesError) {
      console.error("[Message] Error fetching boxes:", boxesError)
      if (boxesError.code === "57014") {
        return NextResponse.json([], { status: 200 })
      }
      return NextResponse.json({ error: boxesError.message }, { status: 500 })
    }

    if (!boxesData || boxesData.length === 0) {
      return NextResponse.json([])
    }

    const boxIds = boxesData.map((box: any) => box.id)

    // Step 2: fetch box-cookies relationships (lightweight)
    const { data: boxCookiesData, error: boxCookiesError } = await supabase
      .from("box_cookies")
      .select("box_id, cookie_id, quantity")
      .in("box_id", boxIds)

    if (boxCookiesError) {
      console.error("[Message] Error fetching box cookies:", boxCookiesError)
      if (boxCookiesError.code === "57014") {
        return NextResponse.json(boxesData.map((b: any) => ({ ...b, cookies: [] })))
      }
      return NextResponse.json({ error: boxCookiesError.message }, { status: 500 })
    }

    const cookieIds = [...new Set((boxCookiesData || []).map((bc: any) => bc.cookie_id))]

    // Step 3: fetch referenced cookies
    const { data: cookiesData, error: cookiesError } = await supabase
      .from("cookies")
      .select("id, name, image_urls, main_image_index")
      .in("id", cookieIds)

    if (cookiesError) {
      console.error("[Message] Error fetching cookie data in boxes path:", cookiesError)
      if (cookiesError.code === "57014") {
        return NextResponse.json(boxesData.map((b: any) => ({ ...b, cookies: [] })))
      }
      return NextResponse.json({ error: cookiesError.message }, { status: 500 })
    }

    const cookiesById = new Map((cookiesData || []).map((cookie: any) => [cookie.id, cookie]))

    const boxCookiesByBoxId = (boxCookiesData || []).reduce((acc: any, bc: any) => {
      if (!acc[bc.box_id]) acc[bc.box_id] = []
      acc[bc.box_id].push({ ...bc, cookie: cookiesById.get(bc.cookie_id) || null })
      return acc
    }, {})

    const result = boxesData.map((box: any) => ({
      ...box,
      cookies: boxCookiesByBoxId[box.id] || [],
    }))

    return NextResponse.json(result)
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
