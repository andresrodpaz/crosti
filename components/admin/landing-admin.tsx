"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { AlertCircle, Save, Plus, Trash2, Upload, Type, Palette } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  defaultSocialSettings,
  getSocialSettingsFromSections,
  upsertSocialSettingsInSections,
} from "@/lib/social-settings"

interface LandingConfig {
  id: string
  hero_title: string
  hero_subtitle: string
  hero_image_url?: string
  hero_images?: string[]
  feature_1_title: string
  feature_1_desc: string
  feature_2_title: string
  feature_2_desc: string
  feature_3_title: string
  feature_3_desc: string
  sections?: Array<{
    id: string
    title: string
    description: string
    type: "campaign" | "promo" | "feature"
  }>
  typography?: {
    fontFamily?: string
    headingSize?: string
    bodySize?: string
    headingColor?: string
    bodyColor?: string
    backgroundColor?: string
    primaryColor?: string
    secondaryColor?: string
  }
}

interface LandingAdminProps {
  onSuccess?: (message: string) => void
}

const FONT_OPTIONS = [
  "Inter",
  "Roboto",
  "Poppins",
  "Montserrat",
  "Open Sans",
  "Lato",
  "Raleway",
  "Nunito",
  "Playfair Display",
  "Merriweather",
]

const SIZE_OPTIONS = {
  heading: ["text-2xl", "text-3xl", "text-4xl", "text-5xl", "text-6xl"],
  body: ["text-sm", "text-base", "text-lg", "text-xl"],
}

export default function LandingAdmin({ onSuccess }: LandingAdminProps) {
  const [config, setConfig] = useState<LandingConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [activeTab, setActiveTab] = useState<"content" | "style">("content")
  const supabase = createClient()

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      const { data, error } = await supabase.from("landing_config").select("*").single()

      if (error) throw error
      setConfig({
        ...data,
        typography: data.typography || {
          fontFamily: "Inter",
          headingSize: "text-4xl",
          bodySize: "text-base",
          headingColor: "#1F2937",
          bodyColor: "#6B7280",
          backgroundColor: "#FFFFFF",
          primaryColor: "#930021",
          secondaryColor: "#F9E7AE",
        },
      })
    } catch (error) {
      console.error("Error fetching config:", error)
      setMessage({ type: "error", text: "Error al cargar la configuración" })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!config) return

    setSaving(true)
    try {
      const { error } = await supabase.from("landing_config").update(config).eq("id", config.id)

      if (error) throw error

      if (onSuccess) {
        onSuccess("Configuración guardada correctamente")
      } else {
        setMessage({ type: "success", text: "Configuración guardada correctamente" })
      }

      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      console.error("Error saving config:", error)
      setMessage({ type: "error", text: "Error al guardar la configuración" })
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "hero_image_url" | "hero_images") => {
    const files = e.target.files
    if (!files || !config) return

    const file = files[0]
    const reader = new FileReader()

    reader.onload = (event) => {
      const base64 = event.target?.result as string
      if (field === "hero_image_url") {
        setConfig({ ...config, hero_image_url: base64 })
      } else {
        const images = config.hero_images || []
        setConfig({ ...config, hero_images: [...images, base64] })
      }
    }

    reader.readAsDataURL(file)
  }

  const removeImage = (index: number) => {
    if (!config) return
    const images = (config.hero_images || []).filter((_, i) => i !== index)
    setConfig({ ...config, hero_images: images })
  }

  const addSection = () => {
    if (!config) return
    const sections = config.sections || []
    sections.push({
      id: Date.now().toString(),
      title: "Nueva Sección",
      description: "Descripción de la sección",
      type: "campaign",
    })
    setConfig({ ...config, sections })
  }

  const removeSection = (id: string) => {
    if (!config) return
    setConfig({ ...config, sections: (config.sections || []).filter((s) => s.id !== id) })
  }

  const updateSection = (id: string, field: string, value: string) => {
    if (!config) return
    const sections = (config.sections || []).map((s) => (s.id === id ? { ...s, [field]: value } : s))
    setConfig({ ...config, sections })
  }

  const updateTypography = (field: string, value: string) => {
    if (!config) return
    setConfig({
      ...config,
      typography: {
        ...config.typography,
        [field]: value,
      },
    })
  }

  const updateSocialSettings = (field: keyof typeof defaultSocialSettings, value: string) => {
    if (!config) return
    const current = getSocialSettingsFromSections(config.sections)
    const updated = { ...current, [field]: value }
    setConfig({
      ...config,
      sections: upsertSocialSettingsInSections(config.sections, updated),
    })
  }

  if (loading) {
    return <div className="p-8 text-center">Cargando...</div>
  }

  if (!config) {
    return <div className="p-8 text-center text-red-600">Error al cargar la configuración</div>
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Configuración del Landing</h1>
        <Button onClick={handleSave} disabled={saving} className="bg-[#930021] hover:bg-[#930021]/90">
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </div>

      {message && (
        <Alert className={message.type === "success" ? "border-green-300 bg-green-50" : "border-red-300 bg-red-50"}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className={message.type === "success" ? "text-green-800" : "text-red-800"}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      <div className="border-b border-gray-200">
        <nav className="flex gap-4">
          <button
            onClick={() => setActiveTab("content")}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === "content"
                ? "border-[#930021] text-[#930021]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Contenido
          </button>
          <button
            onClick={() => setActiveTab("style")}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === "style"
                ? "border-[#930021] text-[#930021]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Estilos y Tipografía
          </button>
        </nav>
      </div>

      {/* Content Tab */}
      {activeTab === "content" && (
        <div className="space-y-6">
          {/* Hero Section */}
          <Card className="p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Sección Hero</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
              <Input
                value={config.hero_title}
                onChange={(e) => setConfig({ ...config, hero_title: e.target.value })}
                placeholder="Título del hero"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subtítulo</label>
              <Textarea
                value={config.hero_subtitle}
                onChange={(e) => setConfig({ ...config, hero_subtitle: e.target.value })}
                placeholder="Subtítulo del hero"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Imagen Principal</label>
              <div className="flex gap-2">
                <label className="flex-1">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-gray-400">
                    <Upload className="w-5 h-5 mx-auto mb-1 text-gray-400" />
                    <p className="text-sm text-gray-600">Arrastra o haz clic</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "hero_image_url")}
                    className="hidden"
                  />
                </label>
              </div>
              {config.hero_image_url && (
                <div className="mt-2">
                  <img
                    src={config.hero_image_url || "/placeholder.svg"}
                    alt="Hero"
                    className="w-32 h-24 object-cover rounded"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Imágenes Adicionales</label>
              <label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-gray-400">
                  <Upload className="w-5 h-5 mx-auto mb-1 text-gray-400" />
                  <p className="text-sm text-gray-600">Arrastra o haz clic</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, "hero_images")}
                  className="hidden"
                  multiple
                />
              </label>
              <div className="flex flex-wrap gap-2 mt-2">
                {(config.hero_images || []).map((img, idx) => (
                  <div key={idx} className="relative">
                    <img
                      src={img || "/placeholder.svg"}
                      alt={`Hero ${idx}`}
                      className="w-24 h-24 object-cover rounded"
                    />
                    <button
                      onClick={() => removeImage(idx)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Features Section */}
          <Card className="p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Características</h2>

            {[1, 2, 3].map((num) => (
              <div key={num} className="space-y-2 p-4 bg-gray-50 rounded-lg">
                <Input
                  value={config[`feature_${num}_title` as keyof LandingConfig] as string}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      [`feature_${num}_title`]: e.target.value,
                    } as any)
                  }
                  placeholder={`Característica ${num} - Título`}
                />
                <Input
                  value={config[`feature_${num}_desc` as keyof LandingConfig] as string}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      [`feature_${num}_desc`]: e.target.value,
                    } as any)
                  }
                  placeholder={`Característica ${num} - Descripción`}
                />
              </div>
            ))}
          </Card>

          {/* Campaigns/Sections */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Campañas y Secciones</h2>
              <Button onClick={addSection} size="sm" className="bg-[#930021] hover:bg-[#930021]/90">
                <Plus className="w-4 h-4 mr-1" />
                Añadir Sección
              </Button>
            </div>

            <div className="space-y-3">
              {(config.sections || []).map((section) => (
                <div key={section.id} className="p-4 bg-gray-50 rounded-lg space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-gray-900">Sección</h3>
                    <button onClick={() => removeSection(section.id)} className="text-red-600 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <Input
                    value={section.title}
                    onChange={(e) => updateSection(section.id, "title", e.target.value)}
                    placeholder="Título de la sección"
                  />
                  <Textarea
                    value={section.description}
                    onChange={(e) => updateSection(section.id, "description", e.target.value)}
                    placeholder="Descripción de la sección"
                    rows={2}
                  />
                  <select
                    value={section.type}
                    onChange={(e) => updateSection(section.id, "type", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="campaign">Campaña</option>
                    <option value="promo">Promoción</option>
                    <option value="feature">Característica</option>
                  </select>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Redes sociales</h2>
            <div className="space-y-3">
              <Input
                value={getSocialSettingsFromSections(config.sections).instagram_url}
                onChange={(e) => updateSocialSettings("instagram_url", e.target.value)}
                placeholder="URL de Instagram"
              />
              <Input
                value={getSocialSettingsFromSections(config.sections).pinterest_url}
                onChange={(e) => updateSocialSettings("pinterest_url", e.target.value)}
                placeholder="URL de Pinterest"
              />
              <Input
                value={getSocialSettingsFromSections(config.sections).reels_title}
                onChange={(e) => updateSocialSettings("reels_title", e.target.value)}
                placeholder="Titulo seccion reels"
              />
              <Input
                value={getSocialSettingsFromSections(config.sections).instagram_cta_text}
                onChange={(e) => updateSocialSettings("instagram_cta_text", e.target.value)}
                placeholder="Texto boton Instagram"
              />
            </div>
          </Card>
        </div>
      )}

      {activeTab === "style" && (
        <div className="space-y-6">
          <Card className="p-6 space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Type className="w-5 h-5 text-gray-700" />
              <h2 className="text-lg font-semibold text-gray-900">Tipografía</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Familia de fuente</label>
                <select
                  value={config.typography?.fontFamily || "Inter"}
                  onChange={(e) => updateTypography("fontFamily", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#930021]/20 focus:border-[#930021]"
                >
                  {FONT_OPTIONS.map((font) => (
                    <option key={font} value={font} style={{ fontFamily: font }}>
                      {font}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tamaño de encabezados</label>
                <select
                  value={config.typography?.headingSize || "text-4xl"}
                  onChange={(e) => updateTypography("headingSize", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#930021]/20 focus:border-[#930021]"
                >
                  {SIZE_OPTIONS.heading.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tamaño de texto</label>
                <select
                  value={config.typography?.bodySize || "text-base"}
                  onChange={(e) => updateTypography("bodySize", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#930021]/20 focus:border-[#930021]"
                >
                  {SIZE_OPTIONS.body.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Palette className="w-5 h-5 text-gray-700" />
              <h2 className="text-lg font-semibold text-gray-900">Colores</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color de encabezados</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={config.typography?.headingColor || "#1F2937"}
                    onChange={(e) => updateTypography("headingColor", e.target.value)}
                    className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={config.typography?.headingColor || "#1F2937"}
                    onChange={(e) => updateTypography("headingColor", e.target.value)}
                    placeholder="#1F2937"
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color de texto</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={config.typography?.bodyColor || "#6B7280"}
                    onChange={(e) => updateTypography("bodyColor", e.target.value)}
                    className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={config.typography?.bodyColor || "#6B7280"}
                    onChange={(e) => updateTypography("bodyColor", e.target.value)}
                    placeholder="#6B7280"
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color de fondo</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={config.typography?.backgroundColor || "#FFFFFF"}
                    onChange={(e) => updateTypography("backgroundColor", e.target.value)}
                    className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={config.typography?.backgroundColor || "#FFFFFF"}
                    onChange={(e) => updateTypography("backgroundColor", e.target.value)}
                    placeholder="#FFFFFF"
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color primario</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={config.typography?.primaryColor || "#930021"}
                    onChange={(e) => updateTypography("primaryColor", e.target.value)}
                    className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={config.typography?.primaryColor || "#930021"}
                    onChange={(e) => updateTypography("primaryColor", e.target.value)}
                    placeholder="#930021"
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color secundario</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={config.typography?.secondaryColor || "#F9E7AE"}
                    onChange={(e) => updateTypography("secondaryColor", e.target.value)}
                    className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={config.typography?.secondaryColor || "#F9E7AE"}
                    onChange={(e) => updateTypography("secondaryColor", e.target.value)}
                    placeholder="#F9E7AE"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Preview Section */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Vista Previa</h2>
            <div
              className="p-6 rounded-lg border border-gray-200"
              style={{
                backgroundColor: config.typography?.backgroundColor || "#FFFFFF",
                fontFamily: config.typography?.fontFamily || "Inter",
              }}
            >
              <h1
                className={`${config.typography?.headingSize || "text-4xl"} font-bold mb-4`}
                style={{ color: config.typography?.headingColor || "#1F2937" }}
              >
                Ejemplo de Encabezado
              </h1>
              <p
                className={`${config.typography?.bodySize || "text-base"} mb-4`}
                style={{ color: config.typography?.bodyColor || "#6B7280" }}
              >
                Este es un ejemplo de cómo se verá el texto en tu landing page con los estilos seleccionados. Puedes
                ajustar la tipografía, tamaños y colores para que coincidan con tu marca.
              </p>
              <button
                className="px-6 py-2 rounded-lg text-white font-medium"
                style={{ backgroundColor: config.typography?.primaryColor || "#930021" }}
              >
                Botón de Ejemplo
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

export { LandingAdmin }
