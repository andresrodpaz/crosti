"use client"

import { AlertCircle, CheckCircle, XCircle, Database, Code, Shield } from "lucide-react"

export default function FAQSection() {
  const faqs = [
    {
      category: "Base de Datos",
      icon: Database,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      questions: [
        {
          question: "Error: 'Could not find the table public.cookies in the schema cache'",
          answer:
            "La base de datos no ha sido inicializada. Ejecuta los scripts SQL en orden: 001_create_tables.sql, 002_seed_initial_data.sql, y 003_enable_rls.sql desde la carpeta scripts/",
          severity: "error",
        },
        {
          question: "Error: 'invalid input syntax for type uuid'",
          answer:
            "Se está intentando usar un timestamp como UUID. No incluyas el campo 'id' en los INSERT, deja que la base de datos genere los UUIDs automáticamente. Ejemplo: INSERT INTO cookies (name, ...) VALUES ('Cookie', ...)",
          severity: "error",
        },
        {
          question: "Las imágenes no se muestran",
          answer:
            "Verifica que las URLs en image_urls sean correctas. Las imágenes deben estar en public/ y las URLs deben empezar con /. Usa: UPDATE cookies SET image_urls = ARRAY['/images/cookie1.jpg'] WHERE id = 'uuid';",
          severity: "warning",
        },
      ],
    },
    {
      category: "Autenticación",
      icon: Shield,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      questions: [
        {
          question: "Error: 'No tienes permisos de desarrollador'",
          answer:
            "El usuario no tiene rol 'developer' o 'admin'. Ejecuta: UPDATE users SET role = 'developer' WHERE email = 'tu@email.com'; para actualizar el rol.",
          severity: "error",
        },
        {
          question: "¿Cómo cambio la contraseña de un usuario?",
          answer:
            "Las contraseñas deben estar hasheadas con bcrypt. Primero genera un hash con bcrypt.hashSync('nueva_contraseña', 10) en Node.js, luego ejecuta: UPDATE users SET password_hash = '$2b$10$[hash]' WHERE email = 'email@ejemplo.com';",
          severity: "info",
        },
        {
          question: "Warning: 'Multiple GoTrueClient instances'",
          answer:
            "Este warning es normal en desarrollo. El código ya usa el patrón singleton correctamente. Puedes ignorarlo, no afecta la funcionalidad.",
          severity: "info",
        },
      ],
    },
    {
      category: "API y Frontend",
      icon: Code,
      color: "text-green-600",
      bgColor: "bg-green-50",
      questions: [
        {
          question: "Error: 'SyntaxError: Unexpected token R, Request En... is not valid JSON'",
          answer:
            "El API está devolviendo un error HTML en lugar de JSON. Verifica que las tablas existan en la base de datos y que las políticas RLS estén configuradas. Revisa los logs del servidor para el error específico.",
          severity: "error",
        },
        {
          question: "Error: 'Missing closing } at :root'",
          answer:
            "Este es un error falso generado por el parser CSS de Tailwind v4. Ignora este error, no afecta la funcionalidad. El CSS está correctamente formado.",
          severity: "info",
        },
        {
          question: "Los cambios no se reflejan en tiempo real",
          answer:
            "Asegúrate de recargar los datos después de cada operación CRUD. El código ya incluye fetch('/api/cookies') después de guardar/eliminar. Si persiste, verifica que las transacciones se completen correctamente en Supabase.",
          severity: "warning",
        },
      ],
    },
  ]

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "error":
        return <XCircle className="w-5 h-5 text-red-500" />
      case "warning":
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
      default:
        return <CheckCircle className="w-5 h-5 text-blue-500" />
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "error":
        return <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">Error</span>
      case "warning":
        return (
          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
            Advertencia
          </span>
        )
      default:
        return <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">Info</span>
    }
  }

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Preguntas Frecuentes (FAQ)</h1>
        <p className="text-gray-500">Soluciones a problemas comunes en Crosti App</p>
      </div>

      <div className="space-y-6">
        {faqs.map((category, idx) => (
          <div key={idx} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className={`p-4 border-b border-gray-100 ${category.bgColor}`}>
              <div className="flex items-center gap-3">
                <category.icon className={`w-6 h-6 ${category.color}`} />
                <h2 className="text-lg font-semibold text-gray-900">{category.category}</h2>
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {category.questions.map((faq, qIdx) => (
                <details key={qIdx} className="group">
                  <summary className="px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors list-none">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">{getSeverityIcon(faq.severity)}</div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="font-medium text-gray-900 text-sm group-open:text-[#930021] transition-colors">
                            {faq.question}
                          </h3>
                          {getSeverityBadge(faq.severity)}
                        </div>
                      </div>
                    </div>
                  </summary>
                  <div className="px-6 pb-4 pl-14">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-gray-700 leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                </details>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Sección de ayuda adicional */}
      <div className="mt-8 bg-gradient-to-r from-[#930021] to-[#7a001a] rounded-2xl p-6 text-white">
        <h3 className="text-lg font-semibold mb-2">¿No encuentras tu problema?</h3>
        <p className="text-white/90 text-sm mb-4">
          Consulta la documentación completa en la sección "Documentación" o contacta al equipo de desarrollo.
        </p>
        <div className="flex gap-3">
          <a
            href="mailto:arodpaz.dev@gmail.com"
            className="px-4 py-2 bg-white text-[#930021] rounded-xl hover:bg-gray-100 transition-colors text-sm font-medium"
          >
            Contactar Soporte
          </a>
        </div>
      </div>
    </div>
  )
}
