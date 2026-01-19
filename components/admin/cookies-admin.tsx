"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Plus, Pencil, Trash2, Upload, X, Eye, EyeOff, Star, Search, Download } from "lucide-react"
import { ConfirmationModal } from "@/components/confirmation-modal"
import { CookieDetailModal } from "@/components/admin/cookie-detail-modal"
import { createClient } from "@/lib/supabase/client"
import { getTags, getColors, type CookieItem, type Tag } from "@/lib/store"
import { toast } from "@/components/ui/use-toast"

type Color = {
  id: string
  name: string
  hex: string
}

export function CookiesAdmin() {
  const [cookies, setCookies] = useState<CookieItem[]>([])
  const [filteredCookies, setFilteredCookies] = useState<CookieItem[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [colors, setColors] = useState<Color[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [detailCookie, setDetailCookie] = useState<CookieItem | null>(null)
  const [editingCookie, setEditingCookie] = useState<CookieItem | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterTag, setFilterTag] = useState<string>("")
  const [filterVisibility, setFilterVisibility] = useState<"all" | "visible" | "hidden">("all")
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    ingredients: "",
    tags: [] as string[],
    imageUrls: [] as string[],
    mainImageIndex: 0,
    isVisible: true,
    showInCarousel: false,
  })

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean
    title: string
    message: string
    onConfirm: () => Promise<void>
    type: "danger" | "warning" | "info"
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: async () => {},
    type: "info",
  })

  const [editConfirmModal, setEditConfirmModal] = useState<{
    isOpen: boolean
    onConfirm: () => Promise<void>
  }>({
    isOpen: false,
    onConfirm: async () => {},
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/cookies")
        const cookiesData = await response.json()

        if (!Array.isArray(cookiesData)) {
          console.error("[Message] Expected array but got:", cookiesData)
          setCookies([])
          return
        }

        const transformedCookies = cookiesData.map((cookie: any) => ({
          id: cookie.id,
          name: cookie.name,
          description: cookie.description,
          ingredients: cookie.ingredients || [],
          price: cookie.price,
          imageUrls: cookie.image_urls
            ? typeof cookie.image_urls === "string"
              ? JSON.parse(cookie.image_urls)
              : cookie.image_urls
            : cookie.image_url
              ? [cookie.image_url]
              : [],
          mainImageIndex: cookie.main_image_index || 0,
          tags: Array.isArray(cookie.tags) ? cookie.tags : [],
          isVisible: cookie.is_visible !== false,
          showInCarousel: cookie.in_carousel !== false,
        }))

        setCookies(transformedCookies)
        setTags(getTags())
        setColors(getColors())
      } catch (error) {
        console.error("[Message] Error fetching cookies from database:", error)
        setCookies([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    let result = cookies

    if (searchTerm) {
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (filterTag) {
      result = result.filter((c) => c.tags.some((t) => t.id === filterTag))
    }

    if (filterVisibility === "visible") {
      result = result.filter((c) => c.isVisible)
    } else if (filterVisibility === "hidden") {
      result = result.filter((c) => !c.isVisible)
    }

    setFilteredCookies(result)
  }, [cookies, searchTerm, filterTag, filterVisibility])

  const getTagColor = (tagId: string) => {
    const tag = tags.find((t) => t.id === tagId)
    if (!tag) return "#gray"
    const color = colors.find((c) => c.id === tag.colorId)
    return color?.hex || "#gray"
  }

  const openCreateModal = () => {
    setEditingCookie(null)
    setFormData({
      name: "",
      description: "",
      price: "",
      ingredients: "",
      tags: [],
      imageUrls: [],
      mainImageIndex: 0,
      isVisible: true,
      showInCarousel: false,
    })
    setShowModal(true)
  }

  const openEditModal = (cookie: CookieItem) => {
    setEditingCookie(cookie)
    setFormData({
      name: cookie.name,
      description: cookie.description,
      price: cookie.price.toString(),
      ingredients: cookie.ingredients.join(", "),
      tags: cookie.tags.map((t) => t.id),
      imageUrls: [...cookie.imageUrls],
      mainImageIndex: cookie.mainImageIndex || 0,
      isVisible: cookie.isVisible ?? true,
      showInCarousel: cookie.showInCarousel ?? false,
    })
    setShowModal(true)
  }

  const openDetailModal = (cookie: CookieItem) => {
    setDetailCookie(cookie)
    setShowDetailModal(true)
  }

  const handleImageDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const files = e.dataTransfer.files
    processImageFiles(files)
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files
    if (files) processImageFiles(files)
  }

  const processImageFiles = (files: FileList) => {
    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const imageUrl = e.target?.result as string
          setFormData((prev) => ({
            ...prev,
            imageUrls: [...prev.imageUrls, imageUrl],
          }))
        }
        reader.readAsDataURL(file)
      }
    })
  }

  const removeImage = (index: number) => {
    setFormData((prev) => {
      const newImageUrls = prev.imageUrls.filter((_, i) => i !== index)
      let newMainIndex = prev.mainImageIndex
      if (index === prev.mainImageIndex) {
        newMainIndex = 0
      } else if (index < prev.mainImageIndex) {
        newMainIndex = prev.mainImageIndex - 1
      }
      return {
        ...prev,
        imageUrls: newImageUrls,
        mainImageIndex: Math.min(newMainIndex, Math.max(0, newImageUrls.length - 1)),
      }
    })
  }

  const setMainImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      mainImageIndex: index,
    }))
  }

  const handleSaveClick = () => {
    if (editingCookie) {
      setEditConfirmModal({
        isOpen: true,
        onConfirm: async () => {
          await handleSave()
        },
      })
    } else {
      handleSave()
    }
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "El nombre es requerido",
        variant: "destructive",
      })
      return
    }

    try {
      const supabase = createClient()
      const cookieData = {
        name: formData.name,
        description: formData.description,
        price: Number.parseFloat(formData.price) || 0,
        ingredients: formData.ingredients
          .split(",")
          .map((i) => i.trim())
          .filter((i) => i),
        image_urls: formData.imageUrls,
        main_image_index: formData.mainImageIndex,
        is_visible: formData.isVisible,
        in_carousel: formData.showInCarousel,
      }

      if (editingCookie) {
        const { error } = await supabase.from("cookies").update(cookieData).eq("id", editingCookie.id)

        if (error) throw error

        await supabase.from("cookie_tags").delete().eq("cookie_id", editingCookie.id)

        if (formData.tags.length > 0) {
          const tagRelations = formData.tags.map((tagId) => ({
            cookie_id: editingCookie.id,
            tag_id: tagId,
          }))
          const { error: tagError } = await supabase.from("cookie_tags").insert(tagRelations)
          if (tagError) throw tagError
        }

        toast({
          title: "Galleta actualizada",
          description: `${formData.name} se ha actualizado correctamente.`,
        })
      } else {
        const { data, error } = await supabase.from("cookies").insert([cookieData]).select()

        if (error) throw error

        if (data && data[0] && formData.tags.length > 0) {
          const tagRelations = formData.tags.map((tagId) => ({
            cookie_id: data[0].id,
            tag_id: tagId,
          }))
          const { error: tagError } = await supabase.from("cookie_tags").insert(tagRelations)
          if (tagError) throw tagError
        }

        toast({
          title: "Galleta creada",
          description: `${formData.name} se ha creado correctamente.`,
        })
      }

      const response = await fetch("/api/cookies")
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al obtener las galletas")
      }

      const cookiesData = await response.json()
      const transformedCookies = cookiesData.map((cookie: any) => ({
        id: cookie.id,
        name: cookie.name,
        description: cookie.description,
        ingredients: cookie.ingredients || [],
        price: cookie.price,
        imageUrls: cookie.image_urls
          ? typeof cookie.image_urls === "string"
            ? JSON.parse(cookie.image_urls)
            : cookie.image_urls
          : [],
        mainImageIndex: cookie.main_image_index || 0,
        tags: cookie.tags || [],
        isVisible: cookie.is_visible,
        showInCarousel: cookie.in_carousel,
      }))

      setCookies(transformedCookies)
      setShowModal(false)
      setEditingCookie(null)
      setFormData({
        name: "",
        description: "",
        price: "",
        ingredients: "",
        tags: [],
        imageUrls: [],
        mainImageIndex: 0,
        isVisible: true,
        showInCarousel: false,
      })
    } catch (error) {
      console.error("[Message] Error saving cookie:", error)
      toast({
        title: "Error",
        description: `Error al guardar: ${error instanceof Error ? error.message : "Error desconocido"}`,
        variant: "destructive",
      })
    }
  }

  const handleDeleteClick = (cookie: CookieItem) => {
    setConfirmModal({
      isOpen: true,
      title: "Eliminar galleta",
      message: `¿Estás seguro de que quieres eliminar "${cookie.name}"? Esta acción no se puede deshacer.`,
      type: "danger",
      onConfirm: async () => {
        await handleDelete(cookie.id)
      },
    })
  }

  const handleDelete = async (id: string) => {
    try {
      const supabase = createClient()
      await supabase.from("cookie_tags").delete().eq("cookie_id", id)
      const { error } = await supabase.from("cookies").delete().eq("id", id)
      if (error) throw error

      setCookies(cookies.filter((c) => c.id !== id))

      toast({
        title: "Galleta eliminada",
        description: "La galleta se ha eliminado correctamente.",
      })
    } catch (error) {
      console.error("[Message] Error deleting cookie:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la galleta",
        variant: "destructive",
      })
    }
  }

  const toggleTag = (tagId: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tagId) ? prev.tags.filter((t) => t !== tagId) : [...prev.tags, tagId],
    }))
  }

  const toggleVisibility = async (id: string) => {
    const cookie = cookies.find((c) => c.id === id)
    if (!cookie) return

    const newVisibility = !cookie.isVisible

    try {
      const supabase = createClient()
      const { error } = await supabase.from("cookies").update({ is_visible: newVisibility }).eq("id", id)

      if (error) {
        console.error("[Message] Error toggling visibility:", error)
        toast({
          title: "Error",
          description: "No se pudo cambiar la visibilidad de la galleta",
          variant: "destructive",
        })
        return
      }

      const updated = cookies.map((c) => (c.id === id ? { ...c, isVisible: newVisibility } : c))
      setCookies(updated)

      toast({
        title: "Visibilidad actualizada",
        description: `La galleta ahora está ${newVisibility ? "visible" : "oculta"}`,
      })
    } catch (error) {
      console.error("[Message] Error toggling visibility:", error)
      toast({
        title: "Error",
        description: "No se pudo cambiar la visibilidad de la galleta",
        variant: "destructive",
      })
    }
  }

  const toggleCarousel = async (id: string) => {
    const carouselCount = cookies.filter((c) => c.showInCarousel).length
    const cookie = cookies.find((c) => c.id === id)

    if (!cookie) return

    if (!cookie.showInCarousel && carouselCount >= 8) {
      toast({
        title: "Límite alcanzado",
        description: "Máximo 8 galletas en el carrusel",
        variant: "destructive",
      })
      return
    }

    const newCarouselState = !cookie.showInCarousel

    try {
      const supabase = createClient()
      const { error } = await supabase.from("cookies").update({ in_carousel: newCarouselState }).eq("id", id)

      if (error) {
        console.error("[Message] Error toggling carousel:", error)
        toast({
          title: "Error",
          description: "No se pudo actualizar el estado del carrusel",
          variant: "destructive",
        })
        return
      }

      const updated = cookies.map((c) => (c.id === id ? { ...c, showInCarousel: newCarouselState } : c))
      setCookies(updated)

      toast({
        title: "Carrusel actualizado",
        description: `La galleta fue ${newCarouselState ? "agregada al" : "quitada del"} carrusel`,
      })
    } catch (error) {
      console.error("[Message] Error toggling carousel:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del carrusel",
        variant: "destructive",
      })
    }
  }

  const exportToExcel = () => {
    const headers = ["Nombre", "Descripción", "Precio", "Ingredientes", "Etiquetas", "Visible", "En Carrusel"]
    const rows = filteredCookies.map((c) => [
      c.name,
      c.description,
      c.price.toFixed(2),
      c.ingredients.join("; "),
      c.tags.map((t) => t.name || "").join("; "),
      c.isVisible ? "Sí" : "No",
      c.showInCarousel ? "Sí" : "No",
    ])

    const csvContent = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `galletas_crosti_${new Date().toISOString().split("T")[0]}.csv`
    link.click()
  }

  const carouselCount = cookies.filter((c) => c.showInCarousel).length

  return (
    <>
      <div className="p-8">
        {loading && (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <p className="text-gray-500">Cargando galletas...</p>
          </div>
        )}
        {!loading && (
          <>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Galletas</h2>
                <p className="text-gray-500 text-sm mt-1">Gestiona el catálogo de galletas disponibles</p>
              </div>
              <button
                onClick={openCreateModal}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#930021] text-white rounded-xl hover:bg-[#7a001b] transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Nueva galleta
              </button>
            </div>

            <div className="bg-white rounded-2xl p-4 mb-6 border border-gray-100 flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px] relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar galletas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#930021]/20 focus:border-[#930021] text-sm"
                />
              </div>
              <select
                value={filterTag}
                onChange={(e) => setFilterTag(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#930021]/20 focus:border-[#930021] text-sm"
              >
                <option value="">Todas las etiquetas</option>
                {tags.map((tag) => (
                  <option key={tag.id} value={tag.id}>
                    {tag.name}
                  </option>
                ))}
              </select>
              <select
                value={filterVisibility}
                onChange={(e) => setFilterVisibility(e.target.value as "all" | "visible" | "hidden")}
                className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#930021]/20 focus:border-[#930021] text-sm"
              >
                <option value="all">Todas</option>
                <option value="visible">Visibles</option>
                <option value="hidden">Ocultas</option>
              </select>
              <button
                onClick={exportToExcel}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                <Download className="w-4 h-4" />
                Exportar
              </button>
            </div>

            <div className="grid gap-4">
              {filteredCookies.map((cookie) => (
                <div
                  key={cookie.id}
                  className={`bg-white rounded-2xl p-5 border transition-colors ${
                    cookie.isVisible ? "border-gray-100 hover:border-gray-200" : "border-gray-100 bg-gray-50 opacity-60"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {cookie.imageUrls.length > 0 ? (
                          <img
                            src={cookie.imageUrls[cookie.mainImageIndex] || cookie.imageUrls[0] || "/placeholder.svg"}
                            alt={cookie.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Upload className="w-7 h-7 text-gray-300" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-gray-900">{cookie.name}</h3>
                          {cookie.showInCarousel && (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                              En carrusel
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mb-2 line-clamp-1">{cookie.description}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="inline-flex items-center px-2.5 py-1 bg-[#F9E7AE] text-[#930021] rounded-lg text-sm font-medium">
                            €{cookie.price.toFixed(2)}
                          </span>
                          {cookie.tags.map((tag) => (
                            <span
                              key={tag.id}
                              className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                              style={{ backgroundColor: tag.color_hex }}
                            >
                              {tag.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleCarousel(cookie.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          cookie.showInCarousel
                            ? "text-amber-500 bg-amber-50 hover:bg-amber-100"
                            : "text-gray-400 hover:text-amber-500 hover:bg-gray-100"
                        }`}
                        aria-label={cookie.showInCarousel ? "Quitar del carrusel" : "Añadir al carrusel"}
                        title={cookie.showInCarousel ? "Quitar del carrusel" : "Añadir al carrusel"}
                      >
                        <Star className="w-4 h-4" fill={cookie.showInCarousel ? "currentColor" : "none"} />
                      </button>
                      <button
                        onClick={() => toggleVisibility(cookie.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          cookie.isVisible
                            ? "text-green-500 bg-green-50 hover:bg-green-100"
                            : "text-gray-400 hover:text-green-500 hover:bg-gray-100"
                        }`}
                        aria-label={cookie.isVisible ? "Ocultar" : "Mostrar"}
                        title={cookie.isVisible ? "Ocultar" : "Mostrar"}
                      >
                        {cookie.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => openEditModal(cookie)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        aria-label="Editar"
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openDetailModal(cookie)}
                        className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        aria-label="Ver detalles"
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(cookie)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        aria-label="Eliminar"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {filteredCookies.length === 0 && (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                  <Upload className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No se encontraron galletas</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h3 className="font-semibold text-gray-900">{editingCookie ? "Editar galleta" : "Nueva galleta"}</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#930021]/20 focus:border-[#930021] text-sm"
                    placeholder="Nombre de la galleta"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Precio (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#930021]/20 focus:border-[#930021] text-sm"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#930021]/20 focus:border-[#930021] text-sm resize-none"
                  rows={3}
                  placeholder="Descripción de la galleta"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Ingredientes</label>
                <input
                  type="text"
                  value={formData.ingredients}
                  onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#930021]/20 focus:border-[#930021] text-sm"
                  placeholder="Harina, azúcar, chocolate (separados por comas)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Etiquetas</label>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        formData.tags.includes(tag.id)
                          ? "text-white ring-2 ring-offset-2"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                      style={
                        formData.tags.includes(tag.id)
                          ? { backgroundColor: tag.color_hex, ringColor: tag.color_hex }
                          : {}
                      }
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Imágenes</label>
                <div
                  onDrop={handleImageDrop}
                  onDragOver={(e) => e.preventDefault()}
                  className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-[#930021] transition-colors cursor-pointer"
                  onClick={() => document.getElementById("imageInput")?.click()}
                >
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-1">Arrastra imágenes o haz clic para seleccionar</p>
                  <p className="text-xs text-gray-400">PNG, JPG hasta 5MB</p>
                  <input
                    id="imageInput"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </div>

                {formData.imageUrls.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-3">
                    {formData.imageUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <img src={url || "/placeholder.svg"} alt="" className="w-full h-24 object-cover rounded-lg" />
                        {index === formData.mainImageIndex && (
                          <div className="absolute top-1 left-1 px-2 py-0.5 bg-[#930021] text-white text-xs rounded-md font-medium">
                            Principal
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-1">
                          {index !== formData.mainImageIndex && (
                            <button
                              onClick={() => setMainImage(index)}
                              className="p-1.5 bg-white rounded-lg hover:bg-gray-100"
                              title="Establecer como principal"
                            >
                              <Star className="w-4 h-4 text-gray-700" />
                            </button>
                          )}
                          <button
                            onClick={() => removeImage(index)}
                            className="p-1.5 bg-white rounded-lg hover:bg-red-50"
                            title="Eliminar"
                          >
                            <X className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isVisible}
                    onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
                    className="w-4 h-4 text-[#930021] border-gray-300 rounded focus:ring-[#930021]"
                  />
                  <span className="text-sm text-gray-700">Visible en catálogo</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.showInCarousel}
                    onChange={(e) => setFormData({ ...formData, showInCarousel: e.target.checked })}
                    className="w-4 h-4 text-[#930021] border-gray-300 rounded focus:ring-[#930021]"
                    disabled={!formData.showInCarousel && carouselCount >= 8}
                  />
                  <span className="text-sm text-gray-700">
                    Mostrar en carrusel {carouselCount >= 8 && !formData.showInCarousel && "(máximo alcanzado)"}
                  </span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 p-5 border-t border-gray-100 sticky bottom-0 bg-white">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveClick}
                className="flex-1 px-4 py-2.5 bg-[#930021] text-white rounded-xl hover:bg-[#7a001b] transition-colors text-sm font-medium"
              >
                {editingCookie ? "Guardar cambios" : "Crear galleta"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDetailModal && detailCookie && (
        <CookieDetailModal cookie={detailCookie} onClose={() => setShowDetailModal(false)} />
      )}

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={async () => {
          await confirmModal.onConfirm()
          setConfirmModal({ ...confirmModal, isOpen: false })
        }}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
      />

      <ConfirmationModal
        isOpen={editConfirmModal.isOpen}
        onClose={() => setEditConfirmModal({ ...editConfirmModal, isOpen: false })}
        onConfirm={async () => {
          await editConfirmModal.onConfirm()
          setEditConfirmModal({ ...editConfirmModal, isOpen: false })
        }}
        title="Confirmar cambios"
        message="¿Estás seguro de que quieres guardar los cambios en esta galleta?"
        type="info"
      />
    </>
  )
}
