"use client"

import { Plus, Edit2, Trash2, Eye, Save, X, Search, Check, Star, ChevronRight, ChevronLeft, Layers, Palette, Cookie, Sparkles, ToggleLeft, ToggleRight, ArrowUp, ArrowDown, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { createClient } from "@/lib/supabase/client"
import { MonthlyCookiesSection } from "../monthly-cookies-section"
import type { MonthlyCollection as MonthlyCollectionData } from "../monthly-cookies-section"
import { toast } from "@/components/ui/use-toast"

interface MonthlyCollection {
  id: string
  title: string
  subtitle: string
  description?: string
  is_active: boolean
  status: "draft" | "active" | "archived"
  bg_color: string
  text_color?: string
  title_color?: string
}

interface CookieItem {
  id: string
  name: string
  image_url: string
  price: number
}

interface CollectionItem {
  id?: string
  collection_id?: string
  cookie_id: string
  display_order: number
  is_hero: boolean
  custom_tag?: string
  cookie?: CookieItem
}

interface ColorOption {
  id: string
  name: string
  hex: string
}

// ─── Wizard Steps ────────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: "Información", icon: Layers },
  { id: 2, label: "Estilo", icon: Palette },
  { id: 3, label: "Galletas", icon: Cookie },
]

export function MonthlyCookiesAdmin() {
  const [collections, setCollections] = useState<MonthlyCollection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCollection, setEditingCollection] = useState<MonthlyCollection | null>(null)
  const [collectionToDelete, setCollectionToDelete] = useState<MonthlyCollection | null>(null)

  // Loading / Submitting States (to prevent double-clicks)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  // Wizard step
  const [currentStep, setCurrentStep] = useState(1)

  // Preview state
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [previewCollection, setPreviewCollection] = useState<MonthlyCollectionData | null>(null)

  // Form State
  const [formData, setFormData] = useState<Partial<MonthlyCollection>>({
    title: "Galletas del Mes",
    subtitle: "Selección especial",
    bg_color: "#FEFCF5",
    text_color: "#930021",
    title_color: "#930021",
    status: "draft",
    is_active: false,
  })

  // Items Management State
  const [selectedCookies, setSelectedCookies] = useState<CollectionItem[]>([])
  const [availableCookies, setAvailableCookies] = useState<CookieItem[]>([])
  const [cookieSearch, setCookieSearch] = useState("")
  const [availableColors, setAvailableColors] = useState<ColorOption[]>([])

  const supabase = createClient()

  useEffect(() => {
    loadCollections()
    loadAvailableCookies()
    loadAvailableColors()
  }, [])

  async function loadCollections() {
    try {
      const { data, error } = await supabase
        .from("monthly_collections")
        .select("*")
        .order("created_at", { ascending: false })
      if (error) throw error
      setCollections(data || [])
    } catch (error) {
      console.error("Error loading collections:", error)
      toast({ variant: "destructive", title: "Error", description: "No se pudieron cargar las colecciones" })
    } finally {
      setIsLoading(false)
    }
  }

  async function loadAvailableCookies() {
    try {
      const res = await fetch("/api/cookies?all=true")
      const data = await res.json()
      if (Array.isArray(data)) {
        setAvailableCookies(
          data.map((c: any) => ({
            id: c.id,
            name: c.name,
            price: c.price,
            image_url: c.image_urls?.[0] || "",
          }))
        )
      }
    } catch (e) {
      console.error("Error fetching cookies:", e)
    }
  }

  async function loadAvailableColors() {
    const { data } = await supabase.from("colors").select("*").order("created_at", { ascending: true })
    if (data) setAvailableColors(data)
  }

  async function loadCollectionItems(collectionId: string) {
    const { data } = await supabase
      .from("monthly_collection_items")
      .select("*, cookie:cookies(id, name, image_urls, price)")
      .eq("collection_id", collectionId)
      .order("display_order")

    if (data) {
      const getImg = (raw: any) => {
        if (!raw) return ""
        if (Array.isArray(raw)) return raw[0] || ""
        try { return JSON.parse(raw)?.[0] || "" } catch { return "" }
      }
      setSelectedCookies(
        data.map((item: any) => ({
          id: item.id,
          collection_id: item.collection_id,
          cookie_id: item.cookie_id,
          display_order: item.display_order,
          is_hero: item.is_hero,
          custom_tag: item.custom_tag,
          cookie: {
            id: item.cookie.id,
            name: item.cookie.name,
            price: item.cookie.price,
            image_url: getImg(item.cookie.image_urls),
          },
        }))
      )
    }
  }

  const handleOpenDialog = async (collection?: MonthlyCollection) => {
    setCurrentStep(1)
    if (collection) {
      setEditingCollection(collection)
      setFormData({ ...collection })
      await loadCollectionItems(collection.id)
    } else {
      setEditingCollection(null)
      setFormData({
        title: "Galletas del Mes",
        subtitle: "Selección especial",
        bg_color: "#FEFCF5",
        text_color: "#930021",
        title_color: "#930021",
        status: "draft",
        is_active: false,
      })
      setSelectedCookies([])
    }
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    if (saving) return
    setSaving(true)
    try {
      if (!formData.title) return

      let collectionId = editingCollection?.id

      if (editingCollection) {
        const { error } = await supabase
          .from("monthly_collections")
          .update(formData)
          .eq("id", collectionId)
        if (error) throw error
      } else {
        const { data, error } = await supabase
          .from("monthly_collections")
          .insert([formData])
          .select()
          .single()
        if (error) throw error
        collectionId = data.id
      }

      if (collectionId) {
        await supabase.from("monthly_collection_items").delete().eq("collection_id", collectionId)
        if (selectedCookies.length > 0) {
          const itemsToInsert = selectedCookies.map((item, index) => ({
            collection_id: collectionId,
            cookie_id: item.cookie_id,
            display_order: index,
            is_hero: item.is_hero,
            custom_tag: item.custom_tag,
          }))
          const { error: itemsError } = await supabase.from("monthly_collection_items").insert(itemsToInsert)
          if (itemsError) throw itemsError
        }
      }

      toast({ title: "✅ Guardado", description: "La colección se ha guardado correctamente" })
      setIsDialogOpen(false)
      await loadCollections()
    } catch (error) {
      console.error("Error saving:", error)
      toast({ variant: "destructive", title: "Error", description: "Ocurrió un error al guardar" })
    } finally {
      setSaving(false)
    }
  }

  const toggleCookieSelection = (cookie: CookieItem) => {
    const exists = selectedCookies.find((item) => item.cookie_id === cookie.id)
    if (exists) {
      setSelectedCookies((prev) => prev.filter((item) => item.cookie_id !== cookie.id))
    } else {
      setSelectedCookies((prev) => [
        ...prev,
        { cookie_id: cookie.id, display_order: prev.length, is_hero: false, cookie },
      ])
    }
  }

  const toggleHero = (index: number) => {
    const newCookies = [...selectedCookies]
    newCookies[index].is_hero = !newCookies[index].is_hero
    setSelectedCookies(newCookies)
  }

  const updateCustomTag = (index: number, val: string) => {
    const newCookies = [...selectedCookies]
    newCookies[index].custom_tag = val
    setSelectedCookies(newCookies)
  }

  const moveItem = (index: number, dir: "up" | "down") => {
    const newCookies = [...selectedCookies]
    const swap = dir === "up" ? index - 1 : index + 1
    if (swap < 0 || swap >= newCookies.length) return
    ;[newCookies[index], newCookies[swap]] = [newCookies[swap], newCookies[index]]
    setSelectedCookies(newCookies)
  }

  const toggleActiveStatus = async (collection: MonthlyCollection) => {
    if (togglingId === collection.id) return
    setTogglingId(collection.id)
    try {
      if (!collection.is_active) {
        await supabase.from("monthly_collections").update({ is_active: false, status: "archived" }).eq("is_active", true)
      }
      const newStatus = !collection.is_active
      await supabase
        .from("monthly_collections")
        .update({ is_active: newStatus, status: newStatus ? "active" : "draft" })
        .eq("id", collection.id)
      await loadCollections()
    } catch (err) {
      console.error("Error toggling status:", err)
      toast({ variant: "destructive", title: "Error", description: "No se pudo cambiar el estado" })
    } finally {
      setTogglingId(null)
    }
  }

  const handleDelete = async () => {
    if (!collectionToDelete || deleting) return
    setDeleting(true)
    try {
      const { error } = await supabase.from("monthly_collections").delete().eq("id", collectionToDelete.id)
      if (error) throw error
      toast({ title: "Colección eliminada" })
      await loadCollections()
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: "Ocurrió un error al eliminar" })
    } finally {
      setDeleting(false)
      setCollectionToDelete(null)
    }
  }

  const handlePreview = (collection: MonthlyCollection) => {
    supabase
      .from("monthly_collection_items")
      .select("*, cookie:cookies(id, name, description, price, image_urls)")
      .eq("collection_id", collection.id)
      .order("display_order")
      .then(({ data }) => {
        if (data) {
          const getImg = (raw: any) => {
            if (!raw) return ""
            if (Array.isArray(raw)) return raw[0] || ""
            try { return JSON.parse(raw)?.[0] || "" } catch { return "" }
          }
          const items = data.map((item: any) => ({
            is_hero: item.is_hero,
            custom_tag: item.custom_tag,
            cookie: {
              id: item.cookie.id,
              name: item.cookie.name,
              description: item.cookie.description,
              price: item.cookie.price,
              image_url: getImg(item.cookie.image_urls),
              tags: [],
            },
          }))
          setPreviewCollection({
            title: collection.title,
            subtitle: collection.subtitle,
            description: collection.description,
            bg_color: collection.bg_color,
            title_color: collection.title_color,
            text_color: collection.text_color,
            items,
          })
          setIsPreviewOpen(true)
        }
      })
  }

  const handleFormPreview = () => {
    const items = selectedCookies.map((item) => ({
      is_hero: item.is_hero,
      custom_tag: item.custom_tag,
      cookie: {
        id: item.cookie!.id,
        name: item.cookie!.name,
        description: "",
        price: item.cookie!.price,
        image_url: item.cookie!.image_url,
        tags: [],
      },
    }))
    setPreviewCollection({
      title: formData.title || "",
      subtitle: formData.subtitle || "",
      description: formData.description,
      bg_color: formData.bg_color || "#FEFCF5",
      title_color: formData.title_color,
      text_color: formData.text_color,
      items,
    })
    setIsPreviewOpen(true)
  }

  const filteredCookies = availableCookies.filter((c) =>
    c.name.toLowerCase().includes(cookieSearch.toLowerCase())
  )

  const canProceed = () => {
    if (currentStep === 1) return !!formData.title && !!formData.subtitle
    if (currentStep === 2) return !!formData.bg_color
    return true
  }

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[300px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-[#930021] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Cargando colecciones...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Colecciones</h2>
          <p className="text-gray-500 text-sm mt-1">Gestiona las colecciones destacadas del mes</p>
        </div>
        <Button
          onClick={() => handleOpenDialog()}
          className="bg-[#930021] hover:bg-[#7a001b] text-white gap-2 rounded-xl shadow-lg shadow-red-900/20"
        >
          <Plus className="w-4 h-4" /> Nueva Colección
        </Button>
      </div>

      {/* Collections list */}
      <div className="space-y-3">
        {collections.map((collection) => (
          <div
            key={collection.id}
            className={`group bg-white rounded-2xl border transition-all duration-200 ${
              collection.is_active
                ? "border-[#930021]/30 ring-2 ring-[#930021]/10 shadow-md"
                : "border-gray-100 hover:border-gray-200 hover:shadow-md"
            }`}
          >
            <div className="flex items-center gap-4 p-4">
              {/* Color swatch */}
              <div
                className="w-14 h-14 rounded-xl flex-shrink-0 shadow-inner border border-white/50"
                style={{ backgroundColor: collection.bg_color }}
              />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="font-bold text-gray-900 truncate">{collection.title}</h3>
                  {collection.is_active && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[11px] font-bold rounded-full border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      ACTIVA
                    </span>
                  )}
                  {collection.status === "draft" && !collection.is_active && (
                    <span className="px-2 py-0.5 bg-gray-50 text-gray-400 text-[11px] font-bold rounded-full border border-gray-200">
                      BORRADOR
                    </span>
                  )}
                  {collection.status === "archived" && (
                    <span className="px-2 py-0.5 bg-amber-50 text-amber-600 text-[11px] font-bold rounded-full border border-amber-200">
                      ARCHIVADA
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 truncate">{collection.subtitle}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 ml-auto">
                <button
                  onClick={() => toggleActiveStatus(collection)}
                  disabled={togglingId === collection.id}
                  title={collection.is_active ? "Desactivar" : "Activar"}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 ${
                    collection.is_active
                      ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                      : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  {togglingId === collection.id ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#930021]" />
                  ) : collection.is_active ? (
                    <ToggleRight className="w-4 h-4" />
                  ) : (
                    <ToggleLeft className="w-4 h-4" />
                  )}
                  {collection.is_active ? "Activa" : "Inactiva"}
                </button>

                <button
                  onClick={() => handlePreview(collection)}
                  title="Previsualizar"
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleOpenDialog(collection)}
                  title="Editar"
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-50 hover:text-gray-700 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCollectionToDelete(collection)}
                  title="Eliminar"
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {collections.length === 0 && (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <Sparkles className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No hay colecciones creadas</p>
            <p className="text-gray-400 text-sm mt-1">Crea tu primera colección del mes</p>
          </div>
        )}
      </div>

      {/* ─── Create / Edit Dialog (Wizard) ──────────────────────────────────── */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[92vh] overflow-hidden flex flex-col p-0 gap-0 rounded-3xl">
          <DialogDescription className="sr-only">Formulario para crear o editar una colección mensual</DialogDescription>

          {/* Dialog header */}
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100">
            <DialogTitle className="text-xl font-bold text-gray-900">
              {editingCollection ? "Editar Colección" : "Nueva Colección"}
            </DialogTitle>

            {/* Step indicators */}
            <div className="flex items-center gap-2 mt-4">
              {STEPS.map((step, i) => {
                const Icon = step.icon
                const isActive = currentStep === step.id
                const isDone = currentStep > step.id
                return (
                  <div key={step.id} className="flex items-center gap-2">
                    <button
                      onClick={() => isDone && setCurrentStep(step.id)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold transition-all ${
                        isActive
                          ? "bg-[#930021] text-white shadow-md"
                          : isDone
                          ? "bg-[#930021]/10 text-[#930021] cursor-pointer hover:bg-[#930021]/20"
                          : "bg-gray-100 text-gray-400 cursor-default"
                      }`}
                    >
                      {isDone ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <Icon className="w-3.5 h-3.5" />
                      )}
                      {step.label}
                    </button>
                    {i < STEPS.length - 1 && (
                      <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                    )}
                  </div>
                )
              })}
            </div>
          </DialogHeader>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto px-6 py-5">

            {/* ── Step 1: Información ── */}
            {currentStep === 1 && (
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-gray-700">Título de la colección *</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ej: Galletas de Primavera"
                    className="rounded-xl border-gray-200 focus:border-[#930021] h-11"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-gray-700">Subtítulo *</Label>
                  <Input
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder="Ej: Edición limitada de abril"
                    className="rounded-xl border-gray-200 focus:border-[#930021] h-11"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-gray-700">
                    Descripción <span className="text-gray-400 font-normal">(opcional)</span>
                  </Label>
                  <Textarea
                    value={formData.description || ""}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descripción de marketing o detalles de la colección..."
                    className="resize-none h-24 rounded-xl border-gray-200 focus:border-[#930021]"
                  />
                </div>

                {/* Live mini preview */}
                {(formData.title || formData.subtitle) && (
                  <div
                    className="rounded-2xl p-5 border border-white/50 shadow-inner mt-2"
                    style={{ backgroundColor: formData.bg_color || "#FEFCF5" }}
                  >
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: formData.title_color || "#930021" }}>
                      Previsualización
                    </p>
                    <h3 className="text-xl font-bold leading-tight" style={{ color: formData.title_color || "#930021" }}>
                      {formData.title || "Título de la colección"}
                    </h3>
                    <p className="text-sm mt-1" style={{ color: formData.text_color || "#924c14" }}>
                      {formData.subtitle || "Subtítulo de la colección"}
                    </p>
                    {formData.description && (
                      <p className="text-xs mt-1 opacity-70" style={{ color: formData.text_color || "#924c14" }}>
                        {formData.description}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── Step 2: Estilo ── */}
            {currentStep === 2 && (
              <div className="space-y-6">
                {/* Background color */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Color de fondo</Label>
                  {availableColors.length > 0 ? (
                    <div className="grid grid-cols-8 gap-2 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                      {availableColors.map((color) => {
                        const isSelected = formData.bg_color === color.hex
                        return (
                          <button
                            key={color.id}
                            onClick={() => setFormData({ ...formData, bg_color: color.hex })}
                            title={color.name}
                            className={`aspect-square rounded-xl transition-all border-2 ${
                              isSelected ? "border-[#930021] scale-110 shadow-lg" : "border-transparent hover:scale-105"
                            }`}
                            style={{ backgroundColor: color.hex }}
                          >
                            {isSelected && (
                              <div className="flex items-center justify-center h-full">
                                <Check className="w-3 h-3 text-white drop-shadow" />
                              </div>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  ) : null}
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={formData.bg_color || "#FEFCF5"}
                      onChange={(e) => setFormData({ ...formData, bg_color: e.target.value })}
                      className="w-10 h-10 rounded-xl cursor-pointer border border-gray-200 overflow-hidden"
                    />
                    <Input
                      value={formData.bg_color || ""}
                      onChange={(e) => setFormData({ ...formData, bg_color: e.target.value })}
                      placeholder="#FEFCF5"
                      className="flex-1 font-mono text-sm h-10 rounded-xl"
                    />
                  </div>
                </div>

                {/* Text colors */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">Color del título</Label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={formData.title_color || "#930021"}
                        onChange={(e) => setFormData({ ...formData, title_color: e.target.value })}
                        className="w-10 h-10 rounded-xl cursor-pointer border border-gray-200 overflow-hidden"
                      />
                      <Input
                        value={formData.title_color || ""}
                        onChange={(e) => setFormData({ ...formData, title_color: e.target.value })}
                        placeholder="#930021"
                        className="flex-1 font-mono text-sm h-10 rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">Color del texto</Label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={formData.text_color || "#924c14"}
                        onChange={(e) => setFormData({ ...formData, text_color: e.target.value })}
                        className="w-10 h-10 rounded-xl cursor-pointer border border-gray-200 overflow-hidden"
                      />
                      <Input
                        value={formData.text_color || ""}
                        onChange={(e) => setFormData({ ...formData, text_color: e.target.value })}
                        placeholder="#924c14"
                        className="flex-1 font-mono text-sm h-10 rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                {/* Live color preview */}
                <div
                  className="rounded-2xl p-6 border border-white/50 shadow-inner"
                  style={{ backgroundColor: formData.bg_color || "#FEFCF5" }}
                >
                  <p className="text-xs uppercase tracking-widest font-bold mb-2 opacity-60" style={{ color: formData.title_color || "#930021" }}>
                    EDICIÓN LIMITADA
                  </p>
                  <h3 className="text-2xl font-bold" style={{ color: formData.title_color || "#930021" }}>
                    {formData.title || "Título"}
                  </h3>
                  <p className="text-base mt-1" style={{ color: formData.text_color || "#924c14" }}>
                    {formData.subtitle || "Subtítulo de la colección"}
                  </p>
                </div>
              </div>
            )}

            {/* ── Step 3: Galletas ── */}
            {currentStep === 3 && (
              <div className="space-y-5">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar galletas..."
                    className="pl-9 rounded-xl h-10 border-gray-200"
                    value={cookieSearch}
                    onChange={(e) => setCookieSearch(e.target.value)}
                  />
                </div>

                {/* Cookie grid picker */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-52 overflow-y-auto pr-1">
                  {filteredCookies.map((cookie) => {
                    const isSelected = selectedCookies.some((s) => s.cookie_id === cookie.id)
                    return (
                      <button
                        key={cookie.id}
                        onClick={() => toggleCookieSelection(cookie)}
                        className={`relative flex items-center gap-2 p-2 rounded-xl border text-left transition-all ${
                          isSelected
                            ? "bg-[#930021]/5 border-[#930021]/40 ring-1 ring-[#930021]/20"
                            : "bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <img
                          src={cookie.image_url || "/placeholder.svg"}
                          alt={cookie.name}
                          className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                        />
                        <span className="text-xs font-semibold text-gray-700 line-clamp-2 leading-tight">
                          {cookie.name}
                        </span>
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#930021] rounded-full flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>

                {/* Selected cookies — ordered list */}
                {selectedCookies.length > 0 && (
                  <div className="space-y-2 border-t pt-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-gray-800">
                        Galletas seleccionadas ({selectedCookies.length})
                      </p>
                      <p className="text-xs text-gray-400">Arrastra o usa las flechas para ordenar</p>
                    </div>
                    <div className="space-y-2">
                      {selectedCookies.map((item, idx) => (
                        <div
                          key={item.cookie_id}
                          className="flex items-center gap-3 bg-gray-50 border border-gray-100 p-2.5 rounded-xl"
                        >
                          {/* Order controls */}
                          <div className="flex flex-col gap-0.5">
                            <button
                              onClick={() => moveItem(idx, "up")}
                              disabled={idx === 0}
                              className="w-5 h-5 rounded flex items-center justify-center text-gray-300 hover:text-gray-600 disabled:opacity-20"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => moveItem(idx, "down")}
                              disabled={idx === selectedCookies.length - 1}
                              className="w-5 h-5 rounded flex items-center justify-center text-gray-300 hover:text-gray-600 disabled:opacity-20"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                          </div>

                          <img
                            src={item.cookie?.image_url || "/placeholder.svg"}
                            alt={item.cookie?.name}
                            className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                          />

                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-gray-800 truncate">{item.cookie?.name}</p>
                            <p className="text-xs text-gray-400">{item.cookie?.price?.toFixed(2)}€</p>
                          </div>

                          {/* Badge input */}
                          <Input
                            placeholder="Badge (ej: Nuevo)"
                            className="w-28 h-8 text-xs rounded-lg border-gray-200"
                            value={item.custom_tag || ""}
                            onChange={(e) => updateCustomTag(idx, e.target.value)}
                          />

                          {/* Hero toggle */}
                          <button
                            onClick={() => toggleHero(idx)}
                            title="Marcar como destacada"
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                              item.is_hero
                                ? "bg-amber-400 text-white shadow-md"
                                : "bg-white border border-gray-200 text-gray-400 hover:border-amber-400 hover:text-amber-400"
                            }`}
                          >
                            <Star className="w-3.5 h-3.5" />
                          </button>

                          {/* Remove */}
                          <button
                            onClick={() => toggleCookieSelection(item.cookie!)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <p className="text-[11px] text-amber-600 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" /> La galleta marcada con estrella se mostrará como destacada (hero)
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Dialog footer */}
          <div className="border-t border-gray-100 px-6 py-4 flex items-center justify-between gap-3 bg-gray-50/50">
            <div className="flex items-center gap-2">
              {currentStep === 3 && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleFormPreview}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 gap-2"
                >
                  <Eye className="w-4 h-4" /> Previsualizar
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {currentStep > 1 && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep((s) => s - 1)}
                  className="gap-1.5 rounded-xl"
                >
                  <ChevronLeft className="w-4 h-4" /> Atrás
                </Button>
              )}
              {currentStep < STEPS.length ? (
                <Button
                  onClick={() => setCurrentStep((s) => s + 1)}
                  disabled={!canProceed()}
                  className="bg-[#930021] hover:bg-[#7a001b] text-white gap-1.5 rounded-xl"
                >
                  Siguiente <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-[#930021] hover:bg-[#7a001b] text-white gap-2 rounded-xl px-6 disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" /> Guardar Colección
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── Delete confirm ─────────────────────────────────────────────────── */}
      <AlertDialog open={!!collectionToDelete} onOpenChange={(open) => !open && setCollectionToDelete(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar colección?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará la colección &quot;{collectionToDelete?.title}&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting} className="rounded-xl">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-red-600 hover:bg-red-700 rounded-xl disabled:opacity-60">
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2 inline" /> Eliminando...
                </>
              ) : (
                "Sí, eliminar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ─── Preview modal ───────────────────────────────────────────────────── */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-[95vw] w-full max-h-[95vh] h-full overflow-y-auto p-0 bg-transparent border-0 ring-0 shadow-none">
          <DialogTitle className="sr-only">Previsualización de colección</DialogTitle>
          <div className="bg-white sticky top-0 z-50 p-4 shadow-md flex justify-between items-center rounded-b-2xl max-w-7xl mx-auto w-full">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-500" /> Previsualización en vivo
            </h3>
            <Button variant="outline" onClick={() => setIsPreviewOpen(false)} className="rounded-xl gap-2">
              <X className="w-4 h-4" /> Cerrar
            </Button>
          </div>
          <div className="mt-4 pointer-events-none">
            {previewCollection && <MonthlyCookiesSection previewData={previewCollection} />}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
