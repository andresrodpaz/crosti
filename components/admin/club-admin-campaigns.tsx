"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Loader2, Megaphone, Plus, Mail, Image as ImageIcon, Type, Link as LinkIcon, Minus, MoveUp, MoveDown, Trash2, Send, Settings, Eye, Palette } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

// ── Shared HTML Generation ──────────────────────────────────────────────────
function generatePreviewHtml(blocks: any[], styleConfig: any) {
  const font = styleConfig.font || "Arial, sans-serif"
  const primaryColor = styleConfig.primaryColor || "#930021"
  const bgColor = styleConfig.bgColor || "#ffffff"
  const textColor = styleConfig.textColor || "#1f2937"

  const blockHtml = blocks.map((block: any) => {
    switch (block.type) {
      case "header":
        return `
          <tr>
            <td style="background-color: ${block.bgColor || primaryColor}; padding: ${block.padding || '32px 24px'}; text-align: ${block.align || 'center'};">
              <h1 style="color: ${block.textColor || "#ffffff"}; margin: 0; font-size: ${block.titleSize || '28px'}; font-family: ${block.font || font}; font-weight: 700;">
                ${block.title || "Club Crosti"}
              </h1>
              ${block.subtitle ? `<p style="color: ${block.textColor || "#ffffff"}; opacity: 0.85; margin: 8px 0 0; font-size: ${block.subtitleSize || '15px'};">${block.subtitle}</p>` : ""}
            </td>
          </tr>`
      case "text":
        return `
          <tr>
            <td style="background-color: ${block.bgColor || 'transparent'}; padding: ${block.padding || "24px"}; font-family: ${font}; color: ${block.textColor || textColor}; font-size: ${block.fontSize || "16px"}; line-height: 1.6; text-align: ${block.align || 'left'};">
              ${block.content?.replace(/\n/g, "<br>") || ""}
            </td>
          </tr>`
      case "image":
        if (!block.url) return `<tr><td style="padding: 16px; text-align: center; color: #9ca3af; background: #f3f4f6;">[Imagen: ${block.alt || 'Sin URL'}]</td></tr>`
        return `
          <tr>
            <td style="background-color: ${block.bgColor || 'transparent'}; padding: ${block.padding || '16px 24px'}; text-align: ${block.align || 'center'};">
              <img src="${block.url}" alt="${block.alt || ""}" style="max-width: ${block.width || "100%"}; height: auto; border-radius: ${block.borderRadius || '12px'}; display: inline-block; margin: 0 auto;" />
              ${block.caption ? `<p style="font-size: 12px; color: #9ca3af; margin: 8px 0 0; font-family: ${font}; text-align: center;">${block.caption}</p>` : ""}
            </td>
          </tr>`
      case "button":
        return `
          <tr>
            <td style="background-color: ${block.blockBgColor || 'transparent'}; padding: ${block.padding || '16px 24px'}; text-align: ${block.align || "center"};">
              <a href="${block.url || "#"}" style="background-color: ${block.bgColor || primaryColor}; color: ${block.textColor || "#ffffff"}; padding: 14px 32px; text-decoration: none; border-radius: ${block.borderRadius || '10px'}; font-weight: 700; font-size: ${block.fontSize || '16px'}; display: inline-block; font-family: ${font};">
                ${block.text || "Ver más"}
              </a>
            </td>
          </tr>`
      case "divider":
        return `
          <tr>
            <td style="background-color: ${block.bgColor || 'transparent'}; padding: ${block.padding || '16px 24px'};">
              <hr style="border: none; border-top: ${block.thickness || "1"}px ${block.style || 'solid'} ${block.color || "#e5e7eb"}; margin: 0;" />
            </td>
          </tr>`
      default:
        return ""
    }
  }).join("")

  return `
    <div style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: ${font}; width: 100%; min-height: 100%;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 32px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: ${bgColor}; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
              ${blockHtml}
              <tr>
                <td style="padding: 24px; text-align: center; font-family: ${font};">
                  <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                    Eres socio del Club Crosti. <br/>
                    <a href="#" style="color: ${primaryColor};">Gestionar preferencias</a>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  `
}

export function ClubAdminCampaigns() {
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [sendingId, setSendingId] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"editor" | "preview">("editor")
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)
  
  const supabase = createClient()

  // Form State
  const [name, setName] = useState("")
  const [subject, setSubject] = useState("")
  const [targetSegment, setTargetSegment] = useState("all")
  
  // Visual Editor State
  const [blocks, setBlocks] = useState<any[]>([
    { id: "1", type: "header", title: "Club Crosti", subtitle: "Noticias y Novedades" },
    { id: "2", type: "text", content: "¡Hola {nombre}!\n\nTenemos nuevas recompensas esperándote." },
    { id: "3", type: "button", text: "Ver mi tarjeta", url: "https://crosti.es/club" }
  ])
  const [styleConfig, setStyleConfig] = useState({
    font: "Arial, sans-serif",
    primaryColor: "#930021",
    bgColor: "#ffffff",
    textColor: "#1f2937"
  })

  useEffect(() => {
    fetchCampaigns()
  }, [])

  const fetchCampaigns = async () => {
    setLoading(true)
    const { data } = await supabase.from("club_campaigns").select("*").order("created_at", { ascending: false })
    if (data) setCampaigns(data)
    setLoading(false)
  }

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !subject) return toast.error("Rellena todos los campos obligatorios")
    
    setCreating(true)
    const messageJson = JSON.stringify({ blocks, styleConfig })

    const { data, error } = await supabase.from("club_campaigns").insert([{
      name,
      subject,
      message: messageJson,
      target_segment: targetSegment,
      type: "email",
      status: "draft"
    }]).select()

    if (error) {
      toast.error("Error al guardar campaña")
    } else if (data) {
      toast.success("Campaña guardada como borrador")
      setCampaigns([data[0], ...campaigns])
      setOpen(false)
      resetForm()
    }
    setCreating(false)
  }

  const resetForm = () => {
    setName("")
    setSubject("")
    setTargetSegment("all")
    setBlocks([
      { id: "1", type: "header", title: "Club Crosti", subtitle: "Noticias y Novedades" },
      { id: "2", type: "text", content: "¡Hola {nombre}!\n\nTenemos nuevas recompensas esperándote." },
      { id: "3", type: "button", text: "Ver mi tarjeta", url: "https://crosti.es/club" }
    ])
    setSelectedBlockId(null)
    setActiveTab("editor")
  }

  const handleSend = async (campaignId: string) => {
    if (!confirm("¿Seguro que quieres enviar esta campaña ahora a TODOS los destinatarios del segmento?")) return
    setSendingId(campaignId)
    try {
      const res = await fetch("/api/club/campaigns/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success(`Campaña enviada a ${data.sentCount} destinatarios`)
      fetchCampaigns()
    } catch (err: any) {
      toast.error(err.message || "Error al enviar")
    }
    setSendingId(null)
  }

  const handleTestEmail = async () => {
    const email = prompt("Introduce un email para enviar la prueba:")
    if (!email) return
    try {
      const res = await fetch("/api/admin/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: email })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success("Email de prueba enviado")
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const handleDelete = async (campaignId: string) => {
    if (!confirm("¿Eliminar esta campaña?")) return
    const { error } = await supabase.from("club_campaigns").delete().eq("id", campaignId)
    if (error) toast.error("Error al eliminar")
    else {
      toast.success("Campaña eliminada")
      setCampaigns(campaigns.filter(c => c.id !== campaignId))
    }
  }

  // Block management
  const addBlock = (type: string) => {
    const id = Date.now().toString()
    let newBlock: any = { id, type }
    if (type === "header") newBlock = { ...newBlock, title: "Nuevo Header", subtitle: "", align: "center" }
    if (type === "text") newBlock = { ...newBlock, content: "Escribe tu texto aquí...", align: "left" }
    if (type === "image") newBlock = { ...newBlock, url: "", alt: "", align: "center", width: "100%", borderRadius: "12px" }
    if (type === "button") newBlock = { ...newBlock, text: "Botón", url: "https://", align: "center", borderRadius: "10px" }
    if (type === "divider") newBlock = { ...newBlock, color: "#e5e7eb", thickness: 1, style: "solid" }
    
    setBlocks([...blocks, newBlock])
    setSelectedBlockId(id)
  }

  const updateBlock = (id: string, updates: any) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, ...updates } : b))
  }

  const removeBlock = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setBlocks(blocks.filter(b => b.id !== id))
    if (selectedBlockId === id) setSelectedBlockId(null)
  }

  const moveBlock = (index: number, dir: number, e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (index + dir < 0 || index + dir >= blocks.length) return
    const newBlocks = [...blocks]
    const temp = newBlocks[index]
    newBlocks[index] = newBlocks[index + dir]
    newBlocks[index + dir] = temp
    setBlocks(newBlocks)
  }

  const selectedBlock = blocks.find(b => b.id === selectedBlockId)

  if (loading) return <div className="p-12 flex justify-center"><Loader2 className="animate-spin w-6 h-6 text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-lg font-medium">Gestor de Campañas</h2>
          <p className="text-sm text-gray-500">Envía correos personalizados a tus socios con el editor visual.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleTestEmail}>
            <Send className="w-4 h-4 mr-2" />
            Probar Envío
          </Button>
          <Dialog open={open} onOpenChange={(val) => { setOpen(val); if(val) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="bg-[#930021] hover:bg-[#7a001a] text-white">
                <Plus className="w-4 h-4 mr-2" />
                Nueva Campaña
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-[95vw] w-full h-[95vh] flex flex-col p-0">
              <DialogHeader className="p-4 border-b shrink-0 flex flex-row items-center justify-between">
                <DialogTitle>Diseñador de Campaña Avanzado</DialogTitle>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                  <button 
                    onClick={() => setActiveTab("editor")} 
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'editor' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
                  >
                    <Settings className="w-4 h-4 inline mr-2"/>Editor
                  </button>
                  <button 
                    onClick={() => setActiveTab("preview")} 
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'preview' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
                  >
                    <Eye className="w-4 h-4 inline mr-2"/>Vista Previa Live
                  </button>
                </div>
              </DialogHeader>

              {activeTab === "editor" ? (
                <div className="flex-1 overflow-hidden flex flex-col md:flex-row bg-gray-50">
                  
                  {/* PANEL 1: Estructura y Bloques */}
                  <div className="w-[300px] border-r bg-white flex flex-col overflow-y-auto">
                    <div className="p-4 border-b space-y-4">
                      <h3 className="font-semibold text-sm flex items-center"><Megaphone className="w-4 h-4 mr-2"/> Configuración General</h3>
                      <div className="space-y-3">
                        <div>
                          <Label className="text-xs text-gray-500">Nombre interno</Label>
                          <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Promo Verano" className="h-8 text-sm" />
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Asunto del Email</Label>
                          <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="¡Tienes un regalo!" className="h-8 text-sm" />
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Destinatarios</Label>
                          <select className="flex h-8 w-full rounded-md border border-input bg-white px-3 py-1 text-xs" value={targetSegment} onChange={e => setTargetSegment(e.target.value)}>
                            <option value="all">Todos los socios</option>
                            <option value="active">Activos (visita en 30 días)</option>
                            <option value="inactive">Inactivos (sin visita &gt;30 días)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 border-b space-y-4">
                      <h3 className="font-semibold text-sm flex items-center"><Palette className="w-4 h-4 mr-2"/> Estilo Global</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Color Principal</Label>
                          <div className="flex items-center gap-2">
                            <input type="color" value={styleConfig.primaryColor} onChange={e => setStyleConfig({...styleConfig, primaryColor: e.target.value})} className="w-6 h-6 rounded cursor-pointer" />
                            <span className="text-xs font-mono text-gray-500">{styleConfig.primaryColor}</span>
                          </div>
                        </div>
                        <div>
                          <Label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Fondo Email</Label>
                          <div className="flex items-center gap-2">
                            <input type="color" value={styleConfig.bgColor} onChange={e => setStyleConfig({...styleConfig, bgColor: e.target.value})} className="w-6 h-6 rounded cursor-pointer" />
                            <span className="text-xs font-mono text-gray-500">{styleConfig.bgColor}</span>
                          </div>
                        </div>
                        <div className="col-span-2">
                          <Label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Fuente</Label>
                          <select className="flex h-8 w-full rounded-md border border-input bg-white px-2 py-1 text-xs" value={styleConfig.font} onChange={e => setStyleConfig({...styleConfig, font: e.target.value})}>
                            <option value="Arial, sans-serif">Arial</option>
                            <option value="'Helvetica Neue', Helvetica, sans-serif">Helvetica</option>
                            <option value="Georgia, serif">Georgia</option>
                            <option value="'Times New Roman', Times, serif">Times New Roman</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 flex-1 overflow-y-auto">
                      <h3 className="font-semibold text-sm mb-3">Añadir Bloques</h3>
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" size="sm" onClick={() => addBlock("header")} className="justify-start h-9"><Type className="w-4 h-4 mr-2"/>Header</Button>
                        <Button variant="outline" size="sm" onClick={() => addBlock("text")} className="justify-start h-9"><Type className="w-4 h-4 mr-2"/>Texto</Button>
                        <Button variant="outline" size="sm" onClick={() => addBlock("image")} className="justify-start h-9"><ImageIcon className="w-4 h-4 mr-2"/>Imagen</Button>
                        <Button variant="outline" size="sm" onClick={() => addBlock("button")} className="justify-start h-9"><LinkIcon className="w-4 h-4 mr-2"/>Botón</Button>
                        <Button variant="outline" size="sm" onClick={() => addBlock("divider")} className="justify-start h-9 col-span-2"><Minus className="w-4 h-4 mr-2"/>Separador</Button>
                      </div>
                    </div>
                  </div>

                  {/* PANEL 2: Lienzo / Estructura Visual */}
                  <div className="flex-1 bg-gray-100 overflow-y-auto p-4 md:p-8 flex justify-center border-r">
                    <div className="w-full max-w-[600px] space-y-3">
                      {blocks.map((block, index) => (
                        <div 
                          key={block.id} 
                          onClick={() => setSelectedBlockId(block.id)}
                          className={`relative group bg-white border-2 rounded-xl shadow-sm overflow-hidden cursor-pointer transition-all ${selectedBlockId === block.id ? 'border-[#930021] ring-2 ring-[#930021]/20' : 'border-transparent hover:border-gray-300'}`}
                        >
                          <div className="absolute top-2 right-2 flex bg-white rounded-lg shadow-md border opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <button onClick={(e) => moveBlock(index, -1, e)} disabled={index === 0} className="p-1.5 hover:bg-gray-100 disabled:opacity-30"><MoveUp className="w-4 h-4" /></button>
                            <button onClick={(e) => moveBlock(index, 1, e)} disabled={index === blocks.length - 1} className="p-1.5 hover:bg-gray-100 disabled:opacity-30"><MoveDown className="w-4 h-4" /></button>
                            <button onClick={(e) => removeBlock(block.id, e)} className="p-1.5 hover:bg-red-50 text-red-500"><Trash2 className="w-4 h-4" /></button>
                          </div>
                          
                          <div className="p-2 bg-gray-50 border-b text-[10px] text-gray-500 font-bold uppercase tracking-wider flex justify-between">
                            {block.type}
                          </div>
                          <div className="p-4 pointer-events-none opacity-80" dangerouslySetInnerHTML={{ __html: generatePreviewHtml([block], styleConfig).match(/<table width="600"[^>]*>([\s\S]*?)<tr>\s*<td style="padding: 24px;/)?.[1] || "Vista previa no disponible" }} />
                        </div>
                      ))}
                      {blocks.length === 0 && (
                        <div className="text-center p-12 bg-white rounded-xl border-2 border-dashed border-gray-300 text-gray-500">
                          Añade bloques desde el panel izquierdo.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* PANEL 3: Inspector de Propiedades */}
                  <div className="w-[350px] bg-white border-l flex flex-col overflow-y-auto">
                    <div className="p-4 border-b bg-gray-50">
                      <h3 className="font-semibold text-sm">Propiedades del Bloque</h3>
                    </div>
                    <div className="p-4 space-y-4">
                      {!selectedBlock ? (
                        <p className="text-sm text-gray-400 text-center py-8">Selecciona un bloque para editar sus propiedades.</p>
                      ) : (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                          
                          {/* Propiedades Comunes a casi todos */}
                          {['header', 'text', 'image', 'button', 'divider'].includes(selectedBlock.type) && (
                            <div className="grid grid-cols-2 gap-3 pb-4 border-b">
                              {selectedBlock.type !== 'divider' && (
                                <div>
                                  <Label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Alineación</Label>
                                  <select className="h-8 w-full rounded border text-xs px-2" value={selectedBlock.align || "center"} onChange={e => updateBlock(selectedBlock.id, { align: e.target.value })}>
                                    <option value="left">Izquierda</option>
                                    <option value="center">Centro</option>
                                    <option value="right">Derecha</option>
                                  </select>
                                </div>
                              )}
                              <div>
                                <Label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Color Fondo</Label>
                                <input type="color" value={selectedBlock.bgColor || (selectedBlock.type === 'header' ? styleConfig.primaryColor : "transparent")} onChange={e => updateBlock(selectedBlock.id, { bgColor: e.target.value })} className="w-full h-8 rounded border" />
                              </div>
                            </div>
                          )}

                          {/* HEADER */}
                          {selectedBlock.type === "header" && (
                            <>
                              <div>
                                <Label className="text-xs">Título</Label>
                                <Input value={selectedBlock.title || ""} onChange={e => updateBlock(selectedBlock.id, { title: e.target.value })} className="mt-1" />
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <Label className="text-xs">Tamaño</Label>
                                  <Input value={selectedBlock.titleSize || "28px"} onChange={e => updateBlock(selectedBlock.id, { titleSize: e.target.value })} className="mt-1" placeholder="Ej: 28px" />
                                </div>
                                <div>
                                  <Label className="text-xs">Color Texto</Label>
                                  <input type="color" value={selectedBlock.textColor || "#ffffff"} onChange={e => updateBlock(selectedBlock.id, { textColor: e.target.value })} className="w-full h-10 rounded border mt-1" />
                                </div>
                              </div>
                              <div>
                                <Label className="text-xs">Subtítulo</Label>
                                <Input value={selectedBlock.subtitle || ""} onChange={e => updateBlock(selectedBlock.id, { subtitle: e.target.value })} className="mt-1" />
                              </div>
                            </>
                          )}

                          {/* TEXT */}
                          {selectedBlock.type === "text" && (
                            <>
                              <div>
                                <Label className="text-xs">Contenido</Label>
                                <Textarea value={selectedBlock.content || ""} onChange={e => updateBlock(selectedBlock.id, { content: e.target.value })} className="mt-1 min-h-[150px]" />
                                <p className="text-[10px] text-gray-400 mt-1">Usa {`{nombre}`} para personalizar.</p>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <Label className="text-xs">Tamaño Letra</Label>
                                  <Input value={selectedBlock.fontSize || "16px"} onChange={e => updateBlock(selectedBlock.id, { fontSize: e.target.value })} className="mt-1" />
                                </div>
                                <div>
                                  <Label className="text-xs">Color Letra</Label>
                                  <input type="color" value={selectedBlock.textColor || styleConfig.textColor} onChange={e => updateBlock(selectedBlock.id, { textColor: e.target.value })} className="w-full h-10 rounded border mt-1" />
                                </div>
                              </div>
                            </>
                          )}

                          {/* IMAGE */}
                          {selectedBlock.type === "image" && (
                            <>
                              <div>
                                <Label className="text-xs">URL de la Imagen</Label>
                                <Input value={selectedBlock.url || ""} onChange={e => updateBlock(selectedBlock.id, { url: e.target.value })} className="mt-1" placeholder="https://..." />
                              </div>
                              <div>
                                <Label className="text-xs">Ancho Máximo</Label>
                                <Input value={selectedBlock.width || "100%"} onChange={e => updateBlock(selectedBlock.id, { width: e.target.value })} className="mt-1" placeholder="Ej: 300px o 100%" />
                              </div>
                              <div>
                                <Label className="text-xs">Bordes redondeados</Label>
                                <Input value={selectedBlock.borderRadius || "12px"} onChange={e => updateBlock(selectedBlock.id, { borderRadius: e.target.value })} className="mt-1" placeholder="Ej: 12px" />
                              </div>
                              <div>
                                <Label className="text-xs">Texto alternativo (Alt)</Label>
                                <Input value={selectedBlock.alt || ""} onChange={e => updateBlock(selectedBlock.id, { alt: e.target.value })} className="mt-1" />
                              </div>
                            </>
                          )}

                          {/* BUTTON */}
                          {selectedBlock.type === "button" && (
                            <>
                              <div>
                                <Label className="text-xs">Texto del Botón</Label>
                                <Input value={selectedBlock.text || ""} onChange={e => updateBlock(selectedBlock.id, { text: e.target.value })} className="mt-1" />
                              </div>
                              <div>
                                <Label className="text-xs">URL Destino</Label>
                                <Input value={selectedBlock.url || ""} onChange={e => updateBlock(selectedBlock.id, { url: e.target.value })} className="mt-1" />
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <Label className="text-xs">Color Botón</Label>
                                  <input type="color" value={selectedBlock.bgColor || styleConfig.primaryColor} onChange={e => updateBlock(selectedBlock.id, { bgColor: e.target.value })} className="w-full h-10 rounded border mt-1" />
                                </div>
                                <div>
                                  <Label className="text-xs">Color Texto</Label>
                                  <input type="color" value={selectedBlock.textColor || "#ffffff"} onChange={e => updateBlock(selectedBlock.id, { textColor: e.target.value })} className="w-full h-10 rounded border mt-1" />
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <Label className="text-xs">Bordes (Radius)</Label>
                                  <Input value={selectedBlock.borderRadius || "10px"} onChange={e => updateBlock(selectedBlock.id, { borderRadius: e.target.value })} className="mt-1" />
                                </div>
                                <div>
                                  <Label className="text-xs">Tamaño Letra</Label>
                                  <Input value={selectedBlock.fontSize || "16px"} onChange={e => updateBlock(selectedBlock.id, { fontSize: e.target.value })} className="mt-1" />
                                </div>
                              </div>
                            </>
                          )}

                          {/* DIVIDER */}
                          {selectedBlock.type === "divider" && (
                            <>
                              <div>
                                <Label className="text-xs">Color de Línea</Label>
                                <input type="color" value={selectedBlock.color || "#e5e7eb"} onChange={e => updateBlock(selectedBlock.id, { color: e.target.value })} className="w-full h-10 rounded border mt-1" />
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <Label className="text-xs">Grosor (px)</Label>
                                  <Input type="number" value={selectedBlock.thickness || 1} onChange={e => updateBlock(selectedBlock.id, { thickness: e.target.value })} className="mt-1" />
                                </div>
                                <div>
                                  <Label className="text-xs">Estilo</Label>
                                  <select className="h-10 w-full rounded border mt-1 px-2" value={selectedBlock.style || "solid"} onChange={e => updateBlock(selectedBlock.id, { style: e.target.value })}>
                                    <option value="solid">Sólido</option>
                                    <option value="dashed">Discontinuo</option>
                                    <option value="dotted">Puntos</option>
                                  </select>
                                </div>
                              </div>
                            </>
                          )}

                          <div>
                            <Label className="text-xs text-gray-500">Padding (Márgenes int.)</Label>
                            <Input value={selectedBlock.padding || ""} onChange={e => updateBlock(selectedBlock.id, { padding: e.target.value })} className="mt-1" placeholder="Ej: 16px 24px" />
                          </div>

                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* LIVE PREVIEW TAB */
                <div className="flex-1 overflow-auto bg-[#e5e5e5] p-8 flex justify-center">
                  <div className="bg-white rounded-xl shadow-2xl w-full max-w-[800px] overflow-hidden flex flex-col">
                    <div className="bg-gray-100 p-3 border-b flex gap-2 items-center text-xs text-gray-500 font-medium">
                      <div className="flex gap-1.5 mr-2">
                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                      </div>
                      <span className="truncate">{subject || "Sin asunto"}</span>
                    </div>
                    <div className="flex-1 bg-white p-0">
                      {/* Generamos el HTML completo y lo incrustamos de forma segura */}
                      <iframe 
                        srcDoc={generatePreviewHtml(blocks, styleConfig)}
                        title="Live Email Preview"
                        className="w-full h-full min-h-[600px] border-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="p-4 border-t flex justify-between items-center bg-white shrink-0">
                <div className="text-sm text-gray-500 font-medium">
                  {blocks.length} bloques añadidos
                </div>
                <div className="flex gap-3">
                  <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
                  <Button onClick={handleCreateCampaign} disabled={creating} className="bg-[#930021] hover:bg-[#7a001a] text-white">
                    {creating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Guardar Borrador
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.length === 0 && (
          <div className="col-span-full py-12 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <Megaphone className="w-8 h-8 text-gray-400 mx-auto mb-3" />
            <h3 className="text-gray-900 font-medium">Aún no hay campañas</h3>
            <p className="text-sm text-gray-500">Crea tu primera campaña para comunicarte con los socios.</p>
          </div>
        )}

        {campaigns.map(c => (
          <div key={c.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 flex-1">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div className="flex gap-2">
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${c.status === 'sent' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                    {c.status === 'sent' ? 'Enviada' : 'Borrador'}
                  </span>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{c.name}</h3>
              <p className="text-xs text-gray-400 mb-2 font-medium">Asunto: {c.subject || 'Sin asunto'}</p>
              
              <div className="flex flex-col mt-4 pt-4 border-t border-gray-50 gap-3">
                {c.status === 'draft' ? (
                  <Button 
                    size="sm" 
                    className="w-full bg-gray-900 text-white hover:bg-gray-800"
                    onClick={() => handleSend(c.id)}
                    disabled={sendingId === c.id}
                  >
                    {sendingId === c.id ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Mail className="w-4 h-4 mr-2" />}
                    Enviar Ahora
                  </Button>
                ) : (
                  <div className="w-full flex justify-between items-center text-xs text-gray-500 font-medium bg-gray-50 px-3 py-2 rounded-lg">
                    <span>Alcance: {c.reach_count || 0}</span>
                    <span>Enviados: {c.sent_count || 0}</span>
                  </div>
                )}
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full text-red-500 hover:text-red-700 hover:bg-red-50 h-8"
                  onClick={() => handleDelete(c.id)}
                >
                  Eliminar campaña
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
