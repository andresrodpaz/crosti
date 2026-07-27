"use client"

import { useEffect, useState, useRef } from "react"
import { Check, Star, Save, Image as ImageIcon, Cookie, Pencil, AlertTriangle, CheckCircle2, Type, Sliders, Eye, EyeOff } from "lucide-react"
import { AdminSpinner } from "@/components/admin/admin-spinner"

// ── Types ──────────────────────────────────────────────────────────────────
interface CookieItem {
  id: string
  name: string
  image_urls: string[]
  image_url?: string
  price?: number
}

interface StyleConfig {
  font: string
  titleSize: string
  badgeText: string
  badgeColor: string
  badgeTextColor: string
  overlayStyle: "bottom-fade" | "full-dark" | "none"
  overlayOpacity: number
  textAlign: "left" | "center"
  accentColor: string
}

interface FeaturedCookieState {
  featured_id?: string
  cookie_id: string | null
  custom_description: string
  name?: string
  image_urls?: string[]
  style_config?: StyleConfig
}

const DEFAULT_STYLE: StyleConfig = {
  font: "serif",
  titleSize: "large",
  badgeText: "Cookie del Mes",
  badgeColor: "#8B0F2B",
  badgeTextColor: "#F5D78A",
  overlayStyle: "bottom-fade",
  overlayOpacity: 60,
  textAlign: "left",
  accentColor: "#924C14",
}

const FONTS = [
  { label: "Georgia (clásica)", value: "'Georgia', serif" },
  { label: "Playfair Display", value: "'Playfair Display', serif" },
  { label: "Lora", value: "'Lora', serif" },
  { label: "Abril Fatface", value: "'Abril Fatface', cursive" },
  { label: "Raleway", value: "'Raleway', sans-serif" },
  { label: "Montserrat", value: "'Montserrat', sans-serif" },
  { label: "Poppins", value: "'Poppins', sans-serif" },
  { label: "Inter", value: "'Inter', sans-serif" },
  { label: "Merriweather", value: "'Merriweather', serif" },
  { label: "Josefin Sans", value: "'Josefin Sans', sans-serif" },
]

const TITLE_SIZES: Record<string, string> = {
  small: "text-xl",
  medium: "text-2xl",
  large: "text-3xl",
  xl: "text-4xl",
}

// ── Modals ─────────────────────────────────────────────────────────────────
function ConfirmModal({ open, icon, title, message, confirmLabel, cancelLabel, confirmClass, onConfirm, onCancel }: any) {
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-100">
        <div className="flex items-start gap-4 mb-4">
          <div className="flex-shrink-0 mt-0.5">{icon}</div>
          <div>
            <h3 className="font-bold text-lg text-gray-900 mb-1">{title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{message}</p>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onCancel} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 font-medium text-sm">{cancelLabel ?? "Cancelar"}</button>
          <button onClick={onConfirm} className={`flex-1 px-4 py-2.5 rounded-xl font-medium text-sm text-white ${confirmClass ?? "bg-[#930021] hover:bg-[#7a001b]"}`}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}

