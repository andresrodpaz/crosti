import Image from "next/image"

export function CrostiHero() {
  return (
    <div className="min-h-screen bg-[#F8E19A] relative overflow-visible flex flex-col">

      {/* Mobile squiggle decoration */}
      <svg
        className="block sm:hidden absolute inset-0 w-full h-full pointer-events-none z-[10]"
        viewBox="0 0 390 844"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
        stroke="#9b001c"
        fill="none"
        strokeWidth="11"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M300 -50
             C280 0,290 80,320 100
             C330 110,345 95,340 80
             C335 65,320 70,318 85
             C315 200,350 220,380 240
             C410 260,410 380,380 420
             C360 450,380 500,390 560
             C392 580,380 600,370 620" />
      </svg>

      {/* Hero Content */}
      <section className="relative px-4 md:px-8 lg:px-16 py-8 flex-1 flex items-center">
        <div className="grid md:grid-cols-2 gap-8 items-center w-full max-w-7xl mx-auto relative z-20">
          <div className="space-y-6 text-left">
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-[#930021] leading-[1.1]">
              <span className="block">Fresh baked</span>
              <span className="block">cookies</span>
            </h1>
            <p className="text-[#930021] text-lg md:text-xl font-normal">
              Galletas artesanales hechas con amor desde Barcelona
            </p>
          </div>

          <div className="relative h-[400px] md:h-[500px] lg:h-[550px] flex items-center justify-center">
            <div className="relative w-full max-w-[450px] h-full rounded-[2rem] overflow-hidden shadow-2xl border-2 border-[#930021] z-[10]">
              <Image
                src="/images/crosti-cookies-hero.jpg"
                alt="Crosti Cookies Stack"
                fill
                className="object-cover object-center scale-115 transition-transform duration-700 ease-in-out hover:scale-125"
                priority
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}