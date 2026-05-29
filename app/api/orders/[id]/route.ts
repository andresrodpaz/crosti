import { createServerClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createServerClient()
    const { status } = await request.json()
    const { id } = await params

    console.log("[Message] Updating order:", id, "to status:", status)

    const { data, error } = await supabase
      .from("orders")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()

    if (error) {
      console.error("[Message] Order update error:", error)
      throw error
    }

    console.log("[Message] Order updated successfully:", data)
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("[Message] Failed to update order:", error)
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
  }
}
