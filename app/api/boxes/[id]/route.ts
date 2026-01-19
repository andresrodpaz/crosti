import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("cookie_boxes")
      .select(`
        *,
        box_cookies (
          id,
          quantity,
          cookie:cookies (
            id,
            name,
            image_url,
            price
          )
        )
      `)
      .eq("id", id)
      .single()

    if (error) {
      console.error("[Message] Error fetching box:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("[Message] Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const body = await request.json()
    const { cookies: boxCookies, ...boxData } = body

    // Update the box
    const { data, error } = await supabase
      .from("cookie_boxes")
      .update({ ...boxData, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("[Message] Error updating box:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Update cookies if provided
    if (boxCookies !== undefined) {
      // Delete existing cookies
      await supabase.from("box_cookies").delete().eq("box_id", id)

      // Add new cookies
      if (boxCookies && boxCookies.length > 0) {
        const boxCookieRecords = boxCookies.map((c: { cookie_id: string; quantity: number }) => ({
          box_id: id,
          cookie_id: c.cookie_id,
          quantity: c.quantity || 1,
        }))

        await supabase.from("box_cookies").insert(boxCookieRecords)
      }
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("[Message] Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { error } = await supabase.from("cookie_boxes").delete().eq("id", id)

    if (error) {
      console.error("[Message] Error deleting box:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[Message] Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
