"use client"

import { useState } from "react"
import {
  BookOpen,
  Cookie,
  Package,
  Sparkles,
  Tag,
  Palette,
  ShoppingBag,
  ChevronDown,
  ChevronUp,
  CircleDot,
  CheckCircle2,
  Info,
  AlertCircle,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Star,
  Download,
  Search,
  Settings,
  BarChart3,
  Users,
  Calendar,
  FileDown,
} from "lucide-react"

interface Step {
  title: string
  description: string
  icon?: React.ElementType
}

interface Action {
  title: string
  description: string
  icon: React.ElementType
  color: string
  bgColor: string
}

interface Guide {
  id: string
  title: string
  subtitle: string
  icon: React.ElementType
  color: string
  bgColor: string
  description: string
  mainActions: Action[]
  additionalActions?: Action[]
  steps: Step[]
  tips?: string[]
  warnings?: string[]
  shortcuts?: string[]
}

const GUIDES: Guide[] = [
  {
    id: "cookies",
    title: "Gestionar Galletas",
    subtitle: "Productos principales del catálogo",
    icon: Cookie,
    color: "text-amber-600",
    bgColor: "bg-amber-50 border-amber-200",
    description: "Las galletas son el corazón de tu negocio. Gestiona el catálogo completo con todas las funcionalidades disponibles.",
    mainActions: [
      {
        title: "Crear nueva galleta",
        description: "Añade productos al catálogo con fotos, ingredientes y precios",
        icon: Plus,
        color: "text-green-600",
        bgColor: "bg-green-50",
      },
      {
        title: "Editar galletas",
        description: "Modifica información, precios, fotos e ingredientes existentes",
        icon: Pencil,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
      },
      {
        title: "Controlar visibilidad",
        description: "Muestra u oculta galletas en la tienda online",
        icon: Eye,
        color: "text-emerald-600",
        bgColor: "bg-emerald-50",
      },
      {
        title: "Gestionar carrusel",
        description: "Destaca galletas en la página principal (máx. 8)",
        icon: Star,
        color: "text-amber-600",
        bgColor: "bg-amber-50",
      },
      {
        title: "Eliminar galletas",
        description: "Remueve productos del catálogo permanentemente",
        icon: Trash2,
        color: "text-red-600",
        bgColor: "bg-red-50",
      },
    ],
    additionalActions: [
      {
        title: "Ver detalles completos",
        description: "Accede a información detallada de cada galleta",
        icon: Eye,
        color: "text-purple-600",
        bgColor: "bg-purple-50",
      },
      {
        title: "Buscar y filtrar",
        description: "Encuentra galletas por nombre, etiquetas o visibilidad",
        icon: Search,
        color: "text-gray-600",
        bgColor: "bg-gray-50",
      },
      {
        title: "Exportar catálogo",
        description: "Descarga el listado completo en formato CSV",
        icon: Download,
        color: "text-indigo-600",
        bgColor: "bg-indigo-50",
      },
    ],
    steps: [
      {
        title: "Accede a la sección Galletas",
        description: 'Desde el menú lateral izquierdo, haz clic en "Galletas". Verás el listado completo de productos.',
        icon: Cookie,
      },
      {
        title: "Crear una nueva galleta",
        description: 'Pulsa el botón "Nueva Galleta" en la parte superior derecha. Completa todos los campos requeridos.',
        icon: Plus,
      },
      {
        title: "Configurar información básica",
        description: "Añade nombre, descripción detallada, precio y lista de ingredientes separados por comas.",
        icon: Settings,
      },
      {
        title: "Subir imágenes de calidad",
        description: "Arrastra o selecciona fotos. Marca la imagen principal y añade hasta 3 fotos adicionales para hover.",
        icon: Download,
      },
      {
        title: "Asignar etiquetas",
        description: 'Selecciona etiquetas como "Vegano", "Sin Gluten", etc. Si no existen, créalas primero en la sección Etiquetas.',
        icon: Tag,
      },
      {
        title: "Configurar visibilidad y promoción",
        description: 'Activa "Visible en tienda" para mostrar en catálogo. Marca "Mostrar en carrusel" para destacar en portada.',
        icon: Eye,
      },
      {
        title: "Editar galletas existentes",
        description: "Haz clic en el botón de lápiz (✏️) en cualquier galleta para modificar su información.",
        icon: Pencil,
      },
      {
        title: "Controlar visibilidad rápida",
        description: "Usa el botón de ojo (👁️) para mostrar/ocultar galletas sin editar todo el formulario.",
        icon: Eye,
      },
      {
        title: "Gestionar carrusel destacado",
        description: "Haz clic en la estrella (⭐) para añadir/quitar galletas del carrusel de la página principal.",
        icon: Star,
      },
      {
        title: "Eliminar productos",
        description: "Usa el botón de papelera (🗑️) para eliminar galletas. Confirma la acción en el modal.",
        icon: Trash2,
      },
    ],
    tips: [
      "Las imágenes cuadradas o con ratio 4:5 se ven mejor en la tienda",
      "El orden del carrusel determina qué galletas aparecen primero en portada",
      "Puedes ocultar galletas temporalmente sin eliminarlas",
      "Las etiquetas ayudan a los clientes a filtrar productos por preferencias",
      "Máximo 8 galletas pueden estar en el carrusel simultáneamente",
      "Usa la búsqueda para encontrar galletas rápidamente por nombre",
      "Exporta el catálogo periódicamente como respaldo",
    ],
    warnings: [
      "Eliminar una galleta es irreversible - se perderán todos los datos",
      "Las galletas ocultas no aparecen en la tienda pero siguen existiendo",
      "Cambiar el precio afecta inmediatamente a la tienda online",
    ],
    shortcuts: [
      "⭐ Clic en estrella = toggle carrusel",
      "👁️ Clic en ojo = toggle visibilidad",
      "✏️ Clic en lápiz = editar galleta",
      "🗑️ Clic en papelera = eliminar",
      "🔍 Barra de búsqueda superior",
      "📊 Filtros por etiquetas y visibilidad",
    ],
  },
  {
    id: "boxes",
    title: "Gestionar Cajas",
    subtitle: "Productos empaquetados predefinidos",
    icon: Package,
    color: "text-rose-600",
    bgColor: "bg-rose-50 border-rose-200",
    description: "Las cajas son productos cerrados con combinaciones fijas de galletas, ideales para regalos o ventas predefinidas.",
    mainActions: [
      {
        title: "Crear nueva caja",
        description: "Define cajas con combinaciones específicas de galletas",
        icon: Plus,
        color: "text-green-600",
        bgColor: "bg-green-50",
      },
      {
        title: "Editar composición",
        description: "Modifica galletas incluidas, cantidades y precios",
        icon: Pencil,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
      },
      {
        title: "Controlar visibilidad",
        description: "Muestra u oculta cajas en la tienda",
        icon: Eye,
        color: "text-emerald-600",
        bgColor: "bg-emerald-50",
      },
      {
        title: "Eliminar cajas",
        description: "Remueve cajas del catálogo",
        icon: Trash2,
        color: "text-red-600",
        bgColor: "bg-red-50",
      },
    ],
    steps: [
      {
        title: "Accede a la sección Cajas",
        description: 'Haz clic en "Cajas" en el menú lateral. Las cajas son productos con galletas predefinidas.',
        icon: Package,
      },
      {
        title: "Crear una nueva caja",
        description: 'Pulsa "Nueva Caja". Define nombre atractivo, descripción y precio total.',
        icon: Plus,
      },
      {
        title: "Añadir imagen representativa",
        description: "Sube una foto que muestre las galletas incluidas de forma atractiva.",
        icon: Download,
      },
      {
        title: "Seleccionar galletas incluidas",
        description: "Elige qué galletas contiene la caja y especifica las cantidades de cada una.",
        icon: Cookie,
      },
      {
        title: "Configurar orden de visualización",
        description: "Define la posición de la caja en la sección (número más bajo = aparece antes).",
        icon: Settings,
      },
      {
        title: "Activar visibilidad",
        description: 'Marca "Visible" para que aparezca en la tienda online.',
        icon: Eye,
      },
      {
        title: "Editar cajas existentes",
        description: "Haz clic en el botón editar de cualquier caja para modificar su composición.",
        icon: Pencil,
      },
    ],
    tips: [
      "Las cajas son perfectas para regalos o clientes indecisos",
      "Usa imágenes atractivas que muestren el contenido",
      "El precio total debe ser competitivo comparado con comprar individualmente",
      "Actualiza la visibilidad según disponibilidad de ingredientes",
      "El orden de visualización afecta la posición en la tienda",
    ],
    warnings: [
      "Si eliminas una galleta usada en cajas, desaparecerá automáticamente de todas las cajas",
      "Los cambios de precio afectan inmediatamente a la tienda",
      "Las cajas ocultas no se muestran pero siguen existiendo",
    ],
  },
  {
    id: "banners",
    title: "Gestionar Banners",
    subtitle: "Anuncios y promociones destacados",
    icon: Sparkles,
    color: "text-pink-600",
    bgColor: "bg-pink-50 border-pink-200",
    description: "Los banners aparecen en la parte superior de la página principal y tienda, perfectos para promociones y novedades.",
    mainActions: [
      {
        title: "Crear nuevo banner",
        description: "Añade anuncios con título, subtítulo y colores personalizados",
        icon: Plus,
        color: "text-green-600",
        bgColor: "bg-green-50",
      },
      {
        title: "Editar contenido",
        description: "Modifica textos, colores y enlaces de banners existentes",
        icon: Pencil,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
      },
      {
        title: "Controlar activación",
        description: "Activa o desactiva banners según necesidad",
        icon: Eye,
        color: "text-emerald-600",
        bgColor: "bg-emerald-50",
      },
      {
        title: "Eliminar banners",
        description: "Remueve banners antiguos o caducados",
        icon: Trash2,
        color: "text-red-600",
        bgColor: "bg-red-50",
      },
    ],
    steps: [
      {
        title: "Accede a la sección Banners",
        description: 'Haz clic en "Banners" en el menú lateral. Gestiona anuncios destacados.',
        icon: Sparkles,
      },
      {
        title: "Crear nuevo banner",
        description: 'Pulsa "Nuevo Banner". Escribe título llamativo y subtítulo explicativo.',
        icon: Plus,
      },
      {
        title: "Personalizar colores",
        description: "Elige colores de fondo y texto. Por defecto usa el burdeos de la marca.",
        icon: Palette,
      },
      {
        title: "Añadir enlace opcional",
        description: "Si el banner debe llevar a alguna página, añade URL y texto del enlace.",
        icon: Settings,
      },
      {
        title: "Definir orden de rotación",
        description: "Los banners activos rotan cada 5 segundos según su orden.",
        icon: Settings,
      },
      {
        title: "Activar el banner",
        description: 'Marca como "Activo" para que aparezca en la web.',
        icon: Eye,
      },
    ],
    tips: [
      "Los banners son ideales para anunciar nuevos sabores o promociones",
      "Mantén títulos cortos (máximo 50 caracteres) para móviles",
      "Usa colores que contrasten bien con el texto blanco",
      "Desactiva banners caducados en lugar de eliminarlos",
      "Los banners rotan automáticamente cada 5 segundos",
    ],
  },
  {
    id: "tags",
    title: "Gestionar Etiquetas",
    subtitle: "Clasificación y filtros de productos",
    icon: Tag,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50 border-emerald-200",
    description: "Las etiquetas clasifican las galletas y aparecen como badges sobre las imágenes, ayudando a filtrar por preferencias.",
    mainActions: [
      {
        title: "Crear nuevas etiquetas",
        description: "Añade clasificadores como 'Vegano', 'Sin Gluten', etc.",
        icon: Plus,
        color: "text-green-600",
        bgColor: "bg-green-50",
      },
      {
        title: "Editar etiquetas",
        description: "Modifica nombres y colores de etiquetas existentes",
        icon: Pencil,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
      },
      {
        title: "Eliminar etiquetas",
        description: "Remueve etiquetas no utilizadas",
        icon: Trash2,
        color: "text-red-600",
        bgColor: "bg-red-50",
      },
    ],
    steps: [
      {
        title: "Accede a la sección Etiquetas",
        description: 'Haz clic en "Etiquetas". Gestiona los clasificadores de productos.',
        icon: Tag,
      },
      {
        title: "Crear nueva etiqueta",
        description: "Escribe el nombre (ej: 'Vegano') y selecciona un color del catálogo.",
        icon: Plus,
      },
      {
        title: "Seleccionar color",
        description: "Elige un color predefinido o crea uno nuevo en la sección Colores.",
        icon: Palette,
      },
      {
        title: "Asignar a galletas",
        description: 'Ve a "Galletas" y selecciona las etiquetas correspondientes en cada producto.',
        icon: Cookie,
      },
    ],
    tips: [
      "Usa etiquetas consistentes (evita 'Sin gluten' y 'Sin Gluten')",
      "Cada galleta puede tener múltiples etiquetas",
      "Solo se muestran máximo 2 etiquetas por galleta en la tienda",
      "Los colores deben contrastar con texto blanco",
    ],
    warnings: [
      "Eliminar una etiqueta la quita de todas las galletas que la usan",
      "Si eliminas un color usado por etiquetas, mantendrán su color actual",
    ],
  },
  {
    id: "colors",
    title: "Gestionar Colores",
    subtitle: "Paleta de colores para etiquetas",
    icon: Palette,
    color: "text-violet-600",
    bgColor: "bg-violet-50 border-violet-200",
    description: "Define la paleta de colores disponible para crear etiquetas. Cada color puede reutilizarse en múltiples etiquetas.",
    mainActions: [
      {
        title: "Añadir colores",
        description: "Crea nuevos colores con nombre y código hexadecimal",
        icon: Plus,
        color: "text-green-600",
        bgColor: "bg-green-50",
      },
      {
        title: "Eliminar colores",
        description: "Remueve colores no utilizados de la paleta",
        icon: Trash2,
        color: "text-red-600",
        bgColor: "bg-red-50",
      },
    ],
    steps: [
      {
        title: "Accede a la sección Colores",
        description: 'Haz clic en "Colores". Gestiona la paleta disponible para etiquetas.',
        icon: Palette,
      },
      {
        title: "Añadir nuevo color",
        description: "Escribe nombre descriptivo y código hexadecimal (#FF0000).",
        icon: Plus,
      },
      {
        title: "Usar selector de color",
        description: "Facilita encontrar el código exacto del color deseado.",
        icon: Settings,
      },
    ],
    tips: [
      "Define 6-8 colores variados para buena cobertura visual",
      "Asegura que los colores contrasten con texto blanco",
      "Usa nombres descriptivos (Verde Esmeralda, Rojo Carmín)",
    ],
    warnings: [
      "Eliminar un color usado por etiquetas no las afecta (mantienen su color)",
      "Los colores eliminados desaparecen de futuras selecciones",
    ],
  },
  {
    id: "orders",
    title: "Gestionar Pedidos",
    subtitle: "Procesamiento y seguimiento de órdenes",
    icon: ShoppingBag,
    color: "text-orange-600",
    bgColor: "bg-orange-50 border-orange-200",
    description: "Gestiona todos los pedidos de clientes, actualiza estados y descarga facturas. Actualmente los pedidos se registran manualmente.",
    mainActions: [
      {
        title: "Ver detalles completos",
        description: "Accede a información detallada de cada pedido",
        icon: Eye,
        color: "text-purple-600",
        bgColor: "bg-purple-50",
      },
      {
        title: "Actualizar estados",
        description: "Cambia el estado del pedido según progreso",
        icon: Settings,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
      },
      {
        title: "Buscar pedidos",
        description: "Encuentra pedidos por nombre, email o número",
        icon: Search,
        color: "text-gray-600",
        bgColor: "bg-gray-50",
      },
      {
        title: "Descargar facturas",
        description: "Genera PDFs de facturas para clientes",
        icon: FileDown,
        color: "text-indigo-600",
        bgColor: "bg-indigo-50",
      },
      {
        title: "Ver estadísticas",
        description: "Accede a métricas y análisis de ventas",
        icon: BarChart3,
        color: "text-teal-600",
        bgColor: "bg-teal-50",
      },
    ],
    steps: [
      {
        title: "Accede a la sección Pedidos",
        description: 'Haz clic en "Pedidos". Verás el listado ordenado por fecha.',
        icon: ShoppingBag,
      },
      {
        title: "Ver detalle de pedido",
        description: "Haz clic en cualquier pedido para ver información completa del cliente.",
        icon: Eye,
      },
      {
        title: "Actualizar estado",
        description: "Cambia entre: Pendiente → Confirmado → Preparación → Listo → Enviado → Entregado.",
        icon: Settings,
      },
      {
        title: "Buscar y filtrar",
        description: "Usa la barra de búsqueda o filtros por estado para encontrar pedidos.",
        icon: Search,
      },
      {
        title: "Descargar factura",
        description: "Desde el detalle, genera PDF de factura para el cliente.",
        icon: FileDown,
      },
    ],
    tips: [
      "Mantén los estados actualizados para que clientes puedan hacer seguimiento",
      "Los pedidos nuevos aparecen como 'Pendiente' hasta confirmarlos",
      "Usa la búsqueda para encontrar pedidos específicos rápidamente",
      "Las facturas incluyen todos los detalles del pedido",
    ],
    warnings: [
      "Por ahora los pedidos online están desactivados",
      "Los pedidos se gestionan manualmente desde WhatsApp",
      "Asegúrate de confirmar pedidos antes de procesarlos",
    ],
  },
]

