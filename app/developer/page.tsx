"use client"

import { useState, useEffect } from "react"
import { LogOut, LayoutDashboard, ChevronRight, Settings, BookOpen, HelpCircle, CheckCircle2 } from "lucide-react"
import { useRouter } from "next/navigation"
import LandingAdmin from "@/components/admin/landing-admin"
import DocsSection from "@/components/admin/docs-section"
import FAQSection from "@/components/admin/faq-section"

type Section = "dashboard" | "landing" | "docs" | "faq"

export default function DeveloperPage() {
  const [activeSection, setActiveSection] = useState<Section>("dashboard")
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/verify")
        const data = await response.json()

        if (!data.authenticated || !["developer", "admin"].includes(data.user?.role)) {
          router.push("/developer/login")
          return
        }

        setUser(data.user)
        setLoading(false)
      } catch (error) {
        console.error("[Message] Auth check error:", error)
        router.push("/developer/login")
      }
    }

    checkAuth()
  }, [router])

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/developer/login")
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
    { id: "landing" as Section, label: "Landing Config", icon: Settings },
    { id: "docs" as Section, label: "Documentación", icon: BookOpen },
    { id: "faq" as Section, label: "FAQ", icon: HelpCircle },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-slide-down">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#930021] rounded-xl flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-gray-900">Crosti</h1>
              <p className="text-xs text-gray-500">Panel Developer</p>
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

      <main className="flex-1 overflow-auto">
        {activeSection === "dashboard" && <DashboardSection onNavigate={setActiveSection} />}
        {activeSection === "landing" && <LandingAdmin onSuccess={setSuccessMessage} />}
        {activeSection === "docs" && <DocsSection />}
        {activeSection === "faq" && <FAQSection />}
      </main>
    </div>
  )
}

function DashboardSection({ onNavigate }: { onNavigate: (section: Section) => void }) {
  const cards = [
    {
      id: "landing" as Section,
      title: "Landing Config",
      description: "Gestiona el contenido del landing page",
      icon: Settings,
      color: "bg-orange-500",
    },
    {
      id: "docs" as Section,
      title: "Documentación",
      description: "Accede a la documentación de Crosti",
      icon: BookOpen,
      color: "bg-blue-500",
    },
    {
      id: "faq" as Section,
      title: "FAQ",
      description: "Encuentra respuestas a preguntas frecuentes",
      icon: HelpCircle,
      color: "bg-green-500",
    },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Bienvenido al panel de desarrollador de Crosti</p>
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
