"use client"

import { useEffect, useState, useRef } from "react"
import { Check, Star, Save, Image as ImageIcon, Cookie, Pencil, AlertTriangle, CheckCircle2 } from "lucide-react"

interface CookieItem {
  id: string
  name: string
  image_urls: string[]
  image_url?: string
  price?: number
}

interface FeaturedCookieState {
  featured_id?: string
  cookie_id: string | null
  custom_description: string
  name?: string
  image_urls?: string[]
}

// ─── Modal genérico reutilizable ────────────────────────────────────────────
function ConfirmModal({
  open,
  icon,
  title,
  message,
  confirmLabel,
  cancelLabel,
  confirmClass,
  onConfirm,
  onCancel,
}: {
  open: boolean
  icon: React.ReactNode
  title: string
  message: React.ReactNode
  confirmLabel: string
  cancelLabel?: string
  confirmClass?: string
  onConfirm: () => void
  onCancel: () => void
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-100">
        <div className="flex items-start gap-4 mb-4">
          <div className="flex-shrink-0 mt-0.5">{icon}</div>
          <div>
            <h3 className="font-bold text-lg text-gray-900 mb-1">{title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{message}</p>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 font-medium text-sm transition-colors"
          >
            {cancelLabel ?? "Cancelar"}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2.5 rounded-xl font-medium text-sm transition-colors text-white ${confirmClass ?? "bg-[#930021] hover:bg-[#7a001b]"}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Modal de éxito (solo OK) ────────────────────────────────────────────────
function SuccessModal({
  open,
  cookieName,
  onClose,
}: {
  open: boolean
  cookieName: string
  onClose: () => void
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 text-center">
        <div className="flex justify-center mb-4">
          <CheckCircle2 className="w-12 h-12 text-green-500" />
        </div>
        <h3 className="font-bold text-lg text-gray-900 mb-1">¡Guardado con éxito!</h3>
        <p className="text-gray-500 text-sm mb-6">
          <strong>{cookieName}</strong> es ahora la Galleta del Mes y ya aparece en la página de inicio.
        </p>
        <button
          onClick={onClose}
          className="w-full px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium text-sm transition-colors"
        >
          Perfecto
        </button>
      </div>
    </div>
  )
}

// ─── Componente principal ────────────────────────────────────────────────────
export function SingleMonthCookieAdmin() {
  const [cookies, setCookies] = useState<CookieItem[]>([])
  const [featured, setFeatured] = useState<FeaturedCookieState>({ cookie_id: null, custom_description: "" })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState("")
  const [phase, setPhase] = useState<"select" | "customize">("select")

  // — Modales —
  const [pendingCookie, setPendingCookie] = useState<CookieItem | null>(null)
  const [showChangeConfirm, setShowChangeConfirm] = useState(false)   // cambiar galleta
  const [showSaveConfirm, setShowSaveConfirm] = useState(false)        // guardar
  const [showSuccess, setShowSuccess] = useState(false)                // éxito

  const descRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/cookies?all=true", { cache: "no-store" })
        const data = await res.json()
        setCookies(Array.isArray(data) ? data : [])

        const fRes = await fetch("/api/featured-cookie", { cache: "no-store" })
        const fData = await fRes.json()
        if (fData) {
          setFeatured({
            featured_id: fData.featured_id,
            cookie_id: fData.cookie_id || fData.id,
            custom_description: fData.custom_description || "",
            name: fData.name,
            image_urls: fData.image_urls,
          })
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

  // Seleccionar galleta — pedir confirmación si ya hay una activa
  const handleSelectCookie = (cookie: CookieItem) => {
    if (featured.cookie_id && featured.cookie_id !== cookie.id) {
      setPendingCookie(cookie)
      setShowChangeConfirm(true)
    } else {
      applySelection(cookie)
    }
  }

  const applySelection = (cookie: CookieItem) => {
    setFeatured(prev => ({
      ...prev,
      cookie_id: cookie.id,
      name: cookie.name,
      image_urls: cookie.image_urls,
      custom_description: "",
    }))
    setPhase("customize")
    setShowChangeConfirm(false)
    setPendingCookie(null)
    setTimeout(() => descRef.current?.focus(), 100)
  }

  // Guardar — mostrar modal de confirmación primero
  const handleSaveRequest = () => {
    if (!featured.cookie_id) return
    setShowSaveConfirm(true)
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
        }),
      })
      if (!res.ok) throw new Error("Error al guardar")
      setShowSuccess(true)
    } catch (err) {
      console.error(err)
      alert("Error al guardar la galleta del mes. Inténtalo de nuevo.")
    } finally {
      setSaving(false)
    }
  }

  const filteredCookies = cookies.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  const currentCookie = cookies.find(c => c.id === featured.cookie_id)
  const bannerImg = currentCookie?.image_urls?.[0] || currentCookie?.image_url || null

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 border-2 border-[#930021] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">

      {/* ── Modal: Cambiar galleta ── */}
      <ConfirmModal
        open={showChangeConfirm && !!pendingCookie}
        icon={<AlertTriangle className="w-6 h-6 text-amber-500" />}
        title="¿Cambiar la Galleta del Mes?"
        message={
          <>
            Actualmente <strong>{currentCookie?.name}</strong> está activa como galleta del mes.
            {" "}¿Quieres reemplazarla por <strong>{pendingCookie?.name}</strong>?
          </>
        }
        confirmLabel="Sí, cambiar"
        onConfirm={() => pendingCookie && applySelection(pendingCookie)}
        onCancel={() => { setShowChangeConfirm(false); setPendingCookie(null) }}
      />

      {/* ── Modal: Confirmar guardado ── */}
      <ConfirmModal
        open={showSaveConfirm}
        icon={<Save className="w-6 h-6 text-[#930021]" />}
        title="¿Guardar como Galleta del Mes?"
        message={
          <>
            Se publicará <strong>{currentCookie?.name}</strong> como la galleta destacada en la página de inicio.
            {featured.custom_description
              ? " Se usará la descripción personalizada que has escrito."
              : " Se usará la descripción original de la galleta."}
          </>
        }
        confirmLabel="Guardar"
        confirmClass="bg-[#930021] hover:bg-[#7a001b]"
        onConfirm={handleSaveConfirm}
        onCancel={() => setShowSaveConfirm(false)}
      />

      {/* ── Modal: Éxito ── */}
      <SuccessModal
        open={showSuccess}
        cookieName={currentCookie?.name ?? ""}
        onClose={() => setShowSuccess(false)}
      />

      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <Cookie className="w-6 h-6 text-[#930021]" />
        <h2 className="text-2xl font-semibold text-gray-900">Galleta del Mes</h2>
      </div>
      <p className="text-gray-500 text-sm mb-8">
        Una única galleta especial destacada en la página de inicio.
      </p>

      <div className="grid md:grid-cols-[1fr_400px] gap-8">

        {/* Panel Izquierdo: Selección */}
        <div className={phase === "customize" ? "hidden md:block" : "block"}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wider">
              {phase === "customize" ? "Galleta seleccionada" : "Seleccionar galleta"}
            </h3>
            {phase === "customize" && (
              <button
                onClick={() => setPhase("select")}
                className="text-xs text-[#930021] hover:underline flex items-center gap-1"
              >
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
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? "border-[#930021] bg-[#930021]/5 shadow-sm"
                      : "border-gray-100 bg-white hover:border-[#930021]/30 hover:bg-[#930021]/[0.02]"
                  }`}
                >
                  {img ? (
                    <img src={img} alt={cookie.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <ImageIcon className="w-5 h-5 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{cookie.name}</p>
                    {cookie.price && (
                      <p className="text-xs text-gray-400 mt-0.5">€{Number(cookie.price).toFixed(2)}</p>
                    )}
                  </div>
                  {isSelected
                    ? <div className="w-6 h-6 rounded-full bg-[#930021] flex items-center justify-center flex-shrink-0"><Check className="w-3.5 h-3.5 text-white" /></div>
                    : <Star className="w-4 h-4 text-gray-200 flex-shrink-0" />
                  }
                </button>
              )
            })}
          </div>
        </div>

        {/* Panel Derecho: Vista previa + Descripción */}
        <div className="space-y-5">

          {/* Preview */}
          <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm aspect-[4/3] relative bg-gray-50">
            {bannerImg ? (
              <img
                src={bannerImg}
                alt={currentCookie?.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 gap-2">
                <ImageIcon className="w-8 h-8" />
                <p className="text-sm">Sin imagen</p>
              </div>
            )}
            {currentCookie && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-5">
                <div>
                  <span className="text-white/70 text-xs uppercase tracking-widest">Del Mes</span>
                  <p className="text-white font-bold text-xl leading-tight">{currentCookie.name}</p>
                </div>
              </div>
            )}
          </div>

          {/* Descripción personalizada */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción especial
              <span className="text-gray-400 font-normal ml-1">(visible en el inicio)</span>
            </label>
            <textarea
              ref={descRef}
              value={featured.custom_description}
              onChange={e => setFeatured(prev => ({ ...prev, custom_description: e.target.value }))}
              rows={4}
              placeholder={currentCookie ? `Ej: Este mes te traemos ${currentCookie.name}, una combinación irresistible...` : "Selecciona primero una galleta"}
              disabled={!currentCookie}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#930021]/20 focus:border-[#930021] disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Botón guardar → abre modal de confirmación */}
          <button
            onClick={handleSaveRequest}
            disabled={!featured.cookie_id || saving}
            className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-semibold text-sm transition-all bg-[#930021] text-white hover:bg-[#7a001b] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? "Guardando..." : "Guardar Galleta del Mes"}
          </button>

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center text-xs text-gray-400 hover:text-[#930021] transition-colors"
          >
            Ver vista previa en la home →
          </a>
        </div>

      </div>
    </div>
  )
}