export function GuidesAdmin() {
  const [openGuide, setOpenGuide] = useState<string | null>("cookies")
  const [activeTab, setActiveTab] = useState<"overview" | "actions" | "steps">("overview")

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-[#930021] rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Centro de Ayuda</h1>
            <p className="text-gray-500 mt-1">
              Guías completas para gestionar todas las funcionalidades del panel de administración
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {GUIDES.map((guide) => {
          const isOpen = openGuide === guide.id
          const Icon = guide.icon
          return (
            <div
              key={guide.id}
              className={`rounded-2xl border bg-white overflow-hidden transition-all duration-300 ${
                isOpen ? "shadow-lg border-gray-200" : "border-gray-100 hover:border-gray-200 hover:shadow-md"
              }`}
            >
              {/* Header */}
              <button
                className="w-full flex items-center justify-between p-6 text-left group"
                onClick={() => setOpenGuide(isOpen ? null : guide.id)}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${guide.bgColor}`}>
                    <Icon className={`w-6 h-6 ${guide.color}`} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 group-hover:text-[#930021] transition-colors">
                      {guide.title}
                    </h2>
                    <p className="text-gray-600 text-sm">{guide.subtitle}</p>
                    <p className="text-gray-500 text-sm mt-1 max-w-2xl">{guide.description}</p>
                  </div>
                </div>
                {isOpen ? (
                  <ChevronUp className="w-6 h-6 text-gray-400 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-6 h-6 text-gray-400 flex-shrink-0" />
                )}
              </button>

              {/* Body */}
              {isOpen && (
                <div className="border-t border-gray-50">
                  {/* Tabs */}
                  <div className="px-6 pt-6">
                    <div className="flex gap-1 bg-gray-50 rounded-lg p-1">
                      <button
                        onClick={() => setActiveTab("overview")}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          activeTab === "overview"
                            ? "bg-white text-gray-900 shadow-sm"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        Resumen
                      </button>
                      <button
                        onClick={() => setActiveTab("actions")}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          activeTab === "actions"
                            ? "bg-white text-gray-900 shadow-sm"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        Acciones
                      </button>
                      <button
                        onClick={() => setActiveTab("steps")}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          activeTab === "steps"
                            ? "bg-white text-gray-900 shadow-sm"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        Guía Paso a Paso
                      </button>
                    </div>
                  </div>

                  <div className="p-6">
                    {/* Overview Tab */}
                    {activeTab === "overview" && (
                      <div className="space-y-6">
                        {/* Main Actions Grid */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Settings className="w-5 h-5" />
                            Acciones Principales
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {guide.mainActions.map((action, index) => {
                              const ActionIcon = action.icon
                              return (
                                <div
                                  key={index}
                                  className={`p-4 rounded-xl border ${action.bgColor} border-gray-200 hover:shadow-md transition-shadow`}
                                >
                                  <div className="flex items-start gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${action.bgColor}`}>
                                      <ActionIcon className={`w-4 h-4 ${action.color}`} />
                                    </div>
                                    <div className="flex-1">
                                      <h4 className="font-medium text-gray-900 text-sm">{action.title}</h4>
                                      <p className="text-gray-600 text-xs mt-1">{action.description}</p>
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>

                        {/* Additional Actions */}
                        {guide.additionalActions && guide.additionalActions.length > 0 && (
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                              <Plus className="w-5 h-5" />
                              Acciones Adicionales
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {guide.additionalActions.map((action, index) => {
                                const ActionIcon = action.icon
                                return (
                                  <div
                                    key={index}
                                    className={`p-4 rounded-xl border ${action.bgColor} border-gray-200 hover:shadow-md transition-shadow`}
                                  >
                                    <div className="flex items-start gap-3">
                                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${action.bgColor}`}>
                                        <ActionIcon className={`w-4 h-4 ${action.color}`} />
                                      </div>
                                      <div className="flex-1">
                                        <h4 className="font-medium text-gray-900 text-sm">{action.title}</h4>
                                        <p className="text-gray-600 text-xs mt-1">{action.description}</p>
                                      </div>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}

                        {/* Tips */}
                        {guide.tips && guide.tips.length > 0 && (
                          <div className="rounded-xl bg-blue-50 border border-blue-100 p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <Info className="w-4 h-4 text-blue-500" />
                              <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">Consejos Útiles</span>
                            </div>
                            <ul className="space-y-2">
                              {guide.tips.map((tip, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <CheckCircle2 className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                                  <p className="text-sm text-blue-700 leading-relaxed">{tip}</p>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Warnings */}
                        {guide.warnings && guide.warnings.length > 0 && (
                          <div className="rounded-xl bg-amber-50 border border-amber-100 p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <AlertCircle className="w-4 h-4 text-amber-500" />
                              <span className="text-sm font-semibold text-amber-600 uppercase tracking-wider">Importante</span>
                            </div>
                            <ul className="space-y-2">
                              {guide.warnings.map((warning, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <CircleDot className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                                  <p className="text-sm text-amber-700 leading-relaxed">{warning}</p>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Shortcuts */}
                        {guide.shortcuts && guide.shortcuts.length > 0 && (
                          <div className="rounded-xl bg-gray-50 border border-gray-200 p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <Settings className="w-4 h-4 text-gray-500" />
                              <span className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Atajos Rápidos</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {guide.shortcuts.map((shortcut, index) => (
                                <div key={index} className="text-sm text-gray-700 bg-white px-3 py-2 rounded-lg border">
                                  {shortcut}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Actions Tab */}
                    {activeTab === "actions" && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Principales</h3>
                            <div className="space-y-3">
                              {guide.mainActions.map((action, index) => {
                                const ActionIcon = action.icon
                                return (
                                  <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${action.bgColor}`}>
                                      <ActionIcon className={`w-5 h-5 ${action.color}`} />
                                    </div>
                                    <div className="flex-1">
                                      <h4 className="font-medium text-gray-900">{action.title}</h4>
                                      <p className="text-gray-600 text-sm mt-1">{action.description}</p>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>

                          {guide.additionalActions && guide.additionalActions.length > 0 && (
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Adicionales</h3>
                              <div className="space-y-3">
                                {guide.additionalActions.map((action, index) => {
                                  const ActionIcon = action.icon
                                  return (
                                    <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${action.bgColor}`}>
                                        <ActionIcon className={`w-5 h-5 ${action.color}`} />
                                      </div>
                                      <div className="flex-1">
                                        <h4 className="font-medium text-gray-900">{action.title}</h4>
                                        <p className="text-gray-600 text-sm mt-1">{action.description}</p>
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Steps Tab */}
                    {activeTab === "steps" && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Guía Paso a Paso</h3>
                        <ol className="space-y-4">
                          {guide.steps.map((step, index) => {
                            const StepIcon = step.icon || CircleDot
                            return (
                              <li key={index} className="flex gap-4">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#930021]/10 text-[#930021] flex items-center justify-center text-sm font-bold mt-0.5">
                                  {index + 1}
                                </div>
                                <div className="flex-1 pb-4 border-l-2 border-gray-100 pl-4 ml-4">
                                  <div className="flex items-center gap-2 mb-2">
                                    <StepIcon className="w-4 h-4 text-gray-400" />
                                    <p className="font-semibold text-gray-800 text-sm">{step.title}</p>
                                  </div>
                                  <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>
                                </div>
                              </li>
                            )
                          })}
                        </ol>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}