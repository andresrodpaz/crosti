"use client"
import { useEffect, useRef, useState } from "react"
import { Camera, CameraOff } from "lucide-react"

interface Props {
  onDetected: (code: string) => void
  active: boolean
}

/**
 * QR Scanner using the native BarcodeDetector API (Chrome/Edge 83+).
 * Falls back gracefully with a clear message on unsupported browsers.
 * No external dependencies required.
 */
export function QrScanner({ onDetected, active }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [supported, setSupported] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number>(0)
  const detectorRef = useRef<any>(null)

  useEffect(() => {
    const api = (window as any).BarcodeDetector
    if (!api) {
      setSupported(false)
      return
    }
    setSupported(true)
    detectorRef.current = new api({ formats: ["qr_code"] })
  }, [])

  useEffect(() => {
    if (!active || supported !== true) return

    let cancelled = false

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        })
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }
        scan()
      } catch {
        setError("No se pudo acceder a la cámara. Verifica los permisos del navegador.")
      }
    }

    const scan = async () => {
      if (cancelled || !videoRef.current || videoRef.current.readyState < 2) {
        rafRef.current = requestAnimationFrame(scan)
        return
      }
      try {
        const codes = await detectorRef.current.detect(videoRef.current)
        if (codes.length > 0) {
          const raw = codes[0].rawValue as string
          onDetected(raw)
          return // stop loop after detection
        }
      } catch { /* ignore frame errors */ }
      rafRef.current = requestAnimationFrame(scan)
    }

    startCamera()

    return () => {
      cancelled = true
      cancelAnimationFrame(rafRef.current)
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [active, supported, onDetected])

  // Unsupported browser — show manual fallback message
  if (supported === false) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 p-6 bg-amber-50 border border-amber-200 rounded-xl text-center">
        <CameraOff className="w-8 h-8 text-amber-500" />
        <p className="text-sm font-medium text-amber-800">
          Tu navegador no soporta el escáner QR nativo.
        </p>
        <p className="text-xs text-amber-600">
          Usa Chrome o Edge, o introduce el nº de tarjeta manualmente.
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 p-6 bg-red-50 border border-red-200 rounded-xl text-center">
        <CameraOff className="w-8 h-8 text-red-400" />
        <p className="text-sm text-red-700">{error}</p>
      </div>
    )
  }

  if (supported === null) return null // loading

  return (
    <div className="relative overflow-hidden rounded-xl border-2 border-dashed border-[#930021]/30 bg-black aspect-video w-full">
      <video
        ref={videoRef}
        muted
        playsInline
        className="w-full h-full object-cover"
      />
      {/* Scanning overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-48 h-48 border-2 border-white/70 rounded-lg relative">
          {/* Corner accents */}
          <span className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-[#F5D89C] rounded-tl" />
          <span className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-[#F5D89C] rounded-tr" />
          <span className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-[#F5D89C] rounded-bl" />
          <span className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-[#F5D89C] rounded-br" />
          {/* Scan line animation */}
          <div className="absolute left-1 right-1 top-0 h-0.5 bg-[#930021]/70 animate-scan-line" />
        </div>
      </div>
      <p className="absolute bottom-3 left-0 right-0 text-center text-xs text-white/70 flex items-center justify-center gap-1.5">
        <Camera className="w-3 h-3" /> Apunta al QR de la tarjeta del cliente
      </p>
    </div>
  )
}
