import Image from "next/image"

export function AboutSection() {
  return (
    <section id="nosotros" className="bg-[#F9E7AE]">
      {/* Top text section */}
      <div className="py-8 md:py-12 px-4 md:px-8 lg:px-16 text-center max-w-4xl mx-auto">
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#930021] mb-4 md:mb-6">Nosotros</h2>
        <p className="text-[#930021]/80 text-sm leading-relaxed">
          Crosti Cookies es un proyecto familiar creado por madre e hijas, nacido de una pasión compartida por la
          pastelería y con una visión clara: ofrecer cookies irresistibles, crujientes por fuera y suaves por dentro,
          con un toque artesanal y original. Inspiradas por años de experiencia en el rubro y por las tendencias
          actuales del mercado, nuestras galletas están pensadas para sorprender tanto por su sabor como por su estilo.
        </p>
      </div>

      <div className="grid md:grid-cols-2">
        {/* Left side - Cookie illustration and text */}
        <div className="bg-[#930021] py-8 md:py-12 px-6 md:px-8 flex flex-col items-center justify-center text-center">
  {/* Cookie illustration */}
  <div className="relative w-72 h-72 md:w-96 md:h-96 lg:w-[28rem] lg:h-[28rem] -mb-8 md:-mb-12">
    <Image src="/images/abrazo-crosti.png" alt="Crosti Cookies Hug" fill className="object-contain" />
  </div>

  <h3 className="text-[#F9E7AE] text-xl md:text-2xl font-bold mb-2 md:mb-3">Hecho con Amor</h3>
  <p className="text-[#F9E7AE]/90 text-sm leading-relaxed max-w-md">
    Cada galleta es una expresión de nuestro cariño familiar. Desde el primer mezcla hasta el último horneado,
    el amor de madre e hijas está presente en cada bocado, en cada receta, en cada detalle que nos apasiona.
  </p>
</div>

        {/* Right side - Person holding cookies image */}
        <div className="relative h-64 md:h-auto min-h-[280px] md:min-h-[320px] bg-[#930021] overflow-hidden">
          <Image src="/images/crosti-person.jpeg" alt="Crosti Cookies handmade" fill className="object-cover" />
        </div>
      </div>
    </section>
  )
}
