"use client"

import { useEffect, useRef } from "react"

export function CrostiHero() {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {})
    }
  }, [])

  return (
    <div className="min-h-screen bg-[#F8E19A] relative overflow-visible flex flex-col">

      {/* Keyframe styles */}
      <style>{`
        @keyframes shimmer-text {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes float-up {
          0%   { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes draw-underline {
          from { stroke-dashoffset: 300; }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes wiggle-in {
          0%   { transform: rotate(-2deg) scale(0.95); opacity: 0; }
          60%  { transform: rotate(1deg) scale(1.02); opacity: 1; }
          100% { transform: rotate(0deg) scale(1); opacity: 1; }
        }
        .hero-word-fresh {
          display: inline-block;
          animation: wiggle-in 0.7s cubic-bezier(.22,1,.36,1) 0.1s both;
        }
        .hero-word-baked {
          display: inline-block;
          animation: wiggle-in 0.7s cubic-bezier(.22,1,.36,1) 0.3s both;
        }
        .hero-word-cookies {
          display: inline-block;
          animation: wiggle-in 0.7s cubic-bezier(.22,1,.36,1) 0.5s both;
        }
        .hero-underline {
          stroke-dasharray: 300;
          stroke-dashoffset: 300;
          animation: draw-underline 0.9s ease-out 0.9s forwards;
        }
        .hero-subtitle {
          animation: float-up 0.8s cubic-bezier(.22,1,.36,1) 0.8s both;
        }
        .video-container {
          animation: float-up 0.9s cubic-bezier(.22,1,.36,1) 0.2s both;
        }
      `}</style>

      {/* Mobile squiggle decoration – fixed-size, anchored top-right */}
      <svg
        className="block sm:hidden absolute top-0 right-0 pointer-events-none z-[10]"
        width="118"
        height="370"
        viewBox="0 0 118 370"
        xmlns="http://www.w3.org/2000/svg"
        stroke="#9b001c"
        fill="none"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M93 -8
             C73 36, 108 88, 98 126
             C92 150, 76 145, 78 166
             C81 192, 110 201, 112 231
             C114 261, 98 290, 91 320
             C86 342, 98 354, 104 370" />
      </svg>

      {/* Hero Content */}
      <section className="relative px-4 md:px-8 lg:px-16 py-8 flex-1 flex items-center">
        <div className="grid md:grid-cols-2 gap-8 items-center w-full max-w-7xl mx-auto relative z-20">
          <div className="space-y-6 text-left">
            <h1
              className="font-bold text-[#930021] leading-[1.1] pr-10 sm:pr-0"
              style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)" }}
            >
              <span className="block">
                <span className="hero-word-fresh">Todo empieza&nbsp;</span>
                <span className="hero-word-baked">con un</span>
              </span>
              <span className="block relative">
                <span className="hero-word-cookies">Crr-Crr-unch!</span>
                {/* Animated wavy underline – hidden on mobile to avoid divider look */}
                <svg
                  className="absolute left-0 w-full overflow-visible hidden sm:block"
                  style={{ bottom: "-10px", height: "14px" }}
                  viewBox="0 0 260 14"
                  preserveAspectRatio="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    className="hero-underline"
                    d="M2 8 C30 2, 60 14, 90 8 S150 2, 180 8 S240 14, 260 8"
                    stroke="#930021"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>
            <p className="hero-subtitle text-[#930021] text-lg md:text-xl font-normal pr-10 sm:pr-0">
              Horneadas en Barcelona, shared everywhere.
            </p>
          </div>

          {/* Video container */}
          <div className="video-container relative h-[400px] md:h-[500px] lg:h-[550px] flex items-center justify-center">
            <div className="relative w-full max-w-[450px] h-full rounded-[2rem] overflow-hidden shadow-2xl border-2 border-[#930021] z-[10]">
              <video
                ref={videoRef}
                src="/images/video-hero.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
              {/* Subtle gradient overlay for polish */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(248,225,154,0.08) 0%, rgba(147,0,33,0.10) 100%)",
                }}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}