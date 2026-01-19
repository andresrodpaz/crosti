import Link from "next/link"
import { ArrowLeft, AlertCircle } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="mb-6 flex justify-center">
          <div className="bg-red-100 p-4 rounded-full">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Página no encontrada</h2>
        <p className="text-gray-600 mb-8">
          La ruta que intentaste acceder no existe. Verifica la URL e intenta de nuevo.
        </p>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#930021] text-white rounded-lg hover:bg-[#7a001b] transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}
