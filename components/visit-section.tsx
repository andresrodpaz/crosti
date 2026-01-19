export function VisitSection() {
  return (
    <section id="contacto" className="bg-[#FEFCF5] py-12 md:py-16 px-4 md:px-8 lg:px-16">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#930021] mb-3 md:mb-4">
            Visítanos
          </h2>
          <p className="text-[#930021]/80 text-sm max-w-lg mx-auto">
            Ven a conocer nuestro taller en el corazón de Barcelona y prueba nuestras galletas recién horneadas
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start">
          {/* Left side - Info */}
          <div className="space-y-6 md:space-y-8">
            <div>
              <h3 className="text-[#930021] font-bold text-base md:text-lg mb-2">Ubicación</h3>
              <p className="text-[#930021]/80 text-sm mb-3">Carrer de Llul 223, Barcelona, Spain 08005</p>
              <a
                href="https://www.google.com/maps/search/?api=1&query=Carrer+de+Llul+223+Barcelona+08005"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-4 py-2 border border-[#930021] rounded-full text-[#930021] text-sm hover:bg-[#930021] hover:text-[#F9E7AE] transition-colors"
              >
                Ver en el mapa
              </a>
            </div>

            <div>
              <h3 className="text-[#930021] font-bold text-base md:text-lg mb-2">Horarios</h3>
              <div className="text-sm space-y-2">
                <div>
                  <p className="text-[#930021] font-medium">Lunes a Domingo</p>
                  <p className="text-[#930021]/70">11:00 - 20:00</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-[#930021] font-bold text-base md:text-lg mb-2">Contacto</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <p className="text-[#930021]/80">+34 931 234 567</p>
                <p className="text-[#930021]/80">hola@crosti.bcn</p>
              </div>
              <a
                href="https://instagram.com/crosticookies"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-3 px-4 py-2 border border-[#930021] rounded-full text-[#930021] text-sm hover:bg-[#930021] hover:text-[#F9E7AE] transition-colors"
              >
                @crosticookies
              </a>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-200 h-64 md:h-80">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2993.7!2d2.1891!3d41.3954!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12a4a31c5e5e5e5e%3A0x5e5e5e5e5e5e5e5e!2sCarrer%20de%20Llull%2C%20223%2C%2008005%20Barcelona%2C%20Spain!5e0!3m2!1sen!2sus!4v1699999999999!5m2!1sen!2sus"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicación Crosti Cookies"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
