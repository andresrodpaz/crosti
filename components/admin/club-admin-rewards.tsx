import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Loader2, Plus, Gift, Trash2, Edit2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { toast } from "sonner"

export function ClubAdminRewards() {
  const [rewards, setRewards] = useState<any[]>([])
  const [redemptions, setRedemptions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({ id: "", name: "", description: "", points_cost: 10, image_url: "" })
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    // Cargar premios
    const { data: rw } = await supabase.from("club_rewards").select("*").order("points_cost", { ascending: true })
    if (rw) setRewards(rw)
    
    // Cargar últimos canjes
    const { data: rd } = await supabase
      .from("club_redemptions")
      .select("*, club_customers(name, email), club_rewards(name)")
      .order("created_at", { ascending: false })
      .limit(10)
    if (rd) setRedemptions(rd)
    
    setLoading(false)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.points_cost) return toast.error("Nombre y puntos son obligatorios")
    
    setSaving(true)
    try {
      const res = await fetch("/api/club/rewards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      
      toast.success(formData.id ? "Premio actualizado" : "Premio creado")
      setOpen(false)
      fetchData()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Seguro que quieres eliminar este premio?")) return
    try {
      const res = await fetch(`/api/club/rewards?id=${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Error al eliminar")
      toast.success("Premio eliminado")
      setRewards(rewards.filter(r => r.id !== id))
    } catch (err) {
      toast.error("Error al eliminar premio")
    }
  }

  const openEdit = (reward: any) => {
    setFormData({
      id: reward.id,
      name: reward.name,
      description: reward.description || "",
      points_cost: reward.points_cost,
      image_url: reward.image_url || ""
    })
    setOpen(true)
  }

  const openNew = () => {
    setFormData({ id: "", name: "", description: "", points_cost: 10, image_url: "" })
    setOpen(true)
  }

  if (loading) return <div className="p-12 flex justify-center"><Loader2 className="animate-spin w-6 h-6 text-gray-400" /></div>

  return (
    <div className="space-y-6">
      {/* Catálogo de Premios */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-lg font-medium">Catálogo de Premios</h2>
            <p className="text-sm text-gray-500">Configura qué pueden canjear tus clientes con sus puntos.</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNew} className="bg-[#930021] hover:bg-[#7a001a] text-white">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Premio
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSave}>
                <DialogHeader>
                  <DialogTitle>{formData.id ? "Editar Premio" : "Nuevo Premio"}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label>Nombre del premio</Label>
                    <Input 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Ej: 1 Galleta Clásica"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Coste en puntos</Label>
                    <Input 
                      type="number"
                      min="1"
                      value={formData.points_cost}
                      onChange={(e) => setFormData({...formData, points_cost: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Descripción (Opcional)</Label>
                    <Textarea 
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Detalles sobre el premio..."
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={saving} className="bg-[#930021] text-white">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : "Guardar Premio"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rewards.map(reward => (
              <div key={reward.id} className="border border-gray-200 rounded-xl p-4 flex flex-col hover:border-[#930021]/30 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div className="w-10 h-10 bg-[#fff8f0] text-[#930021] rounded-lg flex items-center justify-center">
                    <Gift className="w-5 h-5" />
                  </div>
                  <div className="bg-[#F5D89C]/30 text-[#7C4A1E] px-2.5 py-1 rounded-full text-xs font-bold">
                    {reward.points_cost} pts
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900">{reward.name}</h3>
                <p className="text-xs text-gray-500 mt-1 flex-1">{reward.description || "Sin descripción"}</p>
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-50">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(reward)}>
                    <Edit2 className="w-3 h-3 mr-1" /> Editar
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(reward.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            {rewards.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-500">
                No has creado ningún premio todavía.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Últimos Canjes */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-lg font-medium">Últimos Canjes</h2>
          <p className="text-sm text-gray-500">Historial reciente de premios reclamados por los socios.</p>
        </div>
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 font-medium uppercase">Fecha</th>
              <th className="px-6 py-4 font-medium uppercase">Socio</th>
              <th className="px-6 py-4 font-medium uppercase">Premio</th>
              <th className="px-6 py-4 font-medium uppercase text-right">Puntos Gastados</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {redemptions.map(r => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-gray-500">{new Date(r.created_at).toLocaleString('es-ES')}</td>
                <td className="px-6 py-4 font-medium text-gray-900">{r.club_customers?.name || r.club_customers?.email || 'Desconocido'}</td>
                <td className="px-6 py-4 text-[#930021] font-medium">{r.club_rewards?.name || 'Premio Eliminado'}</td>
                <td className="px-6 py-4 text-right font-bold text-[#7C4A1E]">-{r.points_spent}</td>
              </tr>
            ))}
            {redemptions.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">Aún no hay canjes registrados.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
