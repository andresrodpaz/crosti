"use client"

import QRCode from "react-qr-code"
import Image from "next/image"

export interface DigitalCardProps {
  config: {
    primaryColor: string
    accentColor: string
    textColor: string
    font: string
    stampTotal: number
    rewardDescription: string
    logoUrl?: string
  }
  customerName?: string
  stampCount?: number
  isWallet?: boolean
  hideQR?: boolean
}

export function DigitalCardPreview({
  config,
  customerName = "María García",
  stampCount = 3,
  isWallet = false,
  hideQR = false,
}: DigitalCardProps) {
  const stamps = Array.from({ length: config.stampTotal }).map((_, i) => ({
    earned: i < stampCount,
    number: i + 1,
  }))

  // Default logo: always use the transparent PNG unless admin set a custom URL
  const logoSrc = config.logoUrl || "/images/crosti-logo-transparent.png"

  return (
    <div
      className={`digital-card-preview relative overflow-hidden rounded-2xl shadow-2xl transition-all duration-300 ${
        isWallet ? "w-full max-w-[340px] aspect-[1/1.6]" : "w-full max-w-[400px] aspect-[1.6/1]"
      }`}
      style={{
        backgroundColor: config.primaryColor,
        color: config.textColor,
        fontFamily: config.font || "Inter, sans-serif",
      }}
    >
      {/* Radial accent overlay */}
      <div
        className="absolute inset-0 opacity-25 mix-blend-overlay pointer-events-none"
        style={{
          background: `radial-gradient(circle at top right, ${config.accentColor} 0%, transparent 65%)`,
        }}
      />

      {/* Fine noise texture overlay for premium feel */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "150px",
        }}
      />

      <div className="relative h-full flex flex-col p-5 md:p-6">
        {/* Header: Logo + QR */}
        <div className="flex justify-between items-start mb-auto">
          <div className="flex flex-col gap-1">
            {/* Logo image — siempre visible */}
            <div className="relative h-9 w-28">
              <Image
                src={logoSrc}
                alt="Crosti Logo"
                fill
                className="object-contain object-left"
                unoptimized={logoSrc.startsWith("http")}
              />
            </div>
            <p className="text-xs font-semibold tracking-widest uppercase opacity-60">
              Tarjeta de Socio
            </p>
          </div>

          {!hideQR && (
            <div className="bg-white/95 p-1.5 rounded-xl shadow-md">
              <QRCode
                value={`https://crosti.es/club/sello`}
                size={isWallet ? 44 : 52}
                level="M"
              />
            </div>
          )}
        </div>

        {/* Stamps grid */}
        <div
          className={`grid gap-2 my-5 ${
            config.stampTotal > 8 ? "grid-cols-5" : "grid-cols-5"
          }`}
        >
          {stamps.map((stamp, i) => (
            <div
              key={i}
              className="aspect-square rounded-full flex items-center justify-center transition-all duration-500"
              style={{
                backgroundColor: stamp.earned
                  ? config.accentColor
                  : "rgba(255,255,255,0.12)",
                boxShadow: stamp.earned
                  ? `0 0 8px ${config.accentColor}60`
                  : "none",
              }}
            >
              {stamp.earned ? (
                /* Cookie icon when earned */
                <svg viewBox="0 0 24 24" className="w-1/2 h-1/2" fill="none">
                  <circle cx="12" cy="12" r="10" fill={config.primaryColor} opacity="0.8" />
                  <circle cx="9" cy="9" r="1.5" fill={config.primaryColor} />
                  <circle cx="14" cy="8" r="1" fill={config.primaryColor} />
                  <circle cx="15" cy="14" r="1.5" fill={config.primaryColor} />
                  <circle cx="9" cy="15" r="1" fill={config.primaryColor} />
                </svg>
              ) : (
                <span className="text-[10px] font-semibold opacity-40">
                  {stamp.number}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Footer: name + progress + reward */}
        <div className="mt-auto flex justify-between items-end">
          <div>
            <p className="text-sm font-semibold leading-tight opacity-90 truncate max-w-[140px]">
              {customerName}
            </p>
            <p className="text-xs opacity-55 mt-0.5">
              {stampCount} / {config.stampTotal} sellos
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest opacity-50 font-semibold mb-0.5">
              Premio
            </p>
            <p className="text-xs font-medium opacity-85 max-w-[120px] text-right leading-tight">
              {config.rewardDescription}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
