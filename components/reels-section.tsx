"use client"

import { useEffect, useRef, useState } from "react"

// Galería mixta: videos e imágenes alternados
const GALLERY_ITEMS = [
  { type: "video", src: "/reels/crosti-reel-1.mp4", caption: "Irresistibles" },
  { type: "image", src: "/reels/crosti-img-1.jpeg", caption: "Recién horneadas" },
  { type: "video", src: "/reels/crosti-reel-2.mp4", caption: "Pura tentación" },
  { type: "image", src: "/reels/crosti-img-2.jpeg", caption: "El momento perfecto" },
  { type: "video", src: "/reels/crosti-reel-3.mp4", caption: "Variedad de sabores" },
  { type: "image", src: "/reels/crosti-img-3.jpeg", caption: "Hechas con amor" },
  { type: "video", src: "/reels/crosti-reel-4.mp4", caption: "Para cada gusto" },
  { type: "image", src: "/reels/crosti-img-4.jpeg", caption: "Crosti vibes" },
  { type: "video", src: "/reels/crosti-reel-5.mp4", caption: "Cinnamon Roll" },
  { type: "image", src: "/reels/crosti-img-5.jpeg", caption: "Barcelona Bakery" },
  { type: "video", src: "/reels/crosti-reel-6.mp4", caption: "Edición limitada" },
  { type: "image", src: "/reels/crosti-img-6.jpeg", caption: "Con mucho amor" },
  { type: "video", src: "/reels/crosti-reel-7.mp4", caption: "Imprescindibles" },
  { type: "video", src: "/reels/crosti-reel-8.mp4", caption: "Fresh & golden" },
  { type: "video", src: "/reels/crosti-reel-9.mp4", caption: "Craft cookies" },
] as const

export function ReelsSection() {
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, scrollLeft: 0 })
  const [visible, setVisible] = useState(false)

  // Fade-in al montar
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100)
    return () => clearTimeout(t)
  }, [])

  // Autoplay todos los vídeos simultáneamente
  useEffect(() => {
    videoRefs.current.forEach((v) => {
      if (v) { v.muted = true; v.play().catch(() => null) }
    })
  }, [])

  // Auto-scroll loop
  useEffect(() => {
    let animationFrameId: number
    const scrollContainer = scrollRef.current
    if (!scrollContainer) return

    const scrollStep = () => {
      if (!isDragging && scrollContainer) {
        scrollContainer.scrollLeft += 0.8
        // Si llega al final o cerca, reiniciamos suavemente al inicio o dejamos que el usuario lo mueva
        if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth - scrollContainer.clientWidth - 5) {
            scrollContainer.scrollLeft = 0 // loop basic (puede modificarse si se quiere scroll infinito clonando)
        }
      }
      animationFrameId = requestAnimationFrame(scrollStep)
    }
    
    animationFrameId = requestAnimationFrame(scrollStep)
    return () => cancelAnimationFrame(animationFrameId)
  }, [isDragging])

  // Mouse-drag scroll
  const onMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return
    setIsDragging(true)
    setDragStart({ x: e.pageX - scrollRef.current.offsetLeft, scrollLeft: scrollRef.current.scrollLeft })
  }
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return
    e.preventDefault()
    const x    = e.pageX - scrollRef.current.offsetLeft
    const walk = (x - dragStart.x) * 1.5
    scrollRef.current.scrollLeft = dragStart.scrollLeft - walk
  }
  const onMouseUp = () => setIsDragging(false)

  return (
    <section
      id="reels"
      className="bg-[#FEFCF5] py-20 overflow-hidden"
      style={{ opacity: visible ? 1 : 0, transition: "opacity 0.6s ease" }}
    >
      {/* ── HEADER ── */}
      <div className="px-6 md:px-12 lg:px-20 mb-12 text-center">
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#930021] leading-tight">
          Crosti en imágenes
        </h2>
      </div>

      {/* ── CARRUSEL HORIZONTAL ── */}
      <div
        ref={scrollRef}
        className="flex gap-4 md:gap-5 overflow-x-auto pb-6 px-6 md:px-12 lg:px-20 cursor-grab active:cursor-grabbing select-none"
        style={{
          scrollBehavior: "auto",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        {GALLERY_ITEMS.map((item, idx) => (
          <div
            key={idx}
            className="group relative shrink-0 rounded-3xl overflow-hidden bg-zinc-900 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]"
            style={{
              scrollSnapAlign: "start",
              minWidth: "clamp(200px, 28vw, 320px)",
              height: "clamp(340px, 65vh, 580px)",
              opacity: 0,
              animation: `fadeUp 0.5s ease forwards ${idx * 0.06}s`,
            }}
          >
            {item.type === "image" ? (
              <img
                src={item.src}
                alt={item.caption}
                loading={idx < 4 ? "eager" : "lazy"}
                className="w-full h-full object-cover transition-all duration-[1.5s] ease-out group-hover:scale-110"
              />
            ) : (
              <video
                ref={(el) => { videoRefs.current[idx] = el }}
                src={item.src}
                muted
                loop
                playsInline
                autoPlay
                className="w-full h-full object-cover transition-all duration-[1.5s] ease-out group-hover:scale-110 pointer-events-none"
              />
            )}

            {/* Gradient oscuro sutil inferior */}
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            {/* Overlay central de Instagram / Premium Glow - Aparece en hover */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 bg-black/20 backdrop-blur-[2px] pointer-events-none">
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.3)] transform scale-50 group-hover:scale-100 transition-transform duration-500 cubic-bezier(0.34, 1.56, 0.64, 1)">
                <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── CTA CENTRADO ABAJO ── */}
      <div className="mt-12 flex justify-center">
        <a
          href="https://www.instagram.com/crosticookies"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#930021] text-[#F8E19A] font-bold text-lg hover:bg-[#7a001b] transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
          </svg>
          Síguenos en Instagram
        </a>
      </div>

      {/* Ocultar scrollbar nativo (Webkit) */}
      <style>{`.overflow-x-auto::-webkit-scrollbar { display: none; }`}</style>

      {/* Keyframes */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  )
}
