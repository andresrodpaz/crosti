"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Package,
  Calendar,
  MapPin,
  Mail,
  Phone,
  Search,
  ChevronDown,
  ChevronUp,
  Download,
  BarChart3,
  TrendingUp,
  Cookie,
  FileDown,
} from "lucide-react"
import { Label } from "@/components/ui/label"
import { downloadInvoice } from "@/lib/invoice-generator"

type OrderItem = {
  cookie_name: string
  quantity: number
  unit_price: number
  subtotal: number
  pack_cookies?: Array<{
    cookieId: string
    cookieName: string
    quantity: number
  }> | null
}

type Order = {
  id: string
  name?: string
  email: string
  whatsapp: string
  address: string
  delivery_date: string
  delivery_time: string
  note?: string
  status: string
  total_amount: number
  created_at: string
  order_items: OrderItem[]
}

export function OrdersAdmin() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchOrders()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredOrders(orders)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = orders.filter(
        (order) =>
          order.id.toLowerCase().includes(query) ||
          order.email.toLowerCase().includes(query) ||
          order.whatsapp.includes(query),
      )
      setFilteredOrders(filtered)
    }
  }, [searchQuery, orders])

  const fetchOrders = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (
            cookie_name,
            quantity,
            unit_price,
            subtotal,
            pack_cookies
          )
        `)
        .order("created_at", { ascending: false })

      if (error) throw error
      setOrders(data || [])
      setFilteredOrders(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar pedidos")
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", orderId)

      if (error) throw error

      setOrders(orders.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)))
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al actualizar pedido")
    }
  }

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrders((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(orderId)) {
        newSet.delete(orderId)
      } else {
        newSet.add(orderId)
      }
      return newSet
    })
  }

  const calculateStats = () => {
    const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0)
    const totalOrders = orders.length
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    const statusCounts = orders.reduce(
      (acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    // Cookie popularity
    const cookieCounts: Record<string, number> = {}
    orders.forEach((order) => {
      order.order_items.forEach((item) => {
        if (item.pack_cookies && Array.isArray(item.pack_cookies)) {
          // Count individual cookies in packs
          item.pack_cookies.forEach((pc) => {
            cookieCounts[pc.cookieName] = (cookieCounts[pc.cookieName] || 0) + pc.quantity
          })
        } else {
          // Count regular cookies
          cookieCounts[item.cookie_name] = (cookieCounts[item.cookie_name] || 0) + item.quantity
        }
      })
    })

    const topCookies = Object.entries(cookieCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)

    return {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      statusCounts,
      topCookies,
    }
  }

  const exportToCSV = () => {
    const headers = [
      "Pedido ID",
      "Fecha",
      "Cliente",
      "Email",
      "WhatsApp",
      "Dirección",
      "Fecha Entrega",
      "Hora Entrega",
      "Estado",
      "Total",
    ]
    const rows = filteredOrders.map((order) => [
      order.id.slice(0, 8),
      new Date(order.created_at).toLocaleString("es-ES"),
      order.name || "",
      order.email,
      order.whatsapp,
      order.address,
      order.delivery_date,
      order.delivery_time,
      getStatusLabel(order.status),
      order.total_amount.toFixed(2),
    ])

    const csvContent = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `pedidos_crosti_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleDownloadInvoice = (order: Order) => {
    const invoiceData = {
      orderId: order.id,
      orderNumber: order.id.slice(0, 8).toUpperCase(),
      date: new Date(order.created_at).toLocaleDateString("es-ES"),
      customerName: order.name,
      customerEmail: order.email,
      customerPhone: order.whatsapp,
      customerAddress: order.address,
      deliveryDate: order.delivery_date,
      deliveryTime: order.delivery_time,
      items: order.order_items.map((item) => ({
        name: item.cookie_name,
        quantity: item.quantity,
        price: item.unit_price,
        subtotal: item.subtotal,
        packCookies: item.pack_cookies
          ? item.pack_cookies.map((pc) => ({
              cookieId: pc.cookieId,
              cookieName: pc.cookieName,
              quantity: pc.quantity,
            }))
          : undefined,
      })),
      subtotal: order.total_amount,
      total: order.total_amount,
      note: order.note,
    }

    downloadInvoice(invoiceData)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "confirmed":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "preparing":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "shipped":
        return "bg-indigo-100 text-indigo-800 border-indigo-200"
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "Pendiente",
      confirmed: "Confirmado",
      preparing: "Preparando",
      shipped: "Enviado",
      delivered: "Entregado",
      cancelled: "Cancelado",
    }
    return labels[status] || status
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <div className="w-12 h-12 bg-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando pedidos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return null
  }

  const stats = calculateStats()

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Gestión de Pedidos</h1>
        <p className="text-gray-500">Administra y actualiza el estado de los pedidos</p>
      </div>

      <Tabs defaultValue="orders" className="space-y-6">
        <TabsList>
          <TabsTrigger value="orders">
            <Package className="w-4 h-4 mr-2" />
            Pedidos
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="w-4 h-4 mr-2" />
            Estadísticas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative flex-1 max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar por número de pedido, email o teléfono..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={exportToCSV} variant="outline" className="gap-2 bg-transparent">
              <Download className="w-4 h-4" />
              Exportar CSV
            </Button>
          </div>

          <div className="space-y-4">
            {filteredOrders.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium">{searchQuery ? "No se encontraron pedidos" : "No hay pedidos"}</p>
                  <p className="text-sm text-muted-foreground">
                    {searchQuery
                      ? "Intenta con otro término de búsqueda"
                      : "Los pedidos aparecerán aquí cuando los clientes realicen compras"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredOrders.map((order) => {
                const isExpanded = expandedOrders.has(order.id)
                return (
                  <Card key={order.id} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row gap-6">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="font-semibold text-lg mb-1">Pedido #{order.id.slice(0, 8)}</h3>
                              <p className="text-sm text-muted-foreground">
                                {new Date(order.created_at).toLocaleString("es-ES")}
                              </p>
                            </div>
                            <Badge className={getStatusColor(order.status)}>{getStatusLabel(order.status)}</Badge>
                          </div>

                          <div className="grid sm:grid-cols-2 gap-3 text-sm mb-4">
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                              <p className="truncate">{order.email}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                              <p>{order.delivery_date}</p>
                            </div>
                          </div>

                          <div className="flex justify-between items-center font-bold text-lg mb-4">
                            <span>Total</span>
                            <span className="text-primary">{order.total_amount.toFixed(2)}€</span>
                          </div>

                          {isExpanded && (
                            <div className="space-y-4 border-t pt-4 mt-4">
                              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                                {order.name && (
                                  <div className="flex items-start gap-2">
                                    <div className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0">👤</div>
                                    <div>
                                      <p className="font-medium text-xs text-muted-foreground mb-0.5">Nombre</p>
                                      <p>{order.name}</p>
                                    </div>
                                  </div>
                                )}
                                <div className="flex items-start gap-2">
                                  <Phone className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                  <div>
                                    <p className="font-medium text-xs text-muted-foreground mb-0.5">WhatsApp</p>
                                    <p>{order.whatsapp}</p>
                                  </div>
                                </div>
                                <div className="flex items-start gap-2 sm:col-span-2">
                                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                  <div>
                                    <p className="font-medium text-xs text-muted-foreground mb-0.5">Dirección</p>
                                    <p>{order.address}</p>
                                  </div>
                                </div>
                                <div className="flex items-start gap-2">
                                  <Calendar className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                  <div>
                                    <p className="font-medium text-xs text-muted-foreground mb-0.5">Hora de entrega</p>
                                    <p className="text-xs">{order.delivery_time}</p>
                                  </div>
                                </div>
                                {order.note && (
                                  <div className="flex items-start gap-2 sm:col-span-2">
                                    <div className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0">📝</div>
                                    <div>
                                      <p className="font-medium text-xs text-muted-foreground mb-0.5">Nota</p>
                                      <p className="text-sm italic">{order.note}</p>
                                    </div>
                                  </div>
                                )}
                              </div>

                              <div className="border-t pt-4">
                                <p className="font-medium text-sm mb-3">Productos:</p>
                                <div className="space-y-3">
                                  {order.order_items.map((item, idx) => (
                                    <div key={idx} className="space-y-2">
                                      <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">
                                          {item.quantity}x {item.cookie_name}
                                        </span>
                                        <span className="font-medium">{item.subtotal.toFixed(2)}€</span>
                                      </div>
                                      {item.pack_cookies &&
                                        Array.isArray(item.pack_cookies) &&
                                        item.pack_cookies.length > 0 && (
                                          <div className="ml-4 pl-4 border-l-2 border-primary/20 space-y-1">
                                            <p className="text-xs font-medium text-muted-foreground">
                                              Galletas del pack:
                                            </p>
                                            {item.pack_cookies.map((pc, pcIdx) => (
                                              <div
                                                key={pcIdx}
                                                className="flex items-center gap-2 text-xs text-muted-foreground"
                                              >
                                                <Cookie className="w-3 h-3" />
                                                <span>
                                                  {pc.quantity}x {pc.cookieName}
                                                </span>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="border-t pt-4">
                                <Button
                                  onClick={() => handleDownloadInvoice(order)}
                                  variant="outline"
                                  className="w-full gap-2 bg-transparent"
                                >
                                  <FileDown className="w-4 h-4" />
                                  Descargar Factura PDF
                                </Button>
                              </div>
                            </div>
                          )}

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleOrderExpansion(order.id)}
                            className="w-full mt-2"
                          >
                            {isExpanded ? (
                              <>
                                <ChevronUp className="w-4 h-4 mr-2" />
                                Ocultar detalles
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-4 h-4 mr-2" />
                                Ver todos los detalles
                              </>
                            )}
                          </Button>
                        </div>

                        {/* Actions */}
                        <div className="lg:w-64 space-y-3">
                          <div>
                            <Label className="text-sm font-medium mb-2 block">Actualizar Estado</Label>
                            <Select value={order.status} onValueChange={(value) => updateOrderStatus(order.id, value)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pendiente</SelectItem>
                                <SelectItem value="confirmed">Confirmado</SelectItem>
                                <SelectItem value="preparing">Preparando</SelectItem>
                                <SelectItem value="shipped">Enviado</SelectItem>
                                <SelectItem value="delivered">Entregado</SelectItem>
                                <SelectItem value="cancelled">Cancelado</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-muted-foreground">Ingresos Totales</p>
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-primary">{stats.totalRevenue.toFixed(2)}€</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-muted-foreground">Total Pedidos</p>
                  <Package className="w-4 h-4 text-blue-600" />
                </div>
                <p className="text-3xl font-bold">{stats.totalOrders}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-muted-foreground">Valor Promedio</p>
                  <BarChart3 className="w-4 h-4 text-purple-600" />
                </div>
                <p className="text-3xl font-bold">{stats.averageOrderValue.toFixed(2)}€</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">Pedidos por Estado</h3>
                <div className="space-y-3">
                  {Object.entries(stats.statusCounts).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(status)} variant="outline">
                          {getStatusLabel(status)}
                        </Badge>
                      </div>
                      <span className="font-semibold">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">Top 5 Galletas Más Vendidas</h3>
                <div className="space-y-3">
                  {stats.topCookies.map(([name, count], idx) => (
                    <div key={name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-semibold text-xs">
                          {idx + 1}
                        </span>
                        <span className="text-sm">{name}</span>
                      </div>
                      <span className="font-semibold">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
