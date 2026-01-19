import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: tagsData, error } = await supabase
      .from("tags")
      .select("id, name, color_id, colors(hex)")
      .order("name")

    if (error) throw error

    const tags =
      tagsData?.map((t: any) => ({
        id: t.id,
        name: t.name,
        color_hex: t.colors?.hex || "#6b7280",
      })) || []

    return NextResponse.json(tags)
  } catch (error) {
    console.error("Error fetching tags:", error)
    // Return demo data if database not set up
    return NextResponse.json([
      { id: "1", name: "Bestseller", color_hex: "#930021" },
      { id: "2", name: "Nuevo", color_hex: "#924C14" },
      { id: "3", name: "Premium", color_hex: "#4a5568" },
      { id: "4", name: "Vegano", color_hex: "#10b981" },
      { id: "5", name: "Sin Gluten", color_hex: "#f59e0b" },
    ])
  }
}
