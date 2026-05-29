import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Loader2, Search, Trophy, Trash2, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export function ClubAdminCustomers() {
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("all") // all, active, inactive
  const supabase = createClient()

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true)
      const { data } = await supabase.from("club_customers").select("*").order("created_at", { ascending: false })
      if (data) setCustomers(data)
      setLoading(false)
    }
    fetchCustomers()
  }, [])

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const filtered = customers.filter(c => {
    const matchesSearch = c.email.toLowerCase().includes(search.toLowerCase()) ||
      (c.name && c.name.toLowerCase().includes(search.toLowerCase())) ||
      (c.card_number && c.card_number.toLowerCase().includes(search.toLowerCase()))
      
    if (!matchesSearch) return false
    
    if (filter === "active") {
      return c.last_visit && new Date(c.last_visit) >= thirtyDaysAgo
    } else if (filter === "inactive") {
      return !c.last_visit || new Date(c.last_visit) < thirtyDaysAgo
    }
    return true
  })

  const handleDelete = async (id: string) => {
    if (!confirm("¿Seguro que quieres eliminar a este socio? Perderá todos sus sellos.")) return
    
    const { error } = await supabase.from("club_customers").delete().eq("id", id)
    if (error) {
      toast.error("Error al eliminar socio")
    } else {
      toast.success("Socio eliminado correctamente")
      setCustomers(customers.filter(c => c.id !== id))
    }
  }

  if (loading) return <div className="p-12 flex justify-center"><Loader2 className="animate-spin w-6 h-6 text-gray-400" /></div>

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center bg-gray-50/50 gap-4">
        <h2 className="text-lg font-medium">Directorio de Socios</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Buscar por email, nombre o nº tarjeta..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 bg-white w-full"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select 
              className="h-10 pl-9 pr-8 w-full sm:w-auto rounded-md border border-input bg-white text-sm"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">Todos los socios</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 font-medium uppercase tracking-wider">Socio</th>
              <th className="px-6 py-4 font-medium uppercase tracking-wider">Nº Tarjeta</th>
              <th className="px-6 py-4 font-medium uppercase tracking-wider text-center">Sellos Actuales</th>
              <th className="px-6 py-4 font-medium uppercase tracking-wider text-center">Total Histórico</th>
              <th className="px-6 py-4 font-medium uppercase tracking-wider">Última Visita</th>
              <th className="px-6 py-4 font-medium uppercase tracking-wider">Registro</th>
              <th className="px-6 py-4 font-medium uppercase tracking-wider text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(c => (
              <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{c.name || 'Sin nombre'}</div>
                  <div className="text-gray-500 text-xs">{c.email}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="font-mono text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-md tracking-widest">
                    {c.card_number || '—'}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-[#F5D89C]/30 text-[#7C4A1E] font-bold">
                    <Trophy className="w-3 h-3 mr-1" />
                    {c.stamp_count}
                  </div>
                </td>
                <td className="px-6 py-4 text-center font-medium text-gray-600">{c.total_stamps_ever}</td>
                <td className="px-6 py-4 text-gray-500">
                  {c.last_visit ? new Date(c.last_visit).toLocaleDateString('es-ES') : '-'}
                </td>
                <td className="px-6 py-4 text-gray-500">
                  {new Date(c.created_at).toLocaleDateString('es-ES')}
                </td>
                <td className="px-6 py-4 text-right">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDelete(c.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">No se encontraron socios con los filtros actuales.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
