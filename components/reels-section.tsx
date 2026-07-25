"use client"

import { useEffect, useRef, useState } from "react"

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
  { type: "video", src: "/reels/crosti-reel-10.mp4", caption: "Brigadeiro Cookie" },
  { type: "video", src: "/reels/crosti-reel-11.mp4", caption: "Ice Cream and cookies" },
  { type: "video", src: "/reels/crosti-reel-12.mp4", caption: "Craft cookies" },
  { type: "video", src: "/reels/crosti-reel-13.mp4", caption: "Craft cookies" },
  { type: "video", src: "/reels/crosti-reel-14.mp4", caption: "Craft cookies" },
  { type: "video", src: "/reels/crosti-reel-15.mp4", caption: "Craft cookies" },

] as const

export function ReelsSection() {
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, scrollLeft: 0 })
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    videoRefs.current.forEach((v) => {
      if (v) { v.muted = true; v.play().catch(() => null) }
    })
  }, [])

  useEffect(() => {
    let animationFrameId: number
    const scrollContainer = scrollRef.current
    if (!scrollContainer) return

    const scrollStep = () => {
      if (!isDragging && scrollContainer) {
        scrollContainer.scrollLeft += 0.8
        if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth - scrollContainer.clientWidth - 5) {
          scrollContainer.scrollLeft = 0
        }
      }
      animationFrameId = requestAnimationFrame(scrollStep)
    }

    animationFrameId = requestAnimationFrame(scrollStep)
    return () => cancelAnimationFrame(animationFrameId)
  }, [isDragging])

  const onMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return
    setIsDragging(true)
    setDragStart({ x: e.pageX - scrollRef.current.offsetLeft, scrollLeft: scrollRef.current.scrollLeft })
  }
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return
    e.preventDefault()
    const x = e.pageX - scrollRef.current.offsetLeft
    const walk = (x - dragStart.x) * 1.5
    scrollRef.current.scrollLeft = dragStart.scrollLeft - walk
  }
  const onMouseUp = () => setIsDragging(false)

  return (
    <section
      id="reels"
      className="bg-[#FEFCF5] overflow-hidden
        py-10
        sm:py-14
        md:py-16
        lg:py-20
      "
      style={{ opacity: visible ? 1 : 0, transition: "opacity 0.6s ease" }}
    >
      {/* ── HEADER ── */}
      <div className="mb-8 text-center
        px-4
        sm:px-8 sm:mb-10
        md:px-12 md:mb-12
        lg:px-20
      ">
        <h2 className="font-bold text-[#930021] leading-tight
          text-3xl
          sm:text-4xl
          md:text-5xl
          lg:text-6xl
        ">
          Crosti Vibes
        </h2>
      </div>

      {/* ── CARRUSEL ── */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto pb-4 cursor-grab active:cursor-grabbing select-none
          gap-3 px-4
          sm:gap-4 sm:px-8
          md:gap-5 md:px-12
          lg:px-20
        "
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
            className="group relative shrink-0 rounded-2xl overflow-hidden bg-zinc-900 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] block"
            style={{
              scrollSnapAlign: "start",
              opacity: 0,
              animation: `fadeUp 0.5s ease forwards ${idx * 0.06}s`,
              WebkitMaskImage: "-webkit-radial-gradient(white, black)",
              transform: "translateZ(0)",
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

            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          </div>
        ))}
      </div>

      {/* ── CTA ── */}
      <div className="flex justify-center
        mt-8
        sm:mt-10
        md:mt-12
      ">
        <a
          href="https://www.instagram.com/crosticookies"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-[#930021] text-[#F8E19A] font-bold hover:bg-[#7a001b] transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg
            px-6 py-3 text-base
            sm:px-7 sm:py-3.5 sm:text-base
            md:px-8 md:py-4 md:text-lg
          "
        >
          <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
          </svg>
          Síguenos en Instagram
        </a>
      </div>

      <style>{`.overflow-x-auto::-webkit-scrollbar { display: none; }`}</style>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Tamaños de tarjeta por breakpoint */

        /* iPhone SE / pequeños (< 390px) */
        @media (min-width: 0px) {
          #reels .shrink-0 {
            min-width: 150px !important;
            width: 150px !important;
            height: 265px !important;
            flex: 0 0 150px !important;
          }
        }

        /* iPhone 14 / Android normal (390px - 430px) */
        @media (min-width: 390px) {
          #reels .shrink-0 {
            min-width: 165px !important;
            width: 165px !important;
            height: 290px !important;
            flex: 0 0 165px !important;
          }
        }

        /* iPhone 14 Pro Max / grandes (430px+) */
        @media (min-width: 430px) {
          #reels .shrink-0 {
            min-width: 175px !important;
            width: 175px !important;
            height: 310px !important;
            flex: 0 0 175px !important;
          }
        }

        /* iPad mini / tablet portrait (768px) */
        @media (min-width: 768px) {
          #reels .shrink-0 {
            min-width: 220px !important;
            width: 220px !important;
            height: 380px !important;
            flex: 0 0 220px !important;
          }
        }

        /* iPad Pro / tablet landscape (1024px) */
        @media (min-width: 1024px) {
          #reels .shrink-0 {
            min-width: 260px !important;
            width: 260px !important;
            height: 450px !important;
            flex: 0 0 260px !important;
          }
        }

        /* MacBook 13" / laptop (1280px) */
        @media (min-width: 1280px) {
          #reels .shrink-0 {
            min-width: 280px !important;
            width: 280px !important;
            height: 490px !important;
            flex: 0 0 280px !important;
          }
        }

        /* MacBook 16" / desktop (1440px+) */
        @media (min-width: 1440px) {
          #reels .shrink-0 {
            min-width: 300px !important;
            width: 300px !important;
            height: 530px !important;
            flex: 0 0 300px !important;
          }
        }

        /* 4K / ultrawide (1920px+) */
        @media (min-width: 1920px) {
          #reels .shrink-0 {
            min-width: 320px !important;
            width: 320px !important;
            height: 570px !important;
            flex: 0 0 320px !important;
          }
        }
      `}</style>
    </section >
  )
}