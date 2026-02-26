"use client"

import { useState, useEffect } from "react"
import { Plus, Edit2, Trash2, Eye, EyeOff, Calendar, Save, X, Search, GripVertical, Check, Palette } from "lucide-react"
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
  DialogFooter,
} from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface MonthlyCollection {
  id: string
  title: string
  subtitle: string
  description?: string
  start_date?: string
  end_date?: string
  is_active: boolean
  status: "draft" | "active" | "archived"
  bg_color: string
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
  cookie?: CookieItem // Joined data
}

interface ColorOption {
    id: string
    name: string
    hex: string
}

export function MonthlyCookiesAdmin() {
  const [collections, setCollections] = useState<MonthlyCollection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCollection, setEditingCollection] = useState<MonthlyCollection | null>(null)
  
  // Form State
  const [formData, setFormData] = useState<Partial<MonthlyCollection>>({
    title: "Galletas del Mes",
    subtitle: "Selección especial",
    bg_color: "#FEFCF5",
    status: "draft",
    is_active: false
  })
  
  // Items Management State
  const [selectedCookies, setSelectedCookies] = useState<CollectionItem[]>([])
  const [availableCookies, setAvailableCookies] = useState<CookieItem[]>([])
  const [cookieSearch, setCookieSearch] = useState("")

  // Global Colors
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
    const { data } = await supabase
      .from("cookies")
      .select("id, name, image_urls, price")
      .eq("is_visible", true)
    
    if (data) {
      setAvailableCookies(data.map((c: any) => ({
        id: c.id,
        name: c.name,
        price: c.price,
        image_url: Array.isArray(c.image_urls) ? c.image_urls[0] : (JSON.parse(c.image_urls as unknown as string)?.[0] || "")
      })))
    }
  }

  async function loadAvailableColors() {
      const { data } = await supabase
          .from("colors")
          .select("*")
          .order("created_at", { ascending: true })
      
      if (data) {
          setAvailableColors(data)
      }
  }

  async function loadCollectionItems(collectionId: string) {
    const { data } = await supabase
      .from("monthly_collection_items")
      .select("*, cookie:cookies(id, name, image_urls, price)")
      .eq("collection_id", collectionId)
      .order("display_order")

    if (data) {
      const formattedItems = data.map((item: any) => ({
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
          image_url: Array.isArray(item.cookie.image_urls) ? item.cookie.image_urls[0] : (JSON.parse(item.cookie.image_urls as unknown as string)?.[0] || "")
        }
      }))
      setSelectedCookies(formattedItems)
    }
  }

  const handleOpenDialog = async (collection?: MonthlyCollection) => {
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
        status: "draft",
        is_active: false
      })
      setSelectedCookies([])
    }
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
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

        // Save Items
        if (collectionId) {
            // Delete existing
            await supabase.from("monthly_collection_items").delete().eq("collection_id", collectionId)
            
            // Insert new
            if (selectedCookies.length > 0) {
                const itemsToInsert = selectedCookies.map((item, index) => ({
                    collection_id: collectionId,
                    cookie_id: item.cookie_id,
                    display_order: index,
                    is_hero: item.is_hero,
                    custom_tag: item.custom_tag
                }))
                
                const { error: itemsError } = await supabase
                    .from("monthly_collection_items")
                    .insert(itemsToInsert)
                
                if (itemsError) throw itemsError
            }
        }

        toast({ title: "Guardado", description: "La colección se ha guardado correctamente" })
        setIsDialogOpen(false)
        loadCollections()

    } catch (error) {
        console.error("Error saving:", error)
        toast({ variant: "destructive", title: "Error", description: "Ocurrió un error al guardar" })
    }
  }
  
  const toggleCookieSelection = (cookie: CookieItem) => {
    const exists = selectedCookies.find(item => item.cookie_id === cookie.id)
    if (exists) {
        setSelectedCookies(prev => prev.filter(item => item.cookie_id !== cookie.id))
    } else {
        setSelectedCookies(prev => [...prev, {
            cookie_id: cookie.id,
            display_order: prev.length,
            is_hero: false,
            cookie: cookie
        }])
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

  const toggleActiveStatus = async (collection: MonthlyCollection) => {
      // If activating, deactivate others first if we only want one active
      if (!collection.is_active) {
          await supabase
              .from("monthly_collections")
              .update({ is_active: false, status: 'archived' })
              .eq("is_active", true)
      }

      const newStatus = !collection.is_active
      await supabase
          .from("monthly_collections")
          .update({ 
               is_active: newStatus,
               status: newStatus ? 'active' : 'draft'
          })
          .eq("id", collection.id)
      
      loadCollections()
  }

  const filteredCookies = availableCookies.filter(c => 
      c.name.toLowerCase().includes(cookieSearch.toLowerCase())
  )

  if (isLoading) return <div className="p-8">Cargando...</div>

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Galletas del Mes</h2>
          <p className="text-gray-500 text-sm mt-1">Gestiona las colecciones destacadas mensuales</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="bg-[#930021]">
          <Plus className="w-4 h-4 mr-2" /> Nueva Colección
        </Button>
      </div>

      <div className="space-y-4">
        {collections.map(collection => (
            <div key={collection.id} className={`bg-white p-4 rounded-xl border ${collection.is_active ? 'border-[#930021] ring-1 ring-[#930021]/20' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center text-xs font-bold text-gray-400 bg-gray-50 uppercase shadow-sm" style={{ backgroundColor: collection.bg_color }}>
                            {collection.start_date ? format(new Date(collection.start_date), 'MMM', { locale: es }) : 'N/A'}
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">{collection.title}</h3>
                            <p className="text-sm text-gray-500">{collection.subtitle}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 mr-4">
                            <Switch 
                                checked={collection.is_active}
                                onCheckedChange={() => toggleActiveStatus(collection)}
                            />
                            <Label className="text-sm text-gray-600">{collection.is_active ? 'Activa' : 'Inactiva'}</Label>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(collection)}>
                            <Edit2 className="w-4 h-4 text-gray-500" />
                        </Button>
                    </div>
                </div>
            </div>
        ))}
        {collections.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
                <p className="text-gray-500">No hay colecciones creadas</p>
            </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle>{editingCollection ? 'Editar Colección' : 'Nueva Colección'}</DialogTitle>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Título</Label>
                        <Input 
                            value={formData.title} 
                            onChange={e => setFormData({...formData, title: e.target.value})} 
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Subtítulo</Label>
                        <Input 
                            value={formData.subtitle} 
                            onChange={e => setFormData({...formData, subtitle: e.target.value})} 
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Descripción (Opcional)</Label>
                        <Textarea 
                            value={formData.description || ''} 
                            onChange={e => setFormData({...formData, description: e.target.value})} 
                            placeholder="Texto de marketing o detalles adicionales..."
                            className="resize-none h-20"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <Label>Desde</Label>
                            <Input 
                                type="date"
                                value={formData.start_date ? new Date(formData.start_date).toISOString().split('T')[0] : ''} 
                                onChange={e => setFormData({...formData, start_date: new Date(e.target.value).toISOString()})} 
                            />
                        </div>
                         <div className="space-y-2">
                            <Label>Hasta</Label>
                            <Input 
                                type="date"
                                value={formData.end_date ? new Date(formData.end_date).toISOString().split('T')[0] : ''} 
                                onChange={e => setFormData({...formData, end_date: new Date(e.target.value).toISOString()})} 
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Color de fondo (Seleccionar de Colores Globales)</Label>
                        
                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-32 overflow-y-auto p-2 border rounded-xl bg-gray-50">
                             {availableColors.map(color => {
                                 const isSelected = formData.bg_color === color.hex
                                 return (
                                     <div 
                                        key={color.id} 
                                        className={`group relative cursor-pointer aspect-square rounded-lg transition-all ${isSelected ? 'ring-2 ring-offset-2 ring-[#930021] scale-105' : 'hover:scale-105'}`}
                                        style={{ backgroundColor: color.hex }}
                                        onClick={() => setFormData({...formData, bg_color: color.hex})}
                                        title={color.name}
                                     >
                                         {isSelected && (
                                             <div className="absolute inset-0 flex items-center justify-center">
                                                 <Check className="w-4 h-4 text-white drop-shadow-md" />
                                             </div>
                                         )}
                                     </div>
                                 )
                             })}
                             
                             <div className="col-span-full pt-2 flex gap-2 items-center">
                                <Label className="text-xs text-gray-500 whitespace-nowrap">O personalizado:</Label>
                                <div className="flex gap-2 flex-1">
                                    <div className="w-8 h-8 rounded border border-gray-200" style={{ backgroundColor: formData.bg_color }}></div>
                                    <Input 
                                        value={formData.bg_color} 
                                        onChange={e => setFormData({...formData, bg_color: e.target.value})} 
                                        className="h-8 text-xs font-mono"
                                    />
                                </div>
                             </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 border-l pl-6">
                    <h4 className="font-semibold text-sm text-gray-900">Seleccionar Galletas</h4>
                    
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                        <Input 
                            placeholder="Buscar..." 
                            className="pl-8" 
                            value={cookieSearch}
                            onChange={e => setCookieSearch(e.target.value)}
                        />
                    </div>

                    <div className="h-48 overflow-y-auto border rounded-xl p-2 space-y-1">
                        {filteredCookies.map(cookie => {
                            const isSelected = selectedCookies.some(s => s.cookie_id === cookie.id)
                            return (
                                <div 
                                    key={cookie.id}
                                    onClick={() => toggleCookieSelection(cookie)}
                                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${isSelected ? 'bg-amber-50 border-amber-200' : 'hover:bg-gray-50'}`}
                                >
                                    <div className={`w-4 h-4 border rounded flex items-center justify-center ${isSelected ? 'bg-[#930021] border-[#930021]' : 'border-gray-300'}`}>
                                        {isSelected && <Check className="w-3 h-3 text-white" />}
                                    </div>
                                    <img src={cookie.image_url || '/placeholder.svg'} className="w-8 h-8 rounded object-cover" />
                                    <span className="text-sm font-medium">{cookie.name}</span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            <div className="pt-4 border-t">
                 <h4 className="font-semibold text-sm text-gray-900 mb-4">Galletas en la colección ({selectedCookies.length})</h4>
                 <div className="space-y-2">
                     {selectedCookies.map((item, idx) => (
                         <div key={item.cookie_id} className="flex items-center gap-4 bg-gray-50 p-2 rounded-lg">
                             <span className="text-gray-400 font-mono text-xs w-6 text-center">{idx + 1}</span>
                             <img src={item.cookie?.image_url || '/placeholder.svg'} className="w-10 h-10 rounded object-cover" />
                             <div className="flex-1">
                                 <p className="font-medium text-sm">{item.cookie?.name}</p>
                             </div>
                             <Input 
                                placeholder="Badge (ej: Nuevo)" 
                                className="w-32 h-8 text-xs"
                                value={item.custom_tag || ''}
                                onChange={e => updateCustomTag(idx, e.target.value)}
                             />
                             <Button
                                size="sm"
                                variant={item.is_hero ? "default" : "outline"}
                                className={item.is_hero ? "bg-amber-500 hover:bg-amber-600 border-amber-500" : ""}
                                onClick={() => toggleHero(idx)}
                             >
                                 <Calendar className="w-3 h-3 mr-1" /> Destacar
                             </Button>
                             <Button
                                size="icon"
                                variant="ghost"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => toggleCookieSelection(item.cookie!)}
                             >
                                 <X className="w-4 h-4" />
                             </Button>
                         </div>
                     ))}
                     {selectedCookies.length === 0 && (
                         <p className="text-sm text-gray-500 text-center italic">No hay galletas seleccionadas</p>
                     )}
                 </div>
            </div>

            <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                <Button onClick={handleSave} className="bg-[#930021]">Guardar Colección</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
