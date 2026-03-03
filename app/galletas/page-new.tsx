import { createClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { CookiesCatalog } from "@/components/cookies-catalog"

interface CookieItem {
  id: string
  name: string
  description: string
  price: number
  ingredients: string[]
  image_urls: string[]
  main_image_index: number
  is_visible: boolean
  tags: { id: string; name: string; color_hex: string }[]
}

interface Tag {
  id: string
  name: string
  color_hex: string
}

export default async function GalletasPage() {
  const supabase = await createClient()

  const [{ data: tagsData }, { data: cookiesData }] = await Promise.all([
    supabase.from("tags").select("id,name,color_hex"),
    supabase
      .from("cookies")
      .select(`
        id,
        name,
        description,
        price,
        ingredients,
        image_urls,
        main_image_index,
        is_visible,
        cookie_tags ( tags ( id, name, colors ( hex ) ) )
      `)
      .eq("is_visible", true)
      .order("name"),
  ])

  const formattedCookies: CookieItem[] = (cookiesData || []).map((cookie: any) => {
    const tags = (cookie.cookie_tags || [])
      .map((ct: any) => ({
        id: ct.tags?.id,
        name: ct.tags?.name,
        color_hex: ct.tags?.colors?.hex || "#6b7280",
      }))
      .filter((t: any) => t.id)

    return {
      id: cookie.id,
      name: cookie.name,
      description: cookie.description,
      price: cookie.price,
      ingredients: cookie.ingredients,
      image_urls: Array.isArray(cookie.image_urls) ? cookie.image_urls : [],
      main_image_index: cookie.main_image_index || 0,
      is_visible: cookie.is_visible,
      tags,
    }
  })

  const initialCookies = formattedCookies
  const initialTags: Tag[] = (tagsData || [])

  return (
    <div className="min-h-screen bg-[#FEFCF5] flex flex-col">
      <Navbar />
      <CookiesCatalog initialCookies={initialCookies} initialTags={initialTags} />
      <Footer />
    </div>
  )
}
