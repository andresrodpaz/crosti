"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Plus, Pencil, Trash2, X, Tag } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

type TagType = {
  id: string
  name: string
  color_id: string | null
}

type Color = {
  id: string
  name: string
  hex: string
}

export function TagsAdmin() {
  const [tags, setTags] = useState<TagType[]>([])
  const [colors, setColors] = useState<Color[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingTag, setEditingTag] = useState<TagType | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    colorId: "",
  })

  useEffect(() => {
    loadTags()
    loadColors()
  }, [])

  const loadTags = async () => {
    const supabase = createClient()
    const { data, error } = await supabase.from("tags").select("*").order("created_at", { ascending: true })

    if (error) {
      console.error("[Message] Error loading tags:", error)
      setLoading(false)
      return
    }

    setTags(data || [])
    setLoading(false)
  }

  const loadColors = async () => {
    const supabase = createClient()
    const { data, error } = await supabase.from("colors").select("*").order("created_at", { ascending: true })

    if (error) {
      console.error("[Message] Error loading colors:", error)
      return
    }

    setColors(data || [])
  }

  const getTagColor = (colorId: string | null) => {
    if (!colorId) return "#6B7280"
    return colors.find((c) => c.id === colorId)?.hex || "#6B7280"
  }

  const openCreateModal = () => {
    setEditingTag(null)
    setFormData({ name: "", colorId: colors[0]?.id || "" })
    setShowModal(true)
  }

  const openEditModal = (tag: TagType) => {
    setEditingTag(tag)
    setFormData({ name: tag.name, colorId: tag.color_id || "" })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      alert("El nombre es requerido")
      return
    }

    try {
      const supabase = createClient()

      if (editingTag) {
        const { error } = await supabase
          .from("tags")
          .update({ name: formData.name, color_id: formData.colorId || null })
          .eq("id", editingTag.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from("tags")
          .insert([{ name: formData.name, color_id: formData.colorId || null }])

        if (error) throw error
      }

      await loadTags()
      setShowModal(false)
    } catch (error) {
      console.error("[Message] Error saving tag:", error)
      alert("Error al guardar la etiqueta: " + (error as any).message)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta etiqueta?")) return

    try {
      const supabase = createClient()
      const { error } = await supabase.from("tags").delete().eq("id", id)

      if (error) throw error

      await loadTags()
    } catch (error) {
      console.error("[Message] Error deleting tag:", error)
      alert("Error al eliminar la etiqueta: " + (error as any).message)
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[200px]">
        <div className="w-8 h-8 border-2 border-[#930021] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Etiquetas</h2>
          <p className="text-gray-500 text-sm mt-1">Crea etiquetas para clasificar las galletas</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#930021] text-white rounded-xl hover:bg-[#7a001b] transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Nueva etiqueta
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tags.map((tag) => (
          <div
            key={tag.id}
            className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-gray-200 transition-colors"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span
                  className="px-3 py-1.5 rounded-full text-sm font-medium text-white"
                  style={{ backgroundColor: getTagColor(tag.color_id) }}
                >
                  {tag.name}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEditModal(tag)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Editar"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(tag.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  aria-label="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {tags.length === 0 && (
          <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-gray-100">
            <Tag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No hay etiquetas todavía</p>
            <button onClick={openCreateModal} className="mt-4 text-[#930021] font-medium text-sm hover:underline">
              Crear la primera etiqueta
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">{editingTag ? "Editar etiqueta" : "Nueva etiqueta"}</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#930021]/20 focus:border-[#930021] text-sm"
                  placeholder="ej: Vegano, Sin Gluten..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color (opcional)</label>
                {colors.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {colors.map((color) => (
                      <button
                        key={color.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, colorId: color.id })}
                        className={`p-3 rounded-xl border-2 transition-colors ${
                          formData.colorId === color.id ? "border-gray-900" : "border-transparent hover:border-gray-200"
                        }`}
                      >
                        <div className="w-full h-6 rounded-lg mb-1" style={{ backgroundColor: color.hex }} />
                        <p className="text-xs text-gray-600 truncate">{color.name}</p>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">Primero crea colores en la sección Colores.</p>
                )}
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-[#930021] text-white rounded-xl hover:bg-[#7a001b] transition-colors text-sm font-medium"
                >
                  {editingTag ? "Guardar cambios" : "Crear etiqueta"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
