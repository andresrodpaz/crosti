"use client"

import type React from "react"
import { useState } from "react"
import { LogIn, Eye, EyeOff, Cookie } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const supabase = createClient()

      if (!supabase) {
        setError("Error al conectar con Supabase")
        return
      }

      console.log("[Message] Attempting login with email:", email)

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      console.log("[Message] Auth response:", { data, authError })

      if (authError) {
        setError(authError.message || "Credenciales incorrectas")
        return
      }

      if (data.user) {
        console.log("[Message] User authenticated, checking profile for ID:", data.user.id)

        // Check if user has admin role
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single()

        console.log("[Message] Profile query result:", { profileData, profileError })

        if (profileError || !profileData) {
          setError("Usuario sin perfil configurado")
          await supabase.auth.signOut()
          return
        }

        if (!["admin", "editor"].includes(profileData.role)) {
          setError("No tienes permisos de administrador")
          await supabase.auth.signOut()
          return
        }

        console.log("[Message] Login successful, redirecting to admin")
        router.push("/admin")
      }
    } catch (err: any) {
      console.log("[Message] Error during login:", err)
      setError(err.message || "Error al iniciar sesión")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#930021] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Cookie className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900">Crosti Admin</h1>
          <p className="text-sm text-gray-500 mt-1">Inicia sesión para continuar</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#930021]/20 focus:border-[#930021] text-sm"
                placeholder="tu@email.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Contraseña</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#930021]/20 focus:border-[#930021] text-sm"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="px-4 py-2.5 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">{error}</div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-2.5 bg-[#930021] text-white rounded-xl hover:bg-[#7a001b] transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
            </button>
          </form>
        </div>

        <div className="text-center mt-6">
          <a href="/" className="text-sm text-gray-500 hover:text-gray-700">
            ← Volver a la web
          </a>
        </div>
      </div>
    </div>
  )
}
