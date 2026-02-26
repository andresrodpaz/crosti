"use client"

import { useState, useEffect } from "react"
import { Plus, Edit2, Trash2, Package, X, Save, Cookie, GripVertical, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"

interface CookieItem {
  id: string
  name: string
  image_urls: string[]
  main_image_index: number
}

interface BoxCookie {
  cookie_id: string
  quantity: number
  cookie?: CookieItem
}

interface Box {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  is_visible: boolean
  display_order: number
  cookies: BoxCookie[]
}

export function BoxesAdmin() {
  const [boxes, setBoxes] = useState<Box[]>([])
  const [cookies, setCookies] = useState<CookieItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editingBox, setEditingBox] = useState<Box | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    image_url: "",
    is_visible: true,
    cookies: [] as { cookie_id: string; quantity: number }[],
  })

  useEffect(() => {
    fetchBoxes()
    fetchCookies()
  }, [])

  const fetchBoxes = async () => {
    try {
      const res = await fetch("/api/boxes?all=true")
      if (res.ok) {
        const data = await res.json()
        setBoxes(data)
      }
    } catch (error) {
      console.error("Error fetching boxes:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCookies = async () => {
    try {
      const res = await fetch("/api/cookies")
      if (res.ok) {
        const data = await res.json()
        setCookies(data.filter((c: any) => c.is_visible))
      }
    } catch (error) {
      console.error("Error fetching cookies:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: 0,
      image_url: "",
      is_visible: true,
      cookies: [],
    })
    setEditingBox(null)
    setIsCreating(false)
  }

  const handleEdit = (box: Box) => {
    setEditingBox(box)
    setFormData({
      name: box.name,
      description: box.description || "",
      price: box.price,
      image_url: box.image_url || "",
      is_visible: box.is_visible,
      cookies: box.cookies.map((c) => ({ cookie_id: c.cookie_id, quantity: c.quantity })),
    })
    setIsCreating(true)
  }

  const handleCreate = () => {
    resetForm()
    setIsCreating(true)
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({ title: "Error", description: "El nombre es requerido", variant: "destructive" })
      return
    }

    try {
      const url = editingBox ? `/api/boxes/${editingBox.id}` : "/api/boxes"
      const method = editingBox ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          display_order: editingBox?.display_order || boxes.length,
        }),
      })

      if (res.ok) {
        toast({ title: "Exito", description: editingBox ? "Caja actualizada" : "Caja creada" })
        fetchBoxes()
        resetForm()
      } else {
        throw new Error("Failed to save box")
      }
    } catch (error) {
      toast({ title: "Error", description: "No se pudo guardar la caja", variant: "destructive" })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta caja?")) return

    try {
      const res = await fetch(`/api/boxes/${id}`, { method: "DELETE" })
      if (res.ok) {
        toast({ title: "Exito", description: "Caja eliminada" })
        fetchBoxes()
      }
    } catch (error) {
      toast({ title: "Error", description: "No se pudo eliminar", variant: "destructive" })
    }
  }

  const toggleVisibility = async (box: Box) => {
    try {
      const res = await fetch(`/api/boxes/${box.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...box, is_visible: !box.is_visible }),
      })
      if (res.ok) {
        fetchBoxes()
      }
    } catch (error) {
      console.error("Error toggling visibility:", error)
    }
  }

  const addCookieToBox = (cookieId: string) => {
    const existing = formData.cookies.find((c) => c.cookie_id === cookieId)
    if (existing) {
      setFormData({
        ...formData,
        cookies: formData.cookies.map((c) => (c.cookie_id === cookieId ? { ...c, quantity: c.quantity + 1 } : c)),
      })
    } else {
      setFormData({
        ...formData,
        cookies: [...formData.cookies, { cookie_id: cookieId, quantity: 1 }],
      })
    }
  }

  const updateCookieQuantity = (cookieId: string, quantity: number) => {
    if (quantity <= 0) {
      setFormData({
        ...formData,
        cookies: formData.cookies.filter((c) => c.cookie_id !== cookieId),
      })
    } else {
      setFormData({
        ...formData,
        cookies: formData.cookies.map((c) => (c.cookie_id === cookieId ? { ...c, quantity } : c)),
      })
    }
  }

  const removeCookieFromBox = (cookieId: string) => {
    setFormData({
      ...formData,
      cookies: formData.cookies.filter((c) => c.cookie_id !== cookieId),
    })
  }

  const getCookieById = (id: string) => cookies.find((c) => c.id === id)

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#930021] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Cajas</h1>
          <p className="text-gray-500 mt-1">Gestiona cajas predefinidas con galletas</p>
        </div>
        {!isCreating && (
          <Button onClick={handleCreate} className="bg-[#930021] hover:bg-[#930021]/90 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Nueva Caja
          </Button>
        )}
      </div>

      {isCreating && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">{editingBox ? "Editar Caja" : "Nueva Caja"}</h2>
            <Button variant="ghost" size="icon" onClick={resetForm}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label>Nombre</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Caja Surtida"
                />
              </div>

              <div>
                <Label>Descripcion</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Una seleccion de nuestras mejores galletas..."
                  rows={3}
                />
              </div>

              <div>
                <Label>Precio (EUR)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number.parseFloat(e.target.value) || 0 })}
                />
              </div>

                <div className="space-y-2">
                  <Label>Imagen</Label>
                  <div className="flex gap-2">
                    <Input
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      placeholder="https://..."
                      className="flex-1"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      id="image-upload"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        
                        // Upload logic
                        try {
                           // Set loading state if I had one for this specific action, 
                           // but for now relying on toast
                           toast({ title: 'Subiendo imagen...', description: 'Por favor espere' })
                           
                           const res = await fetch(`/api/upload?filename=${file.name}`, {
                             method: 'POST',
                             body: file,
                           })
                           
                           if (!res.ok) throw new Error("Upload failed")
                           
                           const blob = await res.json()
                           setFormData(prev => ({ ...prev, image_url: blob.url }))
                           toast({ title: 'Exito', description: 'Imagen subida correctamente' })

                        } catch (error) {
                          console.error(error)
                          toast({ title: 'Error', description: 'Error al subir la imagen', variant: 'destructive' })
                        }
                      }}
                    />
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById("image-upload")?.click()}
                        className="w-full bg-transparent"
                    >
                        Subir desde archivo
                    </Button>
                  </div>
                  {formData.image_url && (
                    <div className="mt-2 relative w-full h-40 bg-gray-100 rounded-lg overflow-hidden border">
                      <img 
                        src={formData.image_url} 
                        alt="Preview" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_visible}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_visible: checked })}
                />
                <Label>Visible en la tienda</Label>
              </div>
            </div>

            <div className="space-y-4">
              <Label>Galletas en la caja</Label>

              {/* Selected cookies */}
              <div className="border rounded-xl p-4 min-h-[150px] bg-gray-50">
                {formData.cookies.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-4">Agrega galletas a esta caja</p>
                ) : (
                  <div className="space-y-2">
                    {formData.cookies.map((boxCookie) => {
                      const cookie = getCookieById(boxCookie.cookie_id)
                      if (!cookie) return null
                      return (
                        <div
                          key={boxCookie.cookie_id}
                          className="flex items-center gap-3 bg-white rounded-lg p-2 border"
                        >
                          <img
                            src={cookie.image_urls?.[cookie.main_image_index] || cookie.image_urls?.[0] || "/placeholder.svg"}
                            alt={cookie.name}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                          <span className="flex-1 text-sm font-medium">{cookie.name}</span>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7 bg-transparent"
                              onClick={() => updateCookieQuantity(boxCookie.cookie_id, boxCookie.quantity - 1)}
                            >
                              -
                            </Button>
                            <span className="w-8 text-center text-sm">{boxCookie.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7 bg-transparent"
                              onClick={() => updateCookieQuantity(boxCookie.cookie_id, boxCookie.quantity + 1)}
                            >
                              +
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => removeCookieFromBox(boxCookie.cookie_id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Available cookies */}
              <Label>Galletas disponibles</Label>
              <div className="border rounded-xl p-4 max-h-[200px] overflow-y-auto">
                <div className="grid grid-cols-2 gap-2">
                  {cookies.map((cookie) => (
                    <button
                      key={cookie.id}
                      onClick={() => addCookieToBox(cookie.id)}
                      type="button"
                      className="flex items-center gap-2 p-2 rounded-lg border hover:bg-gray-50 transition-colors text-left"
                    >
                      <img
                        src={cookie.image_urls?.[cookie.main_image_index] || cookie.image_urls?.[0] || "/placeholder.svg"}
                        alt={cookie.name}
                        className="w-8 h-8 rounded-lg object-cover"
                      />
                      <span className="text-xs font-medium truncate">{cookie.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
            <Button variant="outline" onClick={resetForm} className="bg-transparent">
              Cancelar
            </Button>
            <Button onClick={handleSave} className="bg-[#930021] hover:bg-[#930021]/90 text-white">
              <Save className="w-4 h-4 mr-2" />
              Guardar
            </Button>
          </div>
        </div>
      )}

      {/* Boxes List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {boxes.map((box) => (
          <div
            key={box.id}
            className={`bg-white rounded-2xl border border-gray-200 overflow-hidden transition-all hover:shadow-md ${
              !box.is_visible ? "opacity-60" : ""
            }`}
          >
            {box.image_url ? (
              <img src={box.image_url || "/placeholder.svg"} alt={box.name} className="w-full h-40 object-contain bg-gray-50" />
            ) : (
              <div className="w-full h-40 bg-gray-100 flex items-center justify-center">
                <Package className="w-12 h-12 text-gray-300" />
              </div>
            )}
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900">{box.name}</h3>
                  <p className="text-lg font-bold text-[#930021]">{box.price.toFixed(2)} EUR</p>
                </div>
                <button
                  onClick={() => toggleVisibility(box)}
                  type="button"
                  className={`p-1.5 rounded-lg transition-colors ${box.is_visible ? "text-green-600 bg-green-50" : "text-gray-400 bg-gray-100"}`}
                >
                  {box.is_visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>

              {box.description && <p className="text-sm text-gray-500 mb-3 line-clamp-2">{box.description}</p>}

              {box.cookies.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {box.cookies.slice(0, 3).map((bc) => (
                    <span key={bc.cookie_id} className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                      {bc.cookie?.name || "Galleta"} x{bc.quantity}
                    </span>
                  ))}
                  {box.cookies.length > 3 && (
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">+{box.cookies.length - 3} mas</span>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 bg-transparent"
                  onClick={() => handleEdit(box)}
                >
                  <Edit2 className="w-3 h-3 mr-1" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 bg-transparent"
                  onClick={() => handleDelete(box.id)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {boxes.length === 0 && !isCreating && (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No hay cajas creadas</p>
          <Button onClick={handleCreate} className="mt-4 bg-[#930021] hover:bg-[#930021]/90 text-white">
            Crear primera caja
          </Button>
        </div>
      )}
    </div>
  )
}
