"use client"
import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"
import { DigitalCardPreview } from "@/components/club/digital-card-preview"
import { ClubAdminDashboard } from "@/components/admin/club-admin-dashboard"
import { ClubAdminCustomers } from "@/components/admin/club-admin-customers"
import { ClubAdminCampaigns } from "@/components/admin/club-admin-campaigns"
import { ClubAdminRewards } from "@/components/admin/club-admin-rewards"
import { QrScanner } from "@/components/admin/qr-scanner"
import QRCode from "react-qr-code"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import {
  Loader2, Download, Save, QrCode, Bike, Store, History,
  ScanLine, Keyboard, CheckCircle2, XCircle, User
} from "lucide-react"

export function ClubAdmin() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [config, setConfig] = useState<any>(null)
  const [rewards, setRewards] = useState<any[]>([])
  const [redeeming, setRedeeming] = useState<string | null>(null)

  // Stamp tab state
  const [stampOrigin, setStampOrigin] = useState<"counter" | "delivery">("counter")
  const [stampPlatform, setStampPlatform] = useState("glovo")
  const [stampInput, setStampInput] = useState("")
  const [stampOrderId, setStampOrderId] = useState("")
  const [stampAmount, setStampAmount] = useState<number>(1)
  const [stamping, setStamping] = useState(false)
  const [scanMode, setScanMode] = useState<"scanner" | "manual">("scanner")
  const [scannedCustomer, setScannedCustomer] = useState<{
    id: string; name: string; email: string; stampCount: number
  } | null>(null)
  const [lookingUp, setLookingUp] = useState(false)

  const supabase = createClient()

  useEffect(() => { fetchConfig() }, [])

  const fetchConfig = async () => {
    setLoading(true)
    
    // Fetch rewards
    const { data: rw } = await supabase.from("club_rewards").select("*").eq("is_active", true).order("points_cost", { ascending: true })
    if (rw) setRewards(rw)

    // Fetch config
    const { data, error } = await supabase.from("club_card_config").select("*").single()
    if (error && error.code !== "PGRST116") {
      toast.error("Error cargando configuración")
    } else if (data) {
      setConfig(data)
    } else {
      setConfig({
        primary_color: "#7C4A1E",
        accent_color: "#F5D89C",
        text_color: "#ffffff",
        font: "Inter",
        stamp_total: 10,
        reward_description: "Tu cookie gratis",
        notif_stamp: true,
        notif_reward: true,
        notif_geo: true,
        geo_alert_radius: 200,
        birthday_reminder_days: 1,
        win_back_days: 30,
      })
    }
    setLoading(false)
  }

  const saveConfig = async () => {
    setSaving(true)
    const { data: existing } = await supabase.from("club_card_config").select("id").single()
    if (existing) {
      const { error } = await supabase.from("club_card_config").update(config).eq("id", existing.id)
      if (error) toast.error("Error al guardar")
      else toast.success("Diseño guardado correctamente")
    } else {
      const { error } = await supabase.from("club_card_config").insert([config])
      if (error) toast.error("Error al guardar")
      else toast.success("Diseño guardado correctamente")
    }
    setSaving(false)
  }

  // Called by QrScanner when a code is detected
  const handleQrDetected = async (raw: string) => {
    if (lookingUp || scannedCustomer) return
    const cardNumber = raw.trim()
    setStampInput(cardNumber)
    setLookingUp(true)
    try {
      const { data } = await supabase
        .from("club_customers")
        .select("id, name, email, stamp_count")
        .eq("card_number", cardNumber)
        .single()
      if (data) {
        setScannedCustomer({ id: data.id, name: data.name || data.email, email: data.email, stampCount: data.stamp_count })
      } else {
        toast.error("Tarjeta no encontrada en el Club")
        setStampInput("")
      }
    } catch {
      toast.error("Error buscando cliente")
    }
    setLookingUp(false)
  }

  const handleGiveStamp = async (e: React.FormEvent) => {
    e.preventDefault()
    const identifier = stampInput.trim()
    if (!identifier) return toast.error("Identifica al cliente primero")
    setStamping(true)
    try {
      const isCardNumber = identifier.toUpperCase().startsWith("CC-")
      const body: Record<string, any> = {
        amount: stampAmount,
        origin: stampOrigin,
        platform: stampOrigin === "delivery" ? stampPlatform : undefined,
        orderId: stampOrigin === "delivery" ? stampOrderId : undefined,
      }
      if (isCardNumber) body.cardNumber = identifier.toUpperCase()
      else body.email = identifier

      const res = await fetch("/api/club/stamps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Error al dar sello")

      const name = data.customerName || scannedCustomer?.name || "El cliente"
      if (data.rewardUnlocked) {
        toast.success(`🎉 ¡${name} ha completado su tarjeta! Premio desbloqueado.`)
      } else {
        toast.success(`✅ ${stampAmount} sello${stampAmount > 1 ? "s" : ""} añadido${stampAmount > 1 ? "s" : ""} a ${name}`)
      }
      setStampInput("")
      setScannedCustomer(null)
      setStampOrderId("")
    } catch (err: any) {
      toast.error(err.message)
    }
    setStamping(false)
  }

  const handleRedeem = async (rewardId: string, cost: number, name: string) => {
    if (!scannedCustomer || !scannedCustomer.id) return
    if (!confirm(`¿Canjear ${name} por ${cost} puntos?`)) return
    
    setRedeeming(rewardId)
    try {
      const res = await fetch("/api/club/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: scannedCustomer.id, rewardId })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      
      toast.success(`🎉 ${name} canjeado correctamente.`)
      setScannedCustomer({ ...scannedCustomer, stampCount: data.newStampCount })
    } catch (err: any) {
      toast.error(err.message || "Error al canjear")
    }
    setRedeeming(null)
  }

  if (loading) return (
    <div className="p-8 flex justify-center">
      <Loader2 className="animate-spin w-6 h-6 text-gray-400" />
    </div>
  )

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Club Crosti</h1>
        <p className="text-gray-500 mt-1">
          Gestiona los socios, campañas y configuración del club de fidelización.
        </p>
      </div>

      <Tabs defaultValue="sello" className="w-full">
        <TabsList className="mb-8 bg-white border border-gray-100 p-1 rounded-xl shadow-sm">
          <TabsTrigger value="resumen" className="rounded-lg">Resumen</TabsTrigger>
          <TabsTrigger value="socios" className="rounded-lg">Socios</TabsTrigger>
          <TabsTrigger value="campanas" className="rounded-lg">Campañas</TabsTrigger>
          <TabsTrigger value="premios" className="rounded-lg">Premios</TabsTrigger>
          <TabsTrigger value="tarjeta" className="rounded-lg">Tarjeta</TabsTrigger>
          <TabsTrigger value="sello" className="rounded-lg">Escanear / Sello</TabsTrigger>
          <TabsTrigger value="notificaciones" className="rounded-lg">Configuración</TabsTrigger>
        </TabsList>

        {/* ── TAB TARJETA ─────────────────────────────────────────── */}
        <TabsContent value="tarjeta">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm space-y-6">
              <h2 className="text-lg font-medium border-b pb-4">Personalización Visual</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Color de Fondo</Label>
                    <div className="flex gap-2 mt-1.5">
                      <Input type="color" value={config.primary_color} onChange={(e) => setConfig({ ...config, primary_color: e.target.value })} className="w-12 h-10 p-1" />
                      <Input type="text" value={config.primary_color} onChange={(e) => setConfig({ ...config, primary_color: e.target.value })} className="flex-1" />
                    </div>
                  </div>
                  <div>
                    <Label>Color de Acento</Label>
                    <div className="flex gap-2 mt-1.5">
                      <Input type="color" value={config.accent_color} onChange={(e) => setConfig({ ...config, accent_color: e.target.value })} className="w-12 h-10 p-1" />
                      <Input type="text" value={config.accent_color} onChange={(e) => setConfig({ ...config, accent_color: e.target.value })} className="flex-1" />
                    </div>
                  </div>
                </div>
                <div>
                  <Label>Color de Texto</Label>
                  <div className="flex gap-2 mt-1.5">
                    <Input type="color" value={config.text_color} onChange={(e) => setConfig({ ...config, text_color: e.target.value })} className="w-12 h-10 p-1" />
                    <Input type="text" value={config.text_color} onChange={(e) => setConfig({ ...config, text_color: e.target.value })} className="flex-1" />
                  </div>
                </div>
                <div>
                  <Label>Sellos Necesarios</Label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1.5" value={config.stamp_total} onChange={(e) => setConfig({ ...config, stamp_total: Number(e.target.value) })}>
                    <option value={6}>6 sellos</option>
                    <option value={8}>8 sellos</option>
                    <option value={10}>10 sellos</option>
                    <option value={12}>12 sellos</option>
                  </select>
                </div>
                <div>
                  <Label>Descripción del Premio</Label>
                  <Input value={config.reward_description} onChange={(e) => setConfig({ ...config, reward_description: e.target.value })} className="mt-1.5" />
                </div>
                <div>
                  <Label>Logo de la Tarjeta (URL)</Label>
                  <Input placeholder="https://..." value={config.logo_url || ""} onChange={(e) => setConfig({ ...config, logo_url: e.target.value })} className="mt-1.5" />
                  <p className="text-xs text-gray-400 mt-1">Recomendado: PNG con fondo transparente, max 200x50px</p>
                </div>
              </div>
              <div className="pt-4 border-t flex justify-end">
                <Button onClick={saveConfig} disabled={saving} className="bg-[#930021] hover:bg-[#7a001a] text-white">
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Guardar Diseño
                </Button>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center p-8 bg-gray-100 rounded-xl border border-dashed border-gray-300">
              <p className="text-sm text-gray-500 mb-6 uppercase tracking-wider font-semibold">Previsualización en vivo</p>
              <DigitalCardPreview config={{
                primaryColor: config.primary_color,
                accentColor: config.accent_color,
                textColor: config.text_color,
                font: config.font,
                stampTotal: config.stamp_total,
                rewardDescription: config.reward_description,
                logoUrl: config.logo_url,
              }} />
            </div>
          </div>
        </TabsContent>

        {/* ── TAB DAR SELLO ────────────────────────────────────────── */}
        <TabsContent value="sello">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

            {/* Panel izquierdo: QR de registro del club */}
            <div className="lg:col-span-2 bg-white rounded-xl p-8 border border-gray-100 shadow-sm flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
                <QrCode className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-semibold mb-2">QR del Club</h2>
              <p className="text-sm text-gray-500 mb-8 max-w-xs">
                Coloca este QR en tu mostrador. Los clientes lo escanean para registrarse en el Club Crosti.
              </p>
              <div className="bg-white p-4 rounded-xl border shadow-sm mb-6">
                <QRCode value="https://crosti.es/club" size={160} />
              </div>
              <p className="font-medium text-gray-800 mb-6">crosti.es/club</p>
              <div className="flex gap-3 w-full">
                <Button variant="outline" className="flex-1"><Download className="w-4 h-4 mr-2" />PNG</Button>
                <Button variant="outline" className="flex-1"><Download className="w-4 h-4 mr-2" />PDF</Button>
              </div>
            </div>

            {/* Panel derecho: dar sello */}
            <div className="lg:col-span-3 bg-white rounded-xl p-8 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-medium flex items-center">
                  <ScanLine className="w-5 h-5 mr-2 text-gray-400" />
                  Operaciones del Cliente
                </h2>
                {/* Toggle scanner / manual */}
                <div className="flex p-1 bg-gray-100 rounded-lg">
                  <button
                    type="button"
                    onClick={() => { setScanMode("scanner"); setStampInput(""); setScannedCustomer(null) }}
                    className={`flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-all ${scanMode === "scanner" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
                  >
                    <ScanLine className="w-4 h-4 mr-1.5" />Escanear QR
                  </button>
                  <button
                    type="button"
                    onClick={() => { setScanMode("manual"); setStampInput(""); setScannedCustomer(null) }}
                    className={`flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-all ${scanMode === "manual" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
                  >
                    <Keyboard className="w-4 h-4 mr-1.5" />Manual
                  </button>
                </div>
              </div>

              <form onSubmit={handleGiveStamp} className="space-y-5">
                {/* Mostrador / Delivery */}
                <div className="flex p-1 bg-gray-100 rounded-lg">
                  <button type="button" onClick={() => setStampOrigin("counter")}
                    className={`flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-md transition-all ${stampOrigin === "counter" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}>
                    <Store className="w-4 h-4 mr-2" />Mostrador
                  </button>
                  <button type="button" onClick={() => setStampOrigin("delivery")}
                    className={`flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-md transition-all ${stampOrigin === "delivery" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}>
                    <Bike className="w-4 h-4 mr-2" />Delivery
                  </button>
                </div>

                {stampOrigin === "delivery" && (
                  <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div>
                      <Label>Plataforma</Label>
                      <select className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm mt-1.5" value={stampPlatform} onChange={(e) => setStampPlatform(e.target.value)}>
                        <option value="glovo">Glovo</option>
                        <option value="ubereats">Uber Eats</option>
                        <option value="justeat">Just Eat</option>
                        <option value="other">Otra</option>
                      </select>
                    </div>
                    <div>
                      <Label>ID del Pedido</Label>
                      <Input placeholder="Ej: GLV-84921" value={stampOrderId} onChange={(e) => setStampOrderId(e.target.value)} className="bg-white mt-1.5" required />
                      <p className="text-[10px] text-gray-400 mt-1">Evita sellos duplicados</p>
                    </div>
                  </div>
                )}

                {/* Identificación del cliente */}
                <div>
                  <Label className="mb-2 block">
                    {scanMode === "scanner" ? "Escanea la tarjeta del cliente" : "Email o Nº de Tarjeta"}
                  </Label>

                  {scanMode === "scanner" ? (
                    <div className="space-y-3">
                      {!scannedCustomer && (
                        <QrScanner onDetected={handleQrDetected} active={!scannedCustomer && !lookingUp} />
                      )}
                      {lookingUp && (
                        <div className="flex items-center justify-center gap-2 py-6 text-gray-500 text-sm bg-gray-50 rounded-xl border">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Buscando cliente...
                        </div>
                      )}
                      {scannedCustomer && (
                        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                          <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900">{scannedCustomer.name}</p>
                            <p className="text-xs text-gray-500">{scannedCustomer.email} · {scannedCustomer.stampCount} sellos actuales</p>
                          </div>
                          <button type="button" onClick={() => { setScannedCustomer(null); setStampInput("") }}>
                            <XCircle className="w-5 h-5 text-gray-400 hover:text-red-500 transition-colors" />
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Input
                        placeholder="cliente@email.com  ó  CC-00004821"
                        value={stampInput}
                        onChange={(e) => { setStampInput(e.target.value); setScannedCustomer(null) }}
                        className="mt-1"
                      />
                      {stampInput.toUpperCase().startsWith("CC-") && (
                        <p className="text-xs text-blue-600 flex items-center gap-1">
                          <User className="w-3 h-3" /> Se buscará por número de tarjeta
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Cantidad */}
                <div>
                  <Label>Cantidad de Sellos</Label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1.5" value={stampAmount} onChange={(e) => setStampAmount(Number(e.target.value))}>
                    <option value={1}>1 sello</option>
                    <option value={2}>2 sellos</option>
                    <option value={3}>3 sellos</option>
                  </select>
                </div>

                <Button
                  type="submit"
                  disabled={stamping || (scanMode === "scanner" ? !scannedCustomer : !stampInput.trim())}
                  className="w-full bg-[#930021] hover:bg-[#7a001a] text-white py-6 text-lg disabled:opacity-40"
                >
                  {stamping && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
                  {stamping ? "Registrando..." : `Dar ${stampAmount} ${stampAmount === 1 ? "Punto" : "Puntos"}`}
                </Button>
              </form>

              {/* Interfaz de Canjes (Solo visible cuando hay un cliente escaneado y premios disponibles) */}
              {scannedCustomer && rewards.length > 0 && (
                <div className="mt-10 pt-8 border-t border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                    Canjear Premios
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {rewards.map(reward => {
                      const canAfford = scannedCustomer.stampCount >= reward.points_cost
                      return (
                        <div key={reward.id} className={`p-4 rounded-xl border ${canAfford ? 'border-[#930021]/30 bg-white shadow-sm' : 'border-gray-100 bg-gray-50 opacity-60'}`}>
                          <div className="flex justify-between items-start mb-3">
                            <span className="font-semibold text-gray-900">{reward.name}</span>
                            <span className="bg-[#F5D89C]/30 text-[#7C4A1E] px-2 py-0.5 rounded text-xs font-bold">
                              {reward.points_cost} pts
                            </span>
                          </div>
                          <Button 
                            onClick={() => handleRedeem(reward.id, reward.points_cost, reward.name)}
                            disabled={!canAfford || redeeming === reward.id}
                            className={`w-full ${canAfford ? 'bg-black text-white hover:bg-gray-800' : 'bg-gray-200 text-gray-500'}`}
                            size="sm"
                          >
                            {redeeming === reward.id ? <Loader2 className="w-4 h-4 animate-spin" /> : (canAfford ? "Canjear ahora" : "Puntos insuficientes")}
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* ── TAB NOTIFICACIONES ───────────────────────────────────── */}
        <TabsContent value="notificaciones">
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm max-w-2xl">
            <h2 className="text-lg font-medium mb-6">Notificaciones y Reglas</h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Confirmación de sello</Label>
                  <p className="text-sm text-gray-500">El cliente recibe email cada vez que le das un sello.</p>
                </div>
                <Switch checked={config.notif_stamp} onCheckedChange={(v) => setConfig({ ...config, notif_stamp: v })} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Premio desbloqueado</Label>
                  <p className="text-sm text-gray-500">Avisamos al cliente cuando completa su tarjeta.</p>
                </div>
                <Switch checked={config.notif_reward} onCheckedChange={(v) => setConfig({ ...config, notif_reward: v })} />
              </div>
              <div className="flex items-center justify-between pt-4 border-t">
                <div>
                  <Label className="text-base">Recordatorio de cumpleaños</Label>
                  <p className="text-sm text-gray-500">Un mensaje especial con un sello de regalo.</p>
                </div>
                <div className="flex items-center gap-4">
                  <select className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm" value={config.birthday_reminder_days} onChange={(e) => setConfig({ ...config, birthday_reminder_days: Number(e.target.value) })}>
                    <option value={0}>El mismo día</option>
                    <option value={1}>1 día antes</option>
                    <option value={3}>3 días antes</option>
                  </select>
                  <Switch checked={config.notif_birthday} onCheckedChange={(v) => setConfig({ ...config, notif_birthday: v })} />
                </div>
              </div>
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Label className="text-base">Notificación por proximidad (Geo-Wallet)</Label>
                    <p className="text-sm text-gray-500">Muestra la tarjeta en pantalla de bloqueo cerca de la tienda.</p>
                  </div>
                  <Switch checked={config.notif_geo} onCheckedChange={(v) => setConfig({ ...config, notif_geo: v })} />
                </div>
                {config.notif_geo && (
                  <div className="grid grid-cols-3 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div>
                      <Label>Latitud</Label>
                      <Input type="number" step="any" placeholder="41.3851" value={config.geo_lat || ""} onChange={(e) => setConfig({ ...config, geo_lat: parseFloat(e.target.value) })} className="bg-white mt-1.5" />
                    </div>
                    <div>
                      <Label>Longitud</Label>
                      <Input type="number" step="any" placeholder="2.1734" value={config.geo_lng || ""} onChange={(e) => setConfig({ ...config, geo_lng: parseFloat(e.target.value) })} className="bg-white mt-1.5" />
                    </div>
                    <div>
                      <Label>Radio (metros)</Label>
                      <Input type="number" placeholder="200" value={config.geo_alert_radius || 200} onChange={(e) => setConfig({ ...config, geo_alert_radius: parseInt(e.target.value) })} className="bg-white mt-1.5" />
                    </div>
                  </div>
                )}
              </div>
              <div className="pt-6 mt-6 border-t flex justify-end">
                <Button onClick={saveConfig} disabled={saving} className="bg-gray-900 text-white">
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Guardar Preferencias
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="resumen"><ClubAdminDashboard /></TabsContent>
        <TabsContent value="socios"><ClubAdminCustomers /></TabsContent>
        <TabsContent value="campanas"><ClubAdminCampaigns /></TabsContent>
        <TabsContent value="premios"><ClubAdminRewards /></TabsContent>
      </Tabs>
    </div>
  )
}
