"use client"

import { useState, useEffect } from "react"
import { Plus, Edit2, Trash2, Eye, EyeOff, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

interface Banner {
  id: string
  title: string
  subtitle: string | null
  link_url: string | null
  link_text: string | null
  background_color: string
  text_color: string
  is_active: boolean
  display_order: number
}

export function BannersAdmin() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    link_url: "",
    link_text: "",
    background_color: "#930021",
    text_color: "#F8E19A",
    is_active: true,
  })

  useEffect(() => {
    loadBanners()
  }, [])

  async function loadBanners() {
    try {
      const res = await fetch("/api/banners")
      if (res.ok) {
        const data = await res.json()
        setBanners(data)
      }
    } catch (error) {
      console.error("Error loading banners:", error)
    }
    setIsLoading(false)
  }

  const openNewBanner = () => {
    setEditingBanner(null)
    setFormData({
      title: "",
      subtitle: "",
      link_url: "",
      link_text: "",
      background_color: "#930021",
      text_color: "#F8E19A",
      is_active: true,
    })
    setIsDialogOpen(true)
  }

  const openEditBanner = (banner: Banner) => {
    setEditingBanner(banner)
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle || "",
      link_url: banner.link_url || "",
      link_text: banner.link_text || "",
      background_color: banner.background_color,
      text_color: banner.text_color,
      is_active: banner.is_active,
    })
    setIsDialogOpen(true)
  }

  const handleSubmit = async () => {
    try {
      if (editingBanner) {
        const res = await fetch(`/api/banners/${editingBanner.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })
        if (res.ok) {
          loadBanners()
        }
      } else {
        const res = await fetch("/api/banners", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })
        if (res.ok) {
          loadBanners()
        }
      }
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error saving banner:", error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este banner?")) return

    try {
      const res = await fetch(`/api/banners/${id}`, { method: "DELETE" })
      if (res.ok) {
        loadBanners()
      }
    } catch (error) {
      console.error("Error deleting banner:", error)
    }
  }

  const toggleActive = async (banner: Banner) => {
    try {
      const res = await fetch(`/api/banners/${banner.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !banner.is_active }),
      })
      if (res.ok) {
        loadBanners()
      }
    } catch (error) {
      console.error("Error toggling banner:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#930021]/20 border-t-[#930021] rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Banners de Novedades</h1>
          <p className="text-gray-500 mt-1">Gestiona los anuncios que aparecen en la parte superior del sitio</p>
        </div>
        <Button onClick={openNewBanner} className="bg-[#930021] hover:bg-[#930021]/90">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Banner
        </Button>
      </div>

      <div className="space-y-4">
        {banners.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-gray-600 font-medium mb-2">No hay banners</h3>
            <p className="text-gray-400 text-sm mb-4">Crea tu primer banner para anunciar novedades</p>
            <Button onClick={openNewBanner} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Crear Banner
            </Button>
          </div>
        ) : (
          banners.map((banner) => (
            <div
              key={banner.id}
              className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4"
            >
              <div
                className="w-16 h-10 rounded-lg flex items-center justify-center text-xs font-medium"
                style={{
                  backgroundColor: banner.background_color,
                  color: banner.text_color,
                }}
              >
                Preview
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 truncate">{banner.title}</h3>
                {banner.subtitle && (
                  <p className="text-sm text-gray-500 truncate">{banner.subtitle}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleActive(banner)}
                  className={`p-2 rounded-lg transition-colors ${
                    banner.is_active
                      ? "text-green-600 bg-green-50 hover:bg-green-100"
                      : "text-gray-400 bg-gray-50 hover:bg-gray-100"
                  }`}
                  title={banner.is_active ? "Activo" : "Inactivo"}
                >
                  {banner.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => openEditBanner(banner)}
                  className="p-2 rounded-lg text-blue-600 bg-blue-50 hover:bg-blue-100"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(banner.id)}
                  className="p-2 rounded-lg text-red-600 bg-red-50 hover:bg-red-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingBanner ? "Editar Banner" : "Nuevo Banner"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Nuevas galletas de temporada"
              />
            </div>

            <div>
              <Label htmlFor="subtitle">Subtítulo</Label>
              <Textarea
                id="subtitle"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                placeholder="Descripción corta del anuncio"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="link_url">URL del enlace</Label>
                <Input
                  id="link_url"
                  value={formData.link_url}
                  onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                  placeholder="/tienda"
                />
              </div>
              <div>
                <Label htmlFor="link_text">Texto del enlace</Label>
                <Input
                  id="link_text"
                  value={formData.link_text}
                  onChange={(e) => setFormData({ ...formData, link_text: e.target.value })}
                  placeholder="Ver más"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bg_color">Color de fondo</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={formData.background_color}
                    onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                    className="w-10 h-10 rounded cursor-pointer"
                  />
                  <Input
                    id="bg_color"
                    value={formData.background_color}
                    onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="text_color">Color de texto</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={formData.text_color}
                    onChange={(e) => setFormData({ ...formData, text_color: e.target.value })}
                    className="w-10 h-10 rounded cursor-pointer"
                  />
                  <Input
                    id="text_color"
                    value={formData.text_color}
                    onChange={(e) => setFormData({ ...formData, text_color: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active">Activo</Label>
            </div>

            {/* Preview */}
            <div className="mt-4">
              <Label>Vista previa</Label>
              <div
                className="mt-2 rounded-lg p-3 text-center text-sm"
                style={{
                  backgroundColor: formData.background_color,
                  color: formData.text_color,
                }}
              >
                <span className="font-semibold">{formData.title || "Título del banner"}</span>
                {formData.subtitle && <span className="ml-2 opacity-90">- {formData.subtitle}</span>}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="bg-transparent">
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={!formData.title} className="bg-[#930021] hover:bg-[#930021]/90">
              {editingBanner ? "Guardar" : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
