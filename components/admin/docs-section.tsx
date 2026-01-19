"use client"

import { FileText, Database, Code, AlertCircle } from "lucide-react"

export default function DocsSection() {
  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Documentación Técnica</h1>
        <p className="text-gray-500">Guía completa para desarrolladores de Crosti App</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-[#930021] to-[#7a001a]">
          <div className="flex items-center gap-3 text-white">
            <FileText className="w-6 h-6" />
            <h2 className="text-xl font-semibold">Guía del Desarrollador</h2>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Stack Tecnológico */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Code className="w-5 h-5 text-[#930021]" />
              Stack Tecnológico
            </h3>
            <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
              <p className="flex items-center gap-2">
                <span className="font-medium text-gray-700">Frontend:</span>
                <span className="text-gray-600">Next.js 16, React 19.2, TypeScript</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="font-medium text-gray-700">Styling:</span>
                <span className="text-gray-600">Tailwind CSS v4</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="font-medium text-gray-700">Base de Datos:</span>
                <span className="text-gray-600">Supabase (PostgreSQL)</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="font-medium text-gray-700">Autenticación:</span>
                <span className="text-gray-600">Sistema custom con bcrypt</span>
              </p>
            </div>
          </section>

          {/* Base de Datos */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Database className="w-5 h-5 text-[#930021]" />
              Estructura de Base de Datos
            </h3>
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-900 mb-2 text-sm">Tabla: cookies</h4>
                <code className="text-xs text-gray-600 block whitespace-pre font-mono">
                  {`- id (UUID, PK)
- name (VARCHAR)
- description (TEXT)
- price (NUMERIC)
- ingredients (TEXT[])
- image_urls (TEXT[])
- main_image_index (INTEGER)
- is_visible (BOOLEAN)
- in_carousel (BOOLEAN)
- carousel_order (INTEGER)`}
                </code>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-900 mb-2 text-sm">Tabla: users</h4>
                <code className="text-xs text-gray-600 block whitespace-pre font-mono">
                  {`- id (UUID, PK)
- email (VARCHAR, UNIQUE)
- password_hash (VARCHAR)
- role (VARCHAR: 'admin', 'developer')`}
                </code>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-900 mb-2 text-sm">Tabla: tags</h4>
                <code className="text-xs text-gray-600 block whitespace-pre font-mono">
                  {`- id (UUID, PK)
- name (VARCHAR)
- color_id (UUID, FK -> colors)`}
                </code>
              </div>
            </div>
          </section>

          {/* Scripts SQL */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-[#930021]" />
              Scripts de Inicialización
            </h3>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-900 mb-3 font-medium">Ejecuta los scripts en este orden:</p>
              <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
                <li>
                  <code className="bg-blue-100 px-2 py-1 rounded text-xs">scripts/001_create_tables.sql</code> - Crea
                  todas las tablas
                </li>
                <li>
                  <code className="bg-blue-100 px-2 py-1 rounded text-xs">scripts/002_seed_initial_data.sql</code> -
                  Datos iniciales
                </li>
                <li>
                  <code className="bg-blue-100 px-2 py-1 rounded text-xs">scripts/003_enable_rls.sql</code> - Políticas
                  de seguridad
                </li>
              </ol>
            </div>
          </section>

          {/* Tareas Comunes */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Tareas de Mantenimiento Comunes</h3>
            <div className="space-y-3">
              <details className="bg-gray-50 rounded-xl overflow-hidden">
                <summary className="px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors font-medium text-gray-900 text-sm">
                  Cambiar rol de usuario
                </summary>
                <div className="px-4 pb-4">
                  <code className="text-xs text-gray-600 block whitespace-pre font-mono bg-gray-900 text-green-400 p-3 rounded">
                    {`UPDATE users 
SET role = 'admin' 
WHERE email = 'usuario@email.com';`}
                  </code>
                </div>
              </details>

              <details className="bg-gray-50 rounded-xl overflow-hidden">
                <summary className="px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors font-medium text-gray-900 text-sm">
                  Cambiar contraseña (requiere hash bcrypt)
                </summary>
                <div className="px-4 pb-4 space-y-2">
                  <p className="text-xs text-gray-600">
                    Primero genera un hash bcrypt de la nueva contraseña en Node.js
                  </p>
                  <code className="text-xs text-gray-600 block whitespace-pre font-mono bg-gray-900 text-green-400 p-3 rounded">
                    {`UPDATE users 
SET password_hash = '$2b$10$[hash_generado]'
WHERE email = 'usuario@email.com';`}
                  </code>
                </div>
              </details>

              <details className="bg-gray-50 rounded-xl overflow-hidden">
                <summary className="px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors font-medium text-gray-900 text-sm">
                  Actualizar orden del carrusel
                </summary>
                <div className="px-4 pb-4">
                  <code className="text-xs text-gray-600 block whitespace-pre font-mono bg-gray-900 text-green-400 p-3 rounded">
                    {`UPDATE cookies 
SET carousel_order = 1 
WHERE id = 'uuid-de-la-galleta';`}
                  </code>
                </div>
              </details>

              <details className="bg-gray-50 rounded-xl overflow-hidden">
                <summary className="px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors font-medium text-gray-900 text-sm">
                  Ver galletas con sus tags
                </summary>
                <div className="px-4 pb-4">
                  <code className="text-xs text-gray-600 block whitespace-pre font-mono bg-gray-900 text-green-400 p-3 rounded">
                    {`SELECT 
  c.name,
  c.price,
  c.is_visible,
  ARRAY_AGG(t.name) as tags
FROM cookies c
LEFT JOIN cookie_tags ct ON c.id = ct.cookie_id
LEFT JOIN tags t ON ct.tag_id = t.id
GROUP BY c.id, c.name, c.price, c.is_visible;`}
                  </code>
                </div>
              </details>
            </div>
          </section>

          {/* Descarga Guía Completa */}
          <section className="pt-4 border-t border-gray-100">
            <a
              href="/docs/DEVELOPER_GUIDE.md"
              download
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#930021] text-white rounded-xl hover:bg-[#7a001a] transition-colors text-sm font-medium"
            >
              <FileText className="w-4 h-4" />
              Descargar Guía Completa (Markdown)
            </a>
          </section>
        </div>
      </div>
    </div>
  )
}
