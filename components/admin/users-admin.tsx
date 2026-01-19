"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Plus, Pencil, Trash2, X, Users, Shield, Eye, Edit3, KeyRound, CheckCircle2 } from "lucide-react"
import { ConfirmationModal } from "@/components/confirmation-modal"
import { createClient } from "@/lib/supabase/client"

const roleLabels = {
  admin: { label: "Administrador", icon: Shield, color: "bg-red-100 text-red-700" },
  developer: { label: "Desarrollador", icon: KeyRound, color: "bg-purple-100 text-purple-700" },
  editor: { label: "Editor", icon: Edit3, color: "bg-blue-100 text-blue-700" },
  viewer: { label: "Visor", icon: Eye, color: "bg-gray-100 text-gray-700" },
}

type Profile = {
  id: string
  email: string
  name: string | null
  role: keyof typeof roleLabels
  created_at: string
}

export function UsersAdmin() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [showModal, setShowModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null)
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null)
  const [newPassword, setNewPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    role: "viewer" as keyof typeof roleLabels,
  })

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean
    title: string
    message: string
    onConfirm: () => Promise<void>
    type: "danger" | "warning" | "info"
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: async () => {},
    type: "info",
  })

  useEffect(() => {
    loadProfiles()
  }, [])

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  const loadProfiles = async () => {
    const supabase = createClient()
    const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false })

    if (!error && data) {
      setProfiles(data)
    }
  }

  const openCreateModal = () => {
    setEditingProfile(null)
    setFormData({ email: "", name: "", role: "viewer" })
    setShowModal(true)
  }

  const openEditModal = (profile: Profile) => {
    setEditingProfile(profile)
    setFormData({ email: profile.email, name: profile.name || "", role: profile.role })
    setShowModal(true)
  }

  const openPasswordModal = (profile: Profile) => {
    setSelectedProfile(profile)
    setNewPassword("")
    setShowPasswordModal(true)
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProfile || !newPassword) return

    setLoading(true)

    try {
      const response = await fetch(`/api/admin/users/${selectedProfile.id}/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al cambiar contraseña")
      }

      setSuccessMessage("Contraseña actualizada correctamente")
      setShowPasswordModal(false)
      setNewPassword("")
    } catch (error) {
      alert(`Error al cambiar contraseña: ${error instanceof Error ? error.message : "Error desconocido"}`)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()

    if (editingProfile) {
      setConfirmModal({
        isOpen: true,
        title: "Confirmar cambios",
        message: `¿Estás seguro de actualizar el rol de ${editingProfile.email} a ${roleLabels[formData.role].label}?`,
        type: "info",
        onConfirm: async () => {
          const { error } = await supabase
            .from("profiles")
            .update({
              email: formData.email.toLowerCase(),
              name: formData.name,
              role: formData.role,
            })
            .eq("id", editingProfile.id)

          if (error) {
            alert(`Error al actualizar: ${error.message}`)
          } else {
            await loadProfiles()
            setShowModal(false)
            setSuccessMessage("Usuario actualizado correctamente")
          }
          setLoading(false)
        },
      })
      return
    } else {
      alert("Para crear nuevos usuarios, usa Supabase Auth o la API de registro")
    }

    setLoading(false)
  }

  const handleDelete = async (id: string, email: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Eliminar usuario",
      message: `¿Estás seguro de eliminar al usuario ${email}? Esta acción no se puede deshacer.`,
      type: "danger",
      onConfirm: async () => {
        setLoading(true)
        const supabase = createClient()

        const { error } = await supabase.from("profiles").delete().eq("id", id)

        if (error) {
          alert(`Error al eliminar: ${error.message}`)
        } else {
          await loadProfiles()
          setSuccessMessage("Usuario eliminado correctamente")
        }

        setLoading(false)
      },
    })
  }

  return (
    <div className="p-8">
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-slide-down">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Usuarios</h2>
          <p className="text-gray-500 text-sm mt-1">Gestiona los accesos al panel de administración</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#930021] text-white rounded-xl hover:bg-[#7a001b] transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Nuevo usuario
        </button>
      </div>

      <div className="grid gap-4">
        {profiles.map((profile) => {
          const roleInfo = roleLabels[profile.role]
          const RoleIcon = roleInfo.icon
          return (
            <div
              key={profile.id}
              className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-gray-200 transition-colors"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-lg font-semibold text-gray-500">
                      {(profile.name || profile.email).charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{profile.name || "Sin nombre"}</h3>
                    <p className="text-sm text-gray-500">{profile.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${roleInfo.color}`}
                  >
                    <RoleIcon className="w-3.5 h-3.5" />
                    {roleInfo.label}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openPasswordModal(profile)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      aria-label="Cambiar contraseña"
                      title="Cambiar contraseña"
                    >
                      <KeyRound className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openEditModal(profile)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      aria-label="Editar"
                      title="Editar"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(profile.id, profile.email)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      aria-label="Eliminar"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        {profiles.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No hay usuarios todavía</p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">{editingProfile ? "Editar usuario" : "Nuevo usuario"}</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#930021]/20 focus:border-[#930021] text-sm"
                  placeholder="Nombre completo"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Correo electrónico</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#930021]/20 focus:border-[#930021] text-sm"
                  placeholder="correo@ejemplo.com"
                  required
                  disabled={!!editingProfile}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rol</label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(roleLabels) as (keyof typeof roleLabels)[]).map((role) => {
                    const info = roleLabels[role]
                    const Icon = info.icon
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setFormData({ ...formData, role })}
                        className={`p-3 rounded-xl border-2 transition-colors text-center ${
                          formData.role === role
                            ? "border-[#930021] bg-[#930021]/5"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <Icon
                          className={`w-5 h-5 mx-auto mb-1 ${formData.role === role ? "text-[#930021]" : "text-gray-400"}`}
                        />
                        <p
                          className={`text-xs font-medium ${formData.role === role ? "text-[#930021]" : "text-gray-600"}`}
                        >
                          {info.label}
                        </p>
                      </button>
                    )
                  })}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 bg-[#930021] text-white rounded-xl hover:bg-[#7a001b] transition-colors text-sm font-medium disabled:opacity-50"
                >
                  {loading ? "Guardando..." : editingProfile ? "Guardar cambios" : "Crear usuario"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPasswordModal && selectedProfile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Cambiar Contraseña</h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handlePasswordChange} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Usuario</label>
                <div className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600">
                  {selectedProfile.email}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nueva Contraseña</label>
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#930021]/20 focus:border-[#930021] text-sm font-mono"
                  placeholder="Ingresa la nueva contraseña"
                  required
                  minLength={6}
                />
                <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 bg-[#930021] text-white rounded-xl hover:bg-[#7a001b] transition-colors text-sm font-medium disabled:opacity-50"
                >
                  {loading ? "Actualizando..." : "Cambiar Contraseña"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={async () => {
          await confirmModal.onConfirm()
          setConfirmModal({ ...confirmModal, isOpen: false })
        }}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
      />
    </div>
  )
}
