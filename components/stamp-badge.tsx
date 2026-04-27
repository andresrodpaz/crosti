"use client"

import { generateStampPath } from "@/lib/stamp"

interface StampBadgeProps {
  text: string
  bgColor?: string
  textColor?: string
  className?: string
}

export function StampBadge({
  text,
  bgColor = "#930021",
  textColor = "#F9E7AE",
  className = "",
}: StampBadgeProps) {
  const path = generateStampPath(50, 50, 50, 42, 24)

  return (
    <div
      className={`absolute top-3 right-3 z-10 w-20 h-20 md:w-20 md:h-20 max-md:w-16 max-md:h-16 flex items-center justify-center text-center font-bold leading-tight ${className}`}
      style={{ color: textColor, fontSize: "11px" }}
    >
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" aria-hidden="true">
        <polygon points={path} fill={bgColor} />
      </svg>
      <span className="relative px-2">{text}</span>
    </div>
  )
}
