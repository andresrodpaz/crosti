"use client"

import { useEffect, useState } from "react"
import { CheckCircle2, XCircle, Loader2, AlertCircle } from "lucide-react"

type ConfirmationModalProps = {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: "danger" | "warning" | "info"
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  type = "info",
}: ConfirmationModalProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    if (!isOpen) {
      setStatus("idle")
      setErrorMessage("")
    }
  }, [isOpen])

  const handleConfirm = async () => {
    setStatus("loading")
    try {
      await onConfirm()
      setStatus("success")
      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (error) {
      setStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "Error desconocido")
      setTimeout(() => {
        setStatus("idle")
      }, 3000)
    }
  }

  if (!isOpen) return null

  const typeColors = {
    danger: "bg-red-500",
    warning: "bg-yellow-500",
    info: "bg-blue-500",
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={status === "idle" ? onClose : undefined}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full animate-scale-in">
        {status === "loading" && (
          <div className="absolute inset-0 bg-white/90 rounded-2xl flex items-center justify-center z-10">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-[#930021] animate-spin mx-auto mb-3" />
              <p className="text-gray-600 font-medium">Procesando...</p>
            </div>
          </div>
        )}

        {status === "success" && (
          <div className="absolute inset-0 bg-white/95 rounded-2xl flex items-center justify-center z-10">
            <div className="text-center animate-scale-in">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-3" />
              <p className="text-gray-900 font-semibold text-lg">¡Éxito!</p>
              <p className="text-gray-600">Operación completada</p>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="absolute inset-0 bg-white/95 rounded-2xl flex items-center justify-center z-10">
            <div className="text-center animate-scale-in p-6">
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-3" />
              <p className="text-gray-900 font-semibold text-lg mb-2">Error</p>
              <p className="text-gray-600 text-sm">{errorMessage}</p>
            </div>
          </div>
        )}

        <div className="p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className={`w-12 h-12 ${typeColors[type]} rounded-xl flex items-center justify-center flex-shrink-0`}>
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
              <p className="text-gray-600 text-sm">{message}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={status !== "idle"}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelText}
            </button>
            <button
              onClick={handleConfirm}
              disabled={status !== "idle"}
              className={`flex-1 px-4 py-2.5 text-white rounded-xl transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
                type === "danger" ? "bg-red-500 hover:bg-red-600" : "bg-[#930021] hover:bg-[#7a001a]"
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
