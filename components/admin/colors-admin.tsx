"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Plus, Pencil, Trash2, X, Palette } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { ConfirmationModal } from "@/components/confirmation-modal"

type Color = {
  id: string
  name: string
  hex: string
}

export function ColorsAdmin() {
  const [colors, setColors] = useState<Color[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingColor, setEditingColor] = useState<Color | null>(null)
  const [formData, setFormData] = useState({
    hex: "#22C55E",
    name: "",
  })
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean
    title: string
    message: string
    type: "danger" | "warning" | "info"
    onConfirm: () => Promise<void>
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
    onConfirm: async () => {},
  })

  useEffect(() => {
    loadColors()
  }, [])

  const loadColors = async () => {
    const supabase = createClient()
    const { data, error } = await supabase.from("colors").select("*").order("created_at", { ascending: true })

    if (error) {
      console.error("[Message] Error loading colors:", error)
      setLoading(false)
      return
    }

    setColors(data || [])
    setLoading(false)
  }

  const openCreateModal = () => {
    setEditingColor(null)
    setFormData({ hex: "#22C55E", name: "" })
    setShowModal(true)
  }

  const openEditModal = (color: Color) => {
    setEditingColor(color)
    setFormData({ hex: color.hex, name: color.name })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      alert("El nombre es requerido")
      return
    }

    setConfirmModal({
      isOpen: true,
      title: editingColor ? "Guardar cambios" : "Crear color",
      message: editingColor ? `¿Guardar los cambios en "${formData.name}"?` : `¿Crear el color "${formData.name}"?`,
      type: "info",
      onConfirm: async () => {
        const supabase = createClient()

        if (editingColor) {
          const { error } = await supabase
            .from("colors")
            .update({ hex: formData.hex, name: formData.name })
            .eq("id", editingColor.id)

          if (error) throw error
        } else {
          const { error } = await supabase.from("colors").insert([{ hex: formData.hex, name: formData.name }])

          if (error) throw error
        }

        await loadColors()
        setShowModal(false)
      },
    })
  }

  const handleDeleteClick = (color: Color) => {
    setConfirmModal({
      isOpen: true,
      title: "Eliminar color",
      message: `¿Estás seguro de que quieres eliminar "${color.name}"? Esta acción no se puede deshacer.`,
      type: "danger",
      onConfirm: async () => {
        const supabase = createClient()
        const { error } = await supabase.from("colors").delete().eq("id", color.id)

        if (error) throw error

        await loadColors()
      },
    })
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
          <h2 className="text-2xl font-semibold text-gray-900">Colores</h2>
          <p className="text-gray-500 text-sm mt-1">Define colores para las galletas</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#930021] text-white rounded-xl hover:bg-[#7a001b] transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Nuevo color
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {colors.map((color) => (
          <div
            key={color.id}
            className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-gray-200 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex-shrink-0" style={{ backgroundColor: color.hex }} />
                <div>
                  <h3 className="font-medium text-gray-900">{color.name}</h3>
                  <p className="text-sm text-gray-500 font-mono">{color.hex}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEditModal(color)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Editar"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteClick(color)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  aria-label="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {colors.length === 0 && (
          <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-gray-100">
            <Palette className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No hay colores todavía</p>
            <button onClick={openCreateModal} className="mt-4 text-[#930021] font-medium text-sm hover:underline">
              Crear el primer color
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">{editingColor ? "Editar color" : "Nuevo color"}</h3>
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
                  placeholder="ej: Chocolate Negro"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Color</label>
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={formData.hex}
                    onChange={(e) => setFormData({ ...formData, hex: e.target.value })}
                    className="w-14 h-10 rounded-lg cursor-pointer border border-gray-200"
                  />
                  <input
                    type="text"
                    value={formData.hex}
                    onChange={(e) => setFormData({ ...formData, hex: e.target.value })}
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#930021]/20 focus:border-[#930021] text-sm font-mono"
                    placeholder="#000000"
                    pattern="^#[0-9A-Fa-f]{6}$"
                    required
                  />
                </div>
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
                  {editingColor ? "Guardar cambios" : "Crear color"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
      />
    </div>
  )
}
