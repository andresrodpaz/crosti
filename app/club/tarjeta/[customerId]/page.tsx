import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { DigitalCardPreview } from "@/components/club/digital-card-preview"
import Link from "next/link"

export default async function CustomerDigitalCardPage({
  params
}: {
  params: { customerId: string }
}) {
  if (process.env.NEXT_PUBLIC_LOYALTY_ENABLED !== "true") {
    notFound()
  }

  const supabase = await createClient()
  const adminClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  
  // Fetch Customer using admin client to bypass RLS (since this is a public shareable URL)
  const { data: customer, error: custError } = await adminClient
    .from("club_customers")
    .select("*")
    .eq("id", params.customerId)
    .single()

  if (!customer) {
    notFound()
  }

  // Fetch Rewards
  const { data: rewards } = await adminClient
    .from("club_rewards")
    .select("*")
    .eq("is_active", true)
    .order("points_cost", { ascending: true })

  // Fetch Config
  const { data: config } = await adminClient.from("club_card_config").select("*").single()

  const cardConfig = config ? {
    primaryColor: config.primary_color,
    accentColor: config.accent_color,
    textColor: config.text_color,
    font: config.font,
    stampTotal: config.stamp_total,
    rewardDescription: config.reward_description,
    logoUrl: config.logo_url
  } : {
    primaryColor: '#7C4A1E',
    accentColor: '#F5D89C',
    textColor: '#ffffff',
    font: 'Inter',
    stampTotal: 10,
    rewardDescription: 'Tu cookie gratis'
  }

  const stampsLeft = cardConfig.stampTotal - customer.stamp_count
  const isRewardReady = stampsLeft <= 0

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[400px]">
        
        <DigitalCardPreview 
          config={cardConfig} 
          customerName={customer.name || customer.email} 
          stampCount={customer.stamp_count}
          hideQR={false}
          isWallet={false}
        />

        <div className="bg-white rounded-2xl p-6 shadow-sm mt-6 border border-gray-100 text-center">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Tu Saldo Actual</h3>
          <div className="text-5xl font-black text-[#930021] mb-2">{customer.stamp_count}</div>
          <p className="text-gray-500 mb-6 text-sm">Puntos acumulados</p>
          
          {/* QR del usuario para escanear en tienda — contiene card_number */}
          <div className="bg-gray-50 p-4 inline-block rounded-xl mx-auto">
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(customer.card_number || customer.email)}`} 
              alt="QR Code"
              width={150}
              height={150}
            />
          </div>
          <p className="text-xs text-gray-400 mt-3 font-mono tracking-widest">{customer.card_number || customer.id.split('-')[0]}</p>
          <p className="text-xs text-gray-400 mt-1">Muestra este código en tienda para conseguir puntos o canjear premios</p>
        </div>

        {rewards && rewards.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">Catálogo de Premios</h3>
            <div className="space-y-3">
              {rewards.map((reward: any) => {
                const canAfford = customer.stamp_count >= reward.points_cost
                const progress = Math.min(100, Math.round((customer.stamp_count / reward.points_cost) * 100))
                
                return (
                  <div key={reward.id} className={`bg-white rounded-xl p-4 border shadow-sm ${canAfford ? 'border-[#930021]/30' : 'border-gray-100'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold text-gray-900">{reward.name}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${canAfford ? 'bg-[#F5D89C] text-[#7C4A1E]' : 'bg-gray-100 text-gray-500'}`}>
                        {reward.points_cost} pts
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">{reward.description || 'Premio exclusivo del club'}</p>
                    
                    <div className="w-full bg-gray-100 rounded-full h-2 mb-1">
                      <div 
                        className={`h-2 rounded-full ${canAfford ? 'bg-green-500' : 'bg-[#930021]'}`} 
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-400 font-medium">
                      <span>{progress}%</span>
                      <span>{canAfford ? '¡Desbloqueado!' : `Faltan ${reward.points_cost - customer.stamp_count} pts`}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="mt-8 text-center pb-8">
          <Link href="/" className="text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors">
            Volver a la tienda
          </Link>
        </div>

      </div>
    </div>
  )
}
