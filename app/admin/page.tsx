"use client"
import { useState, useEffect } from "react"
import { LogOut, Cookie, Palette, Tag, ChevronRight, LayoutDashboard, ShoppingBag, Sparkles, Package, Calendar, BookOpen } from "lucide-react"
import { CookiesAdmin } from "@/components/admin/cookies-admin"
import { ColorsAdmin } from "@/components/admin/colors-admin"
import { TagsAdmin } from "@/components/admin/tags-admin"
import { OrdersAdmin } from "@/components/admin/orders-admin"
import { BannersAdmin } from "@/components/admin/banners-admin"
import { MonthlyCookiesAdmin } from "@/components/admin/monthly-cookies-admin"
import { BoxesAdmin } from "@/components/admin/boxes-admin"
import { GuidesAdmin } from "@/components/admin/guides-admin"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

type Section = "dashboard" | "cookies" | "monthly" | "colors" | "tags" | "orders" | "banners" | "boxes" | "guides"

export default function AdminPage() {
  const [activeSection, setActiveSection] = useState<Section>("dashboard")
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const [cookiesKey, setCookiesKey] = useState(0)

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (!authUser) {
        router.push("/admin/login")
        return
      }

      setUser(authUser)
      setLoading(false)
    }

    checkAuth()
  }, [router])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/admin/login")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-[#930021] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  const menuItems = [
    { id: "dashboard" as Section, label: "Dashboard", icon: LayoutDashboard },
    { id: "orders" as Section, label: "Pedidos", icon: ShoppingBag },
    { id: "cookies" as Section, label: "Galletas", icon: Cookie },
    { id: "monthly" as Section, label: "Del Mes", icon: Calendar },
    { id: "boxes" as Section, label: "Cajas", icon: Package },
    { id: "banners" as Section, label: "Banners", icon: Sparkles },
    { id: "tags" as Section, label: "Etiquetas", icon: Tag },
    { id: "colors" as Section, label: "Colores", icon: Palette },
    { id: "guides" as Section, label: "Guias", icon: BookOpen },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#930021] rounded-xl flex items-center justify-center">
              <Cookie className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-gray-900 text-base">Crosti</h1>
              <p className="text-xs text-gray-500">Panel Admin</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    activeSection === item.id ? "bg-[#930021] text-white" : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="text-xs text-gray-500 px-4 py-2 mb-2">{user?.email}</div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors text-sm"
          >
            <LogOut className="w-5 h-5" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {activeSection === "dashboard" && <DashboardSection onNavigate={setActiveSection} />}
        {activeSection === "orders" && <OrdersAdmin />}
        {activeSection === "cookies" && (
  <CookiesAdmin
    key={cookiesKey}
    onSaved={() => setCookiesKey((k) => k + 1)}
  />
)}
        {activeSection === "monthly" && <MonthlyCookiesAdmin />}
        {activeSection === "boxes" && <BoxesAdmin />}
        {activeSection === "banners" && <BannersAdmin />}
        {activeSection === "colors" && <ColorsAdmin />}
        {activeSection === "tags" && <TagsAdmin />}
        {activeSection === "guides" && <GuidesAdmin />}
      </main>
    </div>
  )
}

function DashboardSection({ onNavigate }: { onNavigate: (section: Section) => void }) {
  const cards = [
    {
      id: "orders" as Section,
      title: "Pedidos",
      description: "Gestiona y actualiza el estado de los pedidos",
      icon: ShoppingBag,
      color: "bg-orange-500",
    },
    {
      id: "cookies" as Section,
      title: "Galletas",
      description: "Gestiona productos, precios, ingredientes y carrusel",
      icon: Cookie,
      color: "bg-amber-500",
    },
    {
      id: "monthly" as Section,
      title: "Galleta del Mes",
      description: "Destaca colecciones especiales por temporada",
      icon: Calendar,
      color: "bg-red-500",
    },
    {
      id: "boxes" as Section,
      title: "Cajas",
      description: "Gestiona cajas predefinidas con galletas",
      icon: Package,
      color: "bg-rose-500",
    },
    {
      id: "banners" as Section,
      title: "Banners",
      description: "Gestiona banners de novedades y promociones",
      icon: Sparkles,
      color: "bg-pink-500",
    },
    {
      id: "tags" as Section,
      title: "Etiquetas",
      description: "Crea etiquetas como Vegano, Sin Gluten, etc.",
      icon: Tag,
      color: "bg-emerald-500",
    },
    {
      id: "colors" as Section,
      title: "Colores",
      description: "Define colores favoritos para las etiquetas",
      icon: Palette,
      color: "bg-violet-500",
    },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Bienvenido al panel de administración de Crosti</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => onNavigate(card.id)}
            className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all text-left group"
          >
            <div className="flex items-start justify-between">
              <div className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center mb-4`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-400 transition-colors" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">{card.title}</h3>
            <p className="text-sm text-gray-500">{card.description}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
