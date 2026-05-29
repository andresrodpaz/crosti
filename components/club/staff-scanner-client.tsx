"use client"

import { useState, useEffect, useRef } from "react"
import { Html5QrcodeScanner } from "html5-qrcode"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2, Camera, User, Lock, Store, Bike, Plus, Cookie } from "lucide-react"

export function StaffScannerClient() {
  const [pin, setPin] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(false)
  const [scannedCustomer, setScannedCustomer] = useState<string | null>(null)
  const [scanError, setScanError] = useState<string | null>(null)
  
  const [stampOrigin, setStampOrigin] = useState<"counter" | "delivery">("counter")
  const [stampPlatform, setStampPlatform] = useState("glovo")
  const [stampEmail, setStampEmail] = useState("")
  const [stampOrderId, setStampOrderId] = useState("")
  const [stampAmount, setStampAmount] = useState<number>(1)
  const [stampSuccess, setStampSuccess] = useState(false)

  const scannerRef = useRef<Html5QrcodeScanner | null>(null)

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/club/verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin })
      })
      if (res.ok) setIsAuthenticated(true)
      else toast.error("PIN incorrecto")
    } catch {
      toast.error("Error al verificar PIN")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated && !stampSuccess) {
      if (!scannerRef.current) {
        scannerRef.current = new Html5QrcodeScanner(
          "reader",
          { fps: 10, qrbox: { width: 250, height: 250 } },
          false
        )
        
        scannerRef.current.render(
          (decodedText) => {
            // Assuming the QR contains the customer's email or ID. Let's say email for now, or ID.
            try {
              const url = new URL(decodedText)
              const email = url.searchParams.get("email") || url.searchParams.get("id")
              if (email) {
                setScannedCustomer(email)
                setStampEmail(email)
                scannerRef.current?.clear()
                toast.success("Cliente identificado")
              }
            } catch {
              // Not a valid URL, maybe just text
              if (decodedText.includes("@")) {
                setScannedCustomer(decodedText)
                setStampEmail(decodedText)
                scannerRef.current?.clear()
                toast.success("Cliente identificado")
              }
            }
          },
          (err) => {
            // Ignore scan errors, they happen continuously
          }
        )
      }
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error)
        scannerRef.current = null
      }
    }
  }, [isAuthenticated, stampSuccess])

  const handleGiveStamp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("/api/club/stamps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: stampEmail,
          amount: stampAmount,
          origin: stampOrigin,
          platform: stampPlatform,
          orderId: stampOrderId
        })
      })

      const data = await res.json()
      if (!res.ok) {
        if (data.error === "DUPLICATE_ORDER") {
          const confirm = window.confirm("Ya se dio un sello para este pedido. ¿Quieres darlo igualmente?")
          if (!confirm) return setLoading(false)
          
          // Retry with force flag
          const retryRes = await fetch("/api/club/stamps", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: stampEmail,
              amount: stampAmount,
              origin: stampOrigin,
              platform: stampPlatform,
              orderId: stampOrderId,
              force: true
            })
          })
          if (!retryRes.ok) throw new Error((await retryRes.json()).error)
        } else {
          throw new Error(data.error || "Error al dar sello")
        }
      }

      setStampSuccess(true)
      toast.success("¡Sello entregado con éxito!")
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setStampSuccess(false)
    setScannedCustomer(null)
    setStampEmail("")
    setStampOrderId("")
    setStampAmount(1)
  }

  if (!isAuthenticated) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center p-6 w-full">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <Lock className="w-8 h-8 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Acceso Staff</h2>
        <p className="text-gray-500 mb-8 text-center max-w-[280px]">Introduce el PIN de 4 dígitos para acceder al escáner.</p>
        
        <form onSubmit={handlePinSubmit} className="w-full max-w-[280px]">
          <Input 
            type="password"
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
            className="text-center text-3xl tracking-[1em] h-16 rounded-xl font-bold mb-4"
            placeholder="••••"
            required
          />
          <Button type="submit" disabled={pin.length < 4 || loading} className="w-full h-14 rounded-xl text-lg bg-[#930021] hover:bg-[#7a001a] text-white">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Entrar"}
          </Button>
        </form>
      </div>
    )
  }

  if (stampSuccess) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-300">
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <Cookie className="w-12 h-12" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">¡Sello dado!</h2>
        <p className="text-gray-500 mb-8 max-w-[280px]">
          Se han añadido {stampAmount} sellos a la cuenta de {stampEmail}.
        </p>
        
        <Button onClick={handleReset} className="w-full max-w-[280px] h-14 rounded-xl text-lg bg-[#930021] hover:bg-[#7a001a] text-white">
          <Plus className="w-5 h-5 mr-2" />
          Dar otro sello
        </Button>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col w-full h-full overflow-auto pb-12">
      {/* Scanner Section */}
      {!scannedCustomer && (
        <div className="w-full bg-black aspect-square max-h-[400px] relative">
          <div id="reader" className="w-full h-full [&_video]:object-cover" />
          <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center">
            <Camera className="w-3 h-3 mr-2" />
            Escaneando código...
          </div>
        </div>
      )}

      {scannedCustomer && (
        <div className="w-full bg-green-50 p-6 border-b border-green-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center shrink-0">
            <User className="w-6 h-6" />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-green-800 uppercase tracking-wider mb-0.5">Cliente Identificado</p>
            <p className="text-sm font-medium text-green-900 truncate">{scannedCustomer}</p>
          </div>
          <button 
            onClick={() => setScannedCustomer(null)}
            className="ml-auto text-xs font-medium text-green-700 underline"
          >
            Cambiar
          </button>
        </div>
      )}

      {/* Manual Form Section */}
      <div className="p-6">
        <div className="flex p-1 bg-gray-100 rounded-lg mb-6">
          <button
            type="button"
            onClick={() => setStampOrigin("counter")}
            className={`flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-md transition-all ${stampOrigin === 'counter' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <Store className="w-4 h-4 mr-2" />
            Mostrador
          </button>
          <button
            type="button"
            onClick={() => setStampOrigin("delivery")}
            className={`flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-md transition-all ${stampOrigin === 'delivery' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <Bike className="w-4 h-4 mr-2" />
            Delivery
          </button>
        </div>

        <form onSubmit={handleGiveStamp} className="space-y-5">
          {!scannedCustomer && (
            <div className="space-y-2">
              <Label>Email del cliente</Label>
              <Input 
                type="email" 
                placeholder="Introducir email manualmente" 
                value={stampEmail}
                onChange={(e) => setStampEmail(e.target.value)}
                className="h-12 rounded-xl"
                required
              />
            </div>
          )}

          {stampOrigin === 'delivery' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Plataforma</Label>
                <select 
                  className="flex h-12 w-full rounded-xl border border-input bg-white px-3 py-2 text-sm"
                  value={stampPlatform}
                  onChange={(e) => setStampPlatform(e.target.value)}
                >
                  <option value="glovo">Glovo</option>
                  <option value="ubereats">Uber Eats</option>
                  <option value="justeat">Just Eat</option>
                  <option value="other">Otra</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>ID del Pedido</Label>
                <Input 
                  placeholder="Ej: GLV-849"
                  value={stampOrderId}
                  onChange={(e) => setStampOrderId(e.target.value)}
                  className="h-12 rounded-xl"
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Cantidad de sellos</Label>
            <div className="flex gap-2">
              {[1, 2, 3].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setStampAmount(num)}
                  className={`flex-1 h-12 rounded-xl font-medium border-2 transition-all ${stampAmount === num ? 'border-[#930021] bg-[#930021]/5 text-[#930021]' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                >
                  +{num}
                </button>
              ))}
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={loading || (!stampEmail && !scannedCustomer)}
            className="w-full h-14 mt-4 rounded-xl text-lg font-semibold bg-[#930021] hover:bg-[#7a001a] text-white"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : `Dar ${stampAmount} sello${stampAmount > 1 ? 's' : ''}`}
          </Button>
        </form>
      </div>
    </div>
  )
}
