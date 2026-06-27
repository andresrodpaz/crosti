import Link from "next/link"
import {
  User,
  FileText,
  Target,
  Scale,
  Clock,
  Share2,
  MessageCircle,
  Share,
  Cookie,
  ShieldCheck,
  Building,
  Lock,
  RefreshCw,
} from "lucide-react"

export const metadata = {
  title: "Política de Privacidad | Crosti Cookies",
  description: "Política de Privacidad y protección de datos de Crosti Cookies.",
}

export default function PoliticaPrivacidadPage() {
  return (
    <div className="min-h-screen bg-[#fffef9]">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#f8e19a]/30 to-[#fffef9] border-b border-[#f0e5d3]/50">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#930021] mb-6">
            Política de Privacidad
          </h1>
          <p className="text-lg md:text-xl text-[#6b5b52] max-w-2xl mx-auto">
            Cómo protegemos tus datos en Crosti Cookies
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
                En <strong>Crosti Cookies</strong> valoramos tu privacidad y nos comprometemos a proteger tus datos personales. 
                Esta Política de Privacidad explica cómo recopilamos, utilizamos y salvaguardamos tu información 
                cuando visitas nuestra web y realizas pedidos de nuestras galletas artesanales.
              </p>
              <p className="text-sm italic mt-2">
                Última actualización: junio de 2026
              </p>
            </div>

            {/* Sections */}
            <PolicySection 
              icon={<User />}
              title="1. Responsable del tratamiento"
            >
              <p>
                El responsable del tratamiento de los datos recabados en este sitio web es:
              </p>
              <ul className="list-disc pl-5 mt-3 space-y-2 text-[#6b5b52]">
                <li><strong>Nombre comercial:</strong> Crosti Cookies</li>
                <li><strong>Dirección:</strong> Carrer de Llull, 223, Sant Martí, 08005 Barcelona</li>
                <li><strong>Teléfono:</strong> +34 643 32 85 00</li>
                <li><strong>Correo electrónico:</strong> info@crosti.es</li>
              </ul>
            </PolicySection>

            <PolicySection 
              icon={<FileText />}
              title="2. Datos personales recopilados"
            >
              <p>
                Recopilamos únicamente los datos personales estrictamente necesarios para la gestión de tus pedidos y consultas. Estos datos pueden incluir:
              </p>
              <ul className="list-disc pl-5 mt-3 space-y-2 text-[#6b5b52]">
                <li>Datos de identificación (nombre, apellidos).</li>
                <li>Datos de contacto (número de teléfono, correo electrónico).</li>
                <li>Datos de envío (dirección postal completa).</li>
                <li>Detalles del pedido realizado.</li>
              </ul>
            </PolicySection>

            <PolicySection 
              icon={<Target />}
              title="3. Finalidad del tratamiento"
            >
              <p>Tus datos personales son tratados con las siguientes finalidades:</p>
              <ul className="list-disc pl-5 mt-3 space-y-2 text-[#6b5b52]">
                <li>Gestionar y preparar los pedidos de cookies artesanales que realizas a través del formulario de la web.</li>
                <li>Contactar contigo vía WhatsApp para completar el proceso de compra, coordinar la entrega y enviar confirmaciones.</li>
                <li>Atender tus dudas, consultas o peticiones recibidas a través de nuestros canales de contacto.</li>
              </ul>
            </PolicySection>

            <PolicySection 
              icon={<Scale />}
              title="4. Base jurídica"
            >
              <p>
                La base legal para el tratamiento de tus datos es la <strong>ejecución de un contrato</strong> (la compra de nuestros productos) y el <strong>consentimiento expreso</strong> que nos otorgas al rellenar nuestros formularios de pedido o contacto.
              </p>
            </PolicySection>

            <PolicySection 
              icon={<Clock />}
              title="5. Conservación de datos"
            >
              <p>
                Los datos personales proporcionados se conservarán mientras se mantenga la relación comercial, no solicites su supresión y durante el plazo necesario para cumplir con las obligaciones legales aplicables.
              </p>
            </PolicySection>

            <PolicySection 
              icon={<Share2 />}
              title="6. Cesión de datos"
            >
              <p>
                No venderemos, cederemos ni distribuiremos la información personal que es recopilada sin tu consentimiento, salvo que sea requerido por un juez con un orden judicial. Tus datos únicamente podrán ser compartidos con empresas de mensajería exclusivamente para la entrega de tu pedido.
              </p>
            </PolicySection>

            <PolicySection 
              icon={<MessageCircle />}
              title="7. Uso de WhatsApp"
            >
              <p>
                Para facilitar un servicio cercano y directo, el proceso de finalización de pedidos se realiza a través de la aplicación WhatsApp. Al enviar tu pedido desde la web, aceptas ser contactado por esta vía. WhatsApp es un servicio prestado por Meta Platforms, Inc., y el uso de la aplicación está sujeto a sus propias políticas de privacidad.
              </p>
            </PolicySection>

            <PolicySection 
              icon={<Share />}
              title="8. Redes sociales"
            >
              <p>
                Crosti Cookies tiene presencia en redes sociales (Instagram, TikTok, Facebook y Pinterest). El tratamiento de los datos que se lleve a cabo de las personas que se hagan seguidoras en las redes sociales de nuestras páginas oficiales se regirá por este apartado, así como por las condiciones de uso, políticas de privacidad y normativas de acceso de cada red social.
              </p>
            </PolicySection>

            <PolicySection 
              icon={<Cookie />}
              title="9. Cookies técnicas del carrito"
            >
              <p>
                En Crosti Cookies creemos en una navegación limpia y sin rastreo. Por ello:
              </p>
              <ul className="list-disc pl-5 mt-3 space-y-2 text-[#6b5b52]">
                <li><strong>Solo utilizamos cookies técnicas estrictamente necesarias</strong> para que el carrito de compras funcione y puedas realizar tu pedido.</li>
                <li><strong>No utilizamos cookies analíticas</strong> (no usamos Google Analytics).</li>
                <li><strong>No utilizamos cookies publicitarias ni de seguimiento</strong> (no usamos Meta Pixel ni similares).</li>
              </ul>
              <p className="mt-3">
                Al tratarse de cookies técnicas exentas por ley, no es necesario recabar tu consentimiento para su instalación, ya que son imprescindibles para la prestación del servicio solicitado (la tienda online).
              </p>
            </PolicySection>

            <PolicySection 
              icon={<ShieldCheck />}
              title="10. Derechos del usuario"
            >
              <p>
                En cualquier momento puedes ejercer tus derechos de acceso, rectificación, cancelación, oposición, limitación del tratamiento y portabilidad de tus datos. Para ello, puedes enviarnos un correo electrónico a <strong>info@crosti.es</strong>, adjuntando una copia de tu DNI o documento equivalente que acredite tu identidad.
              </p>
            </PolicySection>

            <PolicySection 
              icon={<Building />}
              title="11. Agencia Española de Protección de Datos"
            >
              <p>
                Si consideras que hay un problema con la forma en que estamos manejando tus datos, tienes derecho a dirigir tus reclamaciones a la autoridad de protección de datos correspondiente, siendo la Agencia Española de Protección de Datos (AEPD) la indicada en el caso de España.
              </p>
            </PolicySection>

            <PolicySection 
              icon={<Lock />}
              title="12. Seguridad"
            >
              <p>
                Crosti Cookies está comprometido con la seguridad de tus datos. Empleamos medidas técnicas y organizativas adecuadas para proteger tu información personal contra el acceso no autorizado, la alteración, divulgación o destrucción.
              </p>
            </PolicySection>

            <PolicySection 
              icon={<RefreshCw />}
              title="13. Modificaciones de la política"
            >
              <p>
                Nos reservamos el derecho de modificar esta Política de Privacidad para adaptarla a novedades legislativas o jurisprudenciales, así como a prácticas de la industria. Te recomendamos revisar esta página periódicamente.
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