function SuccessModal({ open, cookieName, onClose }: any) {
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center">
        <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <h3 className="font-bold text-lg text-gray-900 mb-1">¡Guardado con éxito!</h3>
        <p className="text-gray-500 text-sm mb-6"><strong>{cookieName}</strong> es ahora la Galleta del Mes.</p>
        <button onClick={onClose} className="w-full px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium text-sm">Perfecto</button>
      </div>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────
export function SingleMonthCookieAdmin() {
  const [cookies, setCookies] = useState<CookieItem[]>([])
  const [featured, setFeatured] = useState<FeaturedCookieState>({ cookie_id: null, custom_description: "" })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState("")
  const [phase, setPhase] = useState<"select" | "customize">("select")
  const [activeTab, setActiveTab] = useState<"content" | "style">("content")
  const [styleConfig, setStyleConfig] = useState<StyleConfig>(DEFAULT_STYLE)
  const [pendingCookie, setPendingCookie] = useState<CookieItem | null>(null)
  const [showChangeConfirm, setShowChangeConfirm] = useState(false)
  const [showSaveConfirm, setShowSaveConfirm] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [googleFontsLoaded, setGoogleFontsLoaded] = useState(false)
  const descRef = useRef<HTMLTextAreaElement>(null)

  // Load Google Fonts
  useEffect(() => {
    if (!googleFontsLoaded) {
      const link = document.createElement("link")
      link.rel = "stylesheet"
      link.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Lora:wght@700&family=Abril+Fatface&family=Raleway:wght@700;900&family=Montserrat:wght@700;900&family=Poppins:wght@700&family=Merriweather:wght@700&family=Josefin+Sans:wght@700&display=swap"
      document.head.appendChild(link)
      setGoogleFontsLoaded(true)
    }
  }, [])

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/cookies?all=true", { cache: "no-store" })
        if (res.ok) {
          const data = await res.json()
          setCookies(Array.isArray(data) ? data : [])
        } else {
          console.error("[SingleMonthCookieAdmin] API error:", res.status)
          setCookies([])
        }

        const fRes = await fetch("/api/featured-cookie", { cache: "no-store" })
        const fData = await fRes.json()
        if (fData) {
          setFeatured({
            featured_id: fData.featured_id,
            cookie_id: fData.cookie_id || fData.id,
            custom_description: fData.custom_description || "",
            name: fData.name,
            image_urls: fData.image_urls,
            style_config: fData.style_config,
          })
          if (fData.style_config) setStyleConfig({ ...DEFAULT_STYLE, ...fData.style_config })
          setPhase("customize")
        }
      } catch (err) {
        console.error("Error loading featured cookie admin:", err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleSelectCookie = (cookie: CookieItem) => {
    if (featured.cookie_id && featured.cookie_id !== cookie.id) {
      setPendingCookie(cookie)
      setShowChangeConfirm(true)
    } else {
      applySelection(cookie)
    }
  }

  const applySelection = (cookie: CookieItem) => {
    setFeatured(prev => ({ ...prev, cookie_id: cookie.id, name: cookie.name, image_urls: cookie.image_urls, custom_description: "" }))
    setPhase("customize")
    setShowChangeConfirm(false)
    setPendingCookie(null)
    setTimeout(() => descRef.current?.focus(), 100)
  }

  const handleSaveConfirm = async () => {
    setShowSaveConfirm(false)
    setSaving(true)
    try {
      const res = await fetch("/api/featured-cookie", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cookie_id: featured.cookie_id,
          custom_description: featured.custom_description,
          style_config: styleConfig,
        }),
      })
      if (!res.ok) throw new Error("Error al guardar")
      setShowSuccess(true)
    } catch (err) {
      alert("Error al guardar la galleta del mes.")
    } finally {
      setSaving(false)
    }
  }

  const filteredCookies = cookies.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
  const currentCookie = cookies.find(c => c.id === featured.cookie_id)
  const bannerImg = currentCookie?.image_urls?.[0] || currentCookie?.image_url || null

  const overlayStyle = (() => {
    const opacity = styleConfig.overlayOpacity / 100
    if (styleConfig.overlayStyle === "none") return {}
    if (styleConfig.overlayStyle === "full-dark") return { background: `rgba(0,0,0,${opacity})` }
    return { background: `linear-gradient(to top, rgba(0,0,0,${opacity}) 0%, transparent 60%)` }
  })()

  const updateStyle = (updates: Partial<StyleConfig>) => setStyleConfig(prev => ({ ...prev, ...updates }))

  if (loading) return <AdminSpinner message="Cargando Galleta del Mes..." />

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <ConfirmModal
        open={showChangeConfirm && !!pendingCookie}
        icon={<AlertTriangle className="w-6 h-6 text-amber-500" />}
        title="¿Cambiar la Galleta del Mes?"
        message={<>Actualmente <strong>{currentCookie?.name}</strong> está activa. ¿Reemplazarla por <strong>{pendingCookie?.name}</strong>?</>}
        confirmLabel="Sí, cambiar"
        onConfirm={() => pendingCookie && applySelection(pendingCookie)}
        onCancel={() => { setShowChangeConfirm(false); setPendingCookie(null) }}
      />
      <ConfirmModal
        open={showSaveConfirm}
        icon={<Save className="w-6 h-6 text-[#930021]" />}
        title="¿Guardar como Galleta del Mes?"
        message={<>Se publicará <strong>{currentCookie?.name}</strong> como la galleta destacada en la página de inicio.</>}
        confirmLabel="Guardar"
        confirmClass="bg-[#930021] hover:bg-[#7a001b]"
        onConfirm={handleSaveConfirm}
        onCancel={() => setShowSaveConfirm(false)}
      />
      <SuccessModal open={showSuccess} cookieName={currentCookie?.name ?? ""} onClose={() => setShowSuccess(false)} />

      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <Cookie className="w-6 h-6 text-[#930021]" />
        <h2 className="text-2xl font-semibold text-gray-900">Galleta del Mes</h2>
      </div>
      <p className="text-gray-500 text-sm mb-8">Personaliza la galleta destacada en la página de inicio.</p>

      <div className="grid md:grid-cols-[1fr_420px] gap-8">

        {/* Left: Cookie selector */}
        <div className={phase === "customize" ? "hidden md:block" : "block"}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wider">
              {phase === "customize" ? "Galleta seleccionada" : "Seleccionar galleta"}
            </h3>
            {phase === "customize" && (
              <button onClick={() => setPhase("select")} className="text-xs text-[#930021] hover:underline flex items-center gap-1">
                <Pencil className="w-3 h-3" /> Cambiar galleta
              </button>
            )}
          </div>
          <input
            type="text"
            placeholder="Buscar galleta..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-[#930021]/20 focus:border-[#930021]"
          />
          <div className="space-y-2 max-h-[calc(100vh-400px)] overflow-y-auto pr-1">
            {filteredCookies.map(cookie => {
              const isSelected = cookie.id === featured.cookie_id
              const img = cookie.image_urls?.[0] || cookie.image_url
              return (
                <button
                  key={cookie.id}
                  onClick={() => handleSelectCookie(cookie)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${isSelected ? "border-[#930021] bg-[#930021]/5 shadow-sm" : "border-gray-100 bg-white hover:border-[#930021]/30"}`}
                >
                  {img ? <img src={img} alt={cookie.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" /> : <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0"><ImageIcon className="w-5 h-5 text-gray-400" /></div>}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{cookie.name}</p>
                    {cookie.price && <p className="text-xs text-gray-400 mt-0.5">€{Number(cookie.price).toFixed(2)}</p>}
                  </div>
                  {isSelected ? <div className="w-6 h-6 rounded-full bg-[#930021] flex items-center justify-center flex-shrink-0"><Check className="w-3.5 h-3.5 text-white" /></div> : <Star className="w-4 h-4 text-gray-200 flex-shrink-0" />}
                </button>
              )
            })}
          </div>
        </div>

        {/* Right: Preview + Editor */}
        <div className="space-y-4">

          {/* Live Preview */}
          <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm aspect-[4/3] relative bg-gray-50">
            {bannerImg ? (
              <img src={bannerImg} alt={currentCookie?.name} className="w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 gap-2">
                <ImageIcon className="w-8 h-8" />
                <p className="text-sm">Sin imagen</p>
              </div>
            )}
            {/* Overlay */}
            {styleConfig.overlayStyle !== "none" && (
              <div className="absolute inset-0" style={overlayStyle} />
            )}
            {/* Badge Image */}
            {currentCookie && (
              <img 
                src="/images/galleta-del-mes-banner.png" 
                alt="Cookie del Mes"
                className="absolute top-3 right-3 w-[70px] h-[70px] object-contain drop-shadow-xl z-20"
              />
            )}
            {/* Text overlay */}
            {currentCookie && (
              <div className={`absolute bottom-0 left-0 right-0 p-5 ${styleConfig.textAlign === "center" ? "text-center" : "text-left"}`}>
                <p className="text-white/70 text-xs uppercase tracking-widest">Del Mes</p>
                <p
                  className={`text-white font-bold leading-tight ${TITLE_SIZES[styleConfig.titleSize] || "text-3xl"}`}
                  style={{ fontFamily: styleConfig.font }}
                >
                  {currentCookie.name}
                </p>
              </div>
            )}
          </div>

          {/* Tabs */}
          {currentCookie && (
            <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
              <button
                onClick={() => setActiveTab("content")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === "content" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                <Pencil className="w-3.5 h-3.5" /> Contenido
              </button>
              <button
                onClick={() => setActiveTab("style")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === "style" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                <Sliders className="w-3.5 h-3.5" /> Estilo
              </button>
            </div>
          )}

          {/* Content Tab */}
          {currentCookie && activeTab === "content" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción especial <span className="text-gray-400 font-normal">(visible en el inicio)</span>
              </label>
              <textarea
                ref={descRef}
                value={featured.custom_description}
                onChange={e => setFeatured(prev => ({ ...prev, custom_description: e.target.value }))}
                rows={4}
                placeholder={`Ej: Este mes te traemos ${currentCookie.name}, una combinación irresistible...`}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#930021]/20 focus:border-[#930021]"
              />
            </div>
          )}

          {/* Style Tab */}
          {currentCookie && activeTab === "style" && (
            <div className="space-y-4 bg-gray-50 rounded-2xl p-4 border border-gray-100">

              {/* Font selector */}
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Type className="w-3.5 h-3.5" /> Fuente del título</label>
                <div className="grid grid-cols-1 gap-1 max-h-40 overflow-y-auto pr-1">
                  {FONTS.map(f => (
                    <button
                      key={f.value}
                      onClick={() => updateStyle({ font: f.value })}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl border text-left text-sm transition-all ${styleConfig.font === f.value ? "border-[#930021] bg-[#930021]/5 text-[#930021]" : "border-gray-200 bg-white hover:border-gray-300"}`}
                    >
                      <span style={{ fontFamily: f.value }}>{f.label}</span>
                      {styleConfig.font === f.value && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title size */}
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Tamaño del título</label>
                <div className="grid grid-cols-4 gap-1">
                  {["small", "medium", "large", "xl"].map(size => (
                    <button
                      key={size}
                      onClick={() => updateStyle({ titleSize: size })}
                      className={`py-2 rounded-xl border text-xs font-semibold transition-all ${styleConfig.titleSize === size ? "border-[#930021] bg-[#930021] text-white" : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"}`}
                    >
                      {size === "small" ? "S" : size === "medium" ? "M" : size === "large" ? "L" : "XL"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Overlay */}
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Overlay de imagen</label>
                <div className="grid grid-cols-3 gap-1 mb-2">
                  {[
                    { value: "bottom-fade", label: "Degradado" },
                    { value: "full-dark", label: "Oscuro" },
                    { value: "none", label: "Ninguno" },
                  ].map(o => (
                    <button
                      key={o.value}
                      onClick={() => updateStyle({ overlayStyle: o.value as any })}
                      className={`py-2 rounded-xl border text-xs font-semibold transition-all ${styleConfig.overlayStyle === o.value ? "border-[#930021] bg-[#930021] text-white" : "border-gray-200 bg-white text-gray-600"}`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
                {styleConfig.overlayStyle !== "none" && (
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-14">Opacidad</span>
                    <input
                      type="range" min={10} max={90} step={5}
                      value={styleConfig.overlayOpacity}
                      onChange={e => updateStyle({ overlayOpacity: Number(e.target.value) })}
                      className="flex-1 accent-[#930021]"
                    />
                    <span className="text-xs text-gray-500 w-8 text-right">{styleConfig.overlayOpacity}%</span>
                  </div>
                )}
              </div>


              {/* Text alignment */}
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Alineación del texto</label>
                <div className="grid grid-cols-2 gap-1">
                  {[{ value: "left", label: "⬅ Izquierda" }, { value: "center", label: "↔ Centro" }].map(a => (
                    <button
                      key={a.value}
                      onClick={() => updateStyle({ textAlign: a.value as any })}
                      className={`py-2 rounded-xl border text-xs font-semibold transition-all ${styleConfig.textAlign === a.value ? "border-[#930021] bg-[#930021] text-white" : "border-gray-200 bg-white text-gray-600"}`}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Accent color */}
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Color de acento (texto info)</label>
                <div className="flex gap-2 items-center">
                  <input type="color" value={styleConfig.accentColor} onChange={e => updateStyle({ accentColor: e.target.value })} className="w-8 h-8 rounded-lg cursor-pointer border border-gray-200" />
                  <input type="text" value={styleConfig.accentColor} onChange={e => updateStyle({ accentColor: e.target.value })} className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm font-mono" />
                </div>
              </div>
            </div>
          )}

          {/* Save button */}
          <button
            onClick={() => { if (!featured.cookie_id) return; setShowSaveConfirm(true) }}
            disabled={!featured.cookie_id || saving}
            className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-semibold text-sm bg-[#930021] text-white hover:bg-[#7a001b] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {saving ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Guardando..." : "Guardar Galleta del Mes"}
          </button>

          <a href="/" target="_blank" rel="noopener noreferrer" className="block text-center text-xs text-gray-400 hover:text-[#930021] transition-colors">
            Ver vista previa en la home →
          </a>
        </div>
      </div>
    </div>
  )
}
