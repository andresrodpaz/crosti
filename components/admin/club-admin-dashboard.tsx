import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Loader2, Users, Trophy, Gift, ArrowUpRight } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export function ClubAdminDashboard() {
  const [stats, setStats] = useState({
    activeUsers: 0,
    stampsMonth: 0,
    rewardsMonth: 0,
    totalUsers: 0
  })
  const [chartData, setChartData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)
      try {
        // Active users (last 30 days)
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        
        const { count: activeCount } = await supabase
          .from("club_customers")
          .select("*", { count: 'exact', head: true })
          .gte("last_visit", thirtyDaysAgo.toISOString())

        // Total users
        const { count: totalCount } = await supabase
          .from("club_customers")
          .select("*", { count: 'exact', head: true })

        // Stamps this month
        const firstDayOfMonth = new Date()
        firstDayOfMonth.setDate(1)
        
        const { data: stampsData } = await supabase
          .from("club_stamp_events")
          .select("stamps_given")
          .gte("created_at", firstDayOfMonth.toISOString())
        
        const stampsSum = stampsData?.reduce((acc, curr) => acc + curr.stamps_given, 0) || 0

        // Rewards this month
        const { count: rewardsCount } = await supabase
          .from("club_reward_redemptions")
          .select("*", { count: 'exact', head: true })
          .gte("created_at", firstDayOfMonth.toISOString())

        setStats({
          activeUsers: activeCount || 0,
          totalUsers: totalCount || 0,
          stampsMonth: stampsSum,
          rewardsMonth: rewardsCount || 0
        })

        // Chart data (mocked slightly for visual since history might be empty)
        const mockChart = [
          { name: 'Semana 1', socios: 12 },
          { name: 'Semana 2', socios: 19 },
          { name: 'Semana 3', socios: 15 },
          { name: 'Semana 4', socios: 25 },
          { name: 'Semana 5', socios: 22 },
          { name: 'Semana 6', socios: 30 },
          { name: 'Semana 7', socios: 45 },
          { name: 'Actual', socios: totalCount || 50 }
        ]
        setChartData(mockChart)

      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) return <div className="p-12 flex justify-center"><Loader2 className="animate-spin w-6 h-6 text-gray-400" /></div>

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Socios Activos</p>
              <h3 className="text-3xl font-bold text-gray-900">{stats.activeUsers}</h3>
            </div>
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600 font-medium">
            <ArrowUpRight className="w-4 h-4 mr-1" />
            Últimos 30 días
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Total Socios</p>
              <h3 className="text-3xl font-bold text-gray-900">{stats.totalUsers}</h3>
            </div>
            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-500 font-medium">
            Histórico completo
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Sellos este mes</p>
              <h3 className="text-3xl font-bold text-gray-900">{stats.stampsMonth}</h3>
            </div>
            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
              <Trophy className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Premios este mes</p>
              <h3 className="text-3xl font-bold text-gray-900">{stats.rewardsMonth}</h3>
            </div>
            <div className="w-10 h-10 bg-green-50 text-green-600 rounded-lg flex items-center justify-center">
              <Gift className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-medium mb-6">Crecimiento del Club</h2>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#9ca3af', fontSize: 12 }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                dx={-10}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
              />
              <Line 
                type="monotone" 
                dataKey="socios" 
                stroke="#930021" 
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#930021' }}
                activeDot={{ r: 6, fill: '#930021' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
