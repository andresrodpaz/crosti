import Link from "next/link"
import {
  Info,
  BookOpen,
  FileText,
  AlertTriangle,
  Scale,
} from "lucide-react"

export const metadata = {
  title: "Aviso Legal | Crosti Cookies",
  description: "Aviso Legal y términos de uso de la página web de Crosti Cookies.",
}

export default function AvisoLegalPage() {
  return (
    <div className="min-h-screen bg-[#fffef9]">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#f8e19a]/30 to-[#fffef9] border-b border-[#f0e5d3]/50">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#930021] mb-6">
            Aviso Legal
          </h1>
          <p className="text-lg md:text-xl text-[#6b5b52] max-w-2xl mx-auto">
            Términos de uso e información legal de Crosti Cookies
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#f0e5d3] p-8 md:p-12">
          <div className="space-y-12 text-[#1a0a03]">
            
            {/* Introduction */}
            <div className="prose prose-lg max-w-none text-[#6b5b52]">
              <p>
                El presente Aviso Legal regula el acceso, navegación y uso del sitio web de <strong>Crosti Cookies</strong>. 
                Al acceder y utilizar esta web, adquieres la condición de usuario e implicas la aceptación plena y sin reservas 
                de todas y cada una de las disposiciones incluidas en este Aviso Legal.
              </p>
              <p className="text-sm italic mt-2">
                Última actualización: junio de 2026
              </p>
            </div>

            {/* Sections */}
            <PolicySection 
              icon={<Info />}
              title="1. Información General (LSSI-CE)"
            >
              <p>
                En cumplimiento con el deber de información recogido en el artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y del Comercio Electrónico (LSSI-CE), a continuación se reflejan los siguientes datos:
              </p>
              <ul className="list-disc pl-5 mt-3 space-y-2 text-[#6b5b52]">
                <li><strong>Denominación comercial:</strong> Crosti Cookies</li>
                <li><strong>Dirección:</strong> Carrer de Llull, 223, Sant Martí, 08005 Barcelona</li>
                <li><strong>Teléfono de contacto:</strong> +34 643 32 85 00</li>
                <li><strong>Correo electrónico:</strong> info@crosti.es</li>
                <li><strong>Actividad principal:</strong> Elaboración y venta de cookies artesanales.</li>
              </ul>
            </PolicySection>

            <PolicySection 
              icon={<BookOpen />}
              title="2. Propiedad Intelectual e Industrial"
            >
              <p>
                Crosti Cookies, por sí o como cesionaria, es titular de todos los derechos de propiedad intelectual e industrial de su página web, así como de los elementos contenidos en la misma (a título enunciativo: imágenes, sonido, audio, vídeo, software o textos, marcas o logotipos, combinaciones de colores, estructura y diseño, etc.).
              </p>
              <p className="mt-3">
                Cualquier uso no autorizado previamente por Crosti Cookies será considerado un incumplimiento grave de los derechos de propiedad intelectual o industrial del autor. Quedan expresamente prohibidas la reproducción, la distribución y la comunicación pública de la totalidad o parte de los contenidos de esta página web con fines comerciales, sin la autorización de Crosti Cookies.
              </p>
            </PolicySection>

            <PolicySection 
              icon={<FileText />}
              title="3. Condiciones de Uso"
            >
              <p>
                El usuario se compromete a hacer un uso adecuado de los contenidos y servicios que Crosti Cookies ofrece a través de su sitio web y con carácter enunciativo, pero no limitativo, a no emplearlos para:
              </p>
              <ul className="list-disc pl-5 mt-3 space-y-2 text-[#6b5b52]">
                <li>Incurrir en actividades ilícitas, ilegales o contrarias a la buena fe y al orden público.</li>
                <li>Difundir contenidos o propaganda de carácter racista, xenófobo, pornográfico-ilegal, de apología del terrorismo o atentatorio contra los derechos humanos.</li>
                <li>Provocar daños en los sistemas físicos y lógicos de Crosti Cookies, de sus proveedores o de terceras personas.</li>
                <li>Intentar acceder y, en su caso, utilizar las cuentas de correo electrónico de otros usuarios y modificar o manipular sus mensajes.</li>
              </ul>
            </PolicySection>

            <PolicySection 
              icon={<AlertTriangle />}
              title="4. Exclusión de Garantías y Responsabilidad"
            >
              <p>
                Crosti Cookies no se hace responsable, en ningún caso, de los daños y perjuicios de cualquier naturaleza que pudieran ocasionar, a título enunciativo: errores u omisiones en los contenidos, falta de disponibilidad del portal o la transmisión de virus o programas maliciosos o lesivos en los contenidos, a pesar de haber adoptado todas las medidas tecnológicas necesarias para evitarlo.
              </p>
              <p className="mt-3">
                Crosti Cookies se reserva el derecho a denegar o retirar el acceso a portal y/o los servicios ofrecidos sin necesidad de preaviso, a instancia propia o de un tercero, a aquellos usuarios que incumplan las presentes Condiciones Generales de Uso.
              </p>
            </PolicySection>

            <PolicySection 
              icon={<Scale />}
              title="5. Legislación Aplicable y Jurisdicción"
            >
              <p>
                La relación entre Crosti Cookies y el usuario se regirá por la normativa española vigente y cualquier controversia se someterá a los Juzgados y Tribunales de la ciudad de Barcelona, renunciando expresamente el usuario a cualquier otro fuero que pudiera corresponderle.
              </p>
            </PolicySection>

          </div>
        </div>
      </section>

      {/* Footer Contact Card & Return Button */}
      <section className="pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 bg-[#faf6ed] rounded-3xl p-8 border border-[#f0e5d3]">
          
          <div className="flex flex-col text-[#1a0a03]">
            <h3 className="text-xl font-bold text-[#930021] mb-2">Contacto</h3>
            <p className="font-semibold">Crosti Cookies</p>
            <p className="text-[#6b5b52]">Carrer de Llull, 223</p>
            <p className="text-[#6b5b52]">08005 Barcelona</p>
            <div className="mt-4 flex flex-col sm:flex-row sm:gap-6 gap-2">
              <a href="mailto:info@crosti.es" className="text-[#924c14] hover:text-[#930021] transition-colors font-medium">
                info@crosti.es
              </a>
              <a href="tel:+34643328500" className="text-[#924c14] hover:text-[#930021] transition-colors font-medium">
                +34 643 32 85 00
              </a>
            </div>
          </div>

          <Link 
            href="/"
            className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-[#f8e19a] bg-[#930021] rounded-full hover:bg-[#924c14] transition-all transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#930021] focus:ring-offset-2 whitespace-nowrap"
          >
            Volver a la tienda
          </Link>
          
        </div>
      </section>

    </div>
  )
}

function PolicySection({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="group">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-10 h-10 rounded-full bg-[#faf6ed] flex items-center justify-center text-[#930021] group-hover:bg-[#930021] group-hover:text-[#f8e19a] transition-colors duration-300 shadow-sm border border-[#f0e5d3]">
          {icon && (
            <div className="w-5 h-5 [&>svg]:w-full [&>svg]:h-full">
              {icon}
            </div>
          )}
        </div>
        <h2 className="text-2xl font-bold text-[#930021]">
          {title}
        </h2>
      </div>
      <hr className="border-[#f0e5d3] mb-6 transition-colors group-hover:border-[#930021]/20" />
      <div className="text-lg leading-relaxed text-[#1a0a03] ml-0 md:ml-14">
        {children}
      </div>
    </div>
  )
}
