"use client"

import { Shield, Pencil, Eye, Check, X } from "lucide-react"

type Permission = {
  name: string
  admin: boolean
  editor: boolean
  viewer: boolean
}

const permissions: Permission[] = [
  { name: "Ver dashboard", admin: true, editor: true, viewer: true },
  { name: "Ver galletas", admin: true, editor: true, viewer: true },
  { name: "Crear/editar galletas", admin: true, editor: true, viewer: false },
  { name: "Eliminar galletas", admin: true, editor: true, viewer: false },
  { name: "Gestionar carrusel", admin: true, editor: true, viewer: false },
  { name: "Exportar datos", admin: true, editor: true, viewer: false },
  { name: "Ver etiquetas", admin: true, editor: true, viewer: true },
  { name: "Crear/editar etiquetas", admin: true, editor: true, viewer: false },
  { name: "Eliminar etiquetas", admin: true, editor: true, viewer: false },
  { name: "Ver colores", admin: true, editor: true, viewer: true },
  { name: "Crear/editar colores", admin: true, editor: true, viewer: false },
  { name: "Eliminar colores", admin: true, editor: true, viewer: false },
  { name: "Ver usuarios", admin: true, editor: false, viewer: false },
  { name: "Crear/editar usuarios", admin: true, editor: false, viewer: false },
  { name: "Eliminar usuarios", admin: true, editor: false, viewer: false },
  { name: "Cambiar roles de usuarios", admin: true, editor: false, viewer: false },
]

export function RolesGuide() {
  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900">Guía de Roles</h2>
        <p className="text-gray-500 text-sm mt-1">Permisos y capacidades de cada tipo de usuario</p>
      </div>

      {/* Role Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-br from-violet-500 to-violet-600 rounded-2xl p-6 text-white">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Administrador</h3>
          <p className="text-white/80 text-sm">
            Acceso completo a todas las funciones. Puede gestionar usuarios, roles y toda la configuración del sistema.
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
            <Pencil className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Editor</h3>
          <p className="text-white/80 text-sm">
            Puede crear, editar y eliminar galletas, etiquetas y colores. No tiene acceso a la gestión de usuarios.
          </p>
        </div>

        <div className="bg-gradient-to-br from-gray-500 to-gray-600 rounded-2xl p-6 text-white">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
            <Eye className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Visualizador</h3>
          <p className="text-white/80 text-sm">
            Acceso de solo lectura. Puede ver el contenido pero no realizar modificaciones.
          </p>
        </div>
      </div>

      {/* Permissions Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Tabla de Permisos</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left py-3 px-5 text-sm font-medium text-gray-600">Permiso</th>
                <th className="text-center py-3 px-5 text-sm font-medium text-violet-600">Admin</th>
                <th className="text-center py-3 px-5 text-sm font-medium text-blue-600">Editor</th>
                <th className="text-center py-3 px-5 text-sm font-medium text-gray-600">Viewer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {permissions.map((permission, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="py-3 px-5 text-sm text-gray-700">{permission.name}</td>
                  <td className="py-3 px-5 text-center">
                    {permission.admin ? (
                      <Check className="w-5 h-5 text-green-500 mx-auto" />
                    ) : (
                      <X className="w-5 h-5 text-gray-300 mx-auto" />
                    )}
                  </td>
                  <td className="py-3 px-5 text-center">
                    {permission.editor ? (
                      <Check className="w-5 h-5 text-green-500 mx-auto" />
                    ) : (
                      <X className="w-5 h-5 text-gray-300 mx-auto" />
                    )}
                  </td>
                  <td className="py-3 px-5 text-center">
                    {permission.viewer ? (
                      <Check className="w-5 h-5 text-green-500 mx-auto" />
                    ) : (
                      <X className="w-5 h-5 text-gray-300 mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-8 bg-amber-50 border border-amber-200 rounded-2xl p-5">
        <h4 className="font-medium text-amber-800 mb-2">Notas importantes</h4>
        <ul className="text-sm text-amber-700 space-y-1">
          <li>• Solo los administradores pueden añadir nuevos usuarios al sistema.</li>
          <li>
            • Los editores pueden gestionar todo el contenido pero no pueden modificar permisos de otros usuarios.
          </li>
          <li>• Los visualizadores tienen acceso de solo lectura, ideal para supervisión.</li>
          <li>• El carrusel puede mostrar un máximo de 8 galletas.</li>
        </ul>
      </div>
    </div>
  )
}
