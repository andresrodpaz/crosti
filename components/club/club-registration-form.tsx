"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2, CheckCircle2 } from "lucide-react"

export function ClubRegistrationForm({ referralCode }: { referralCode?: string }) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [createdCustomerId, setCreatedCustomerId] = useState<string | null>(null)
  const [walletLoading, setWalletLoading] = useState<"apple" | "google" | null>(null)
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    birthday: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("/api/club/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, referralCode })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Error al registrarse")
      }

      setCreatedCustomerId(data.customerId)
      setSuccess(true)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleWallet = async (type: "apple" | "google") => {
    setWalletLoading(type)
    try {
      // Llamada al endpoint de generación de Wallet
      const res = await fetch(`/api/club/wallet?type=${type}&email=${formData.email}`)
      if (!res.ok) throw new Error("Error generando tarjeta")
      
      if (type === "apple") {
        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = "club-crosti.pkpass"
        document.body.appendChild(a)
        a.click()
        a.remove()
      } else {
        const { url } = await res.json()
        window.open(url, "_blank")
      }
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setWalletLoading(null)
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-bold text-[#4A2C11] mb-2">¡Todo listo!</h3>
        <p className="text-[#7C4A1E]/80 mb-8 max-w-[280px]">
          Tu tarjeta está de camino a tu correo. También puedes verla ahora mismo:
        </p>

        <div className="w-full space-y-3">
          <Button 
            onClick={() => router.push(`/club/tarjeta/${createdCustomerId}`)}
            className="w-full bg-[#930021] text-white rounded-xl py-6 font-semibold hover:bg-[#7a001a] transition-colors"
          >
            Ver mi Tarjeta Digital
          </Button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-[#4A2C11] font-medium ml-1">Tu email</Label>
        <Input 
          id="email"
          type="email" 
          placeholder="ejemplo@email.com" 
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          className="h-12 rounded-xl bg-[#FFFBF5] border-[#F5D89C] focus:ring-[#930021] focus:border-[#930021]"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="name" className="text-[#4A2C11] font-medium ml-1">Tu nombre (opcional)</Label>
        <Input 
          id="name"
          type="text" 
          placeholder="María" 
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          className="h-12 rounded-xl bg-[#FFFBF5] border-[#F5D89C] focus:ring-[#930021] focus:border-[#930021]"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="birthday" className="text-[#4A2C11] font-medium ml-1 flex flex-col">
          <span>Fecha de nacimiento (opcional)</span>
          <span className="text-xs text-[#7C4A1E]/70 font-normal mt-0.5">Para darte una sorpresa el día de tu cumpleaños 🎂</span>
        </Label>
        <Input 
          id="birthday"
          type="date" 
          value={formData.birthday}
          onChange={(e) => setFormData({...formData, birthday: e.target.value})}
          className="h-12 rounded-xl bg-[#FFFBF5] border-[#F5D89C] focus:ring-[#930021] focus:border-[#930021]"
        />
      </div>

      <Button 
        type="submit" 
        className="w-full h-14 mt-4 rounded-xl text-lg font-semibold bg-[#930021] hover:bg-[#7a001a] text-white transition-all shadow-[0_4px_14px_0_rgba(147,0,33,0.39)] hover:shadow-[0_6px_20px_rgba(147,0,33,0.23)] hover:-translate-y-0.5"
        disabled={loading}
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Conseguir mi tarjeta"}
      </Button>
    </form>
  )
}
