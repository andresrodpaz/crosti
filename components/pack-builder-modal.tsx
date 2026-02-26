"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/lib/cart-store"
import { Plus, Minus, Check, Package } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"

interface PackBuilderModalProps {
  open: boolean
  onClose: () => void
  cookies: any[]
}

const PACK_SIZES = [
  { size: 6, price: 18, discount: "10% off" },
  { size: 12, price: 33, discount: "17% off" },
  { size: 24, price: 60, discount: "23% off" },
]

export function PackBuilderModal({ open, onClose, cookies }: PackBuilderModalProps) {
  const { addItem } = useCartStore()
  const [selectedSize, setSelectedSize] = useState<number>(6)
  const [selections, setSelections] = useState<Record<string, number>>({})

  const totalSelected = Object.values(selections).reduce((sum, qty) => sum + qty, 0)
  const currentPack = PACK_SIZES.find((p) => p.size === selectedSize)!

  const handleAdd = (cookieId: string) => {
    if (totalSelected >= selectedSize) {
      toast.error(`Solo puedes elegir ${selectedSize} galletas en este pack`)
      return
    }
    setSelections((prev) => ({
      ...prev,
      [cookieId]: (prev[cookieId] || 0) + 1,
    }))
  }

  const handleRemove = (cookieId: string) => {
    setSelections((prev) => {
      const newQty = (prev[cookieId] || 0) - 1
      if (newQty <= 0) {
        const { [cookieId]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [cookieId]: newQty }
    })
  }

  const handleAddToCart = () => {
    if (totalSelected !== selectedSize) {
      toast.error(`Debes elegir exactamente ${selectedSize} galletas`)
      return
    }

    const packCookies = Object.entries(selections).map(([cookieId, quantity]) => {
      const cookie = cookies.find((c) => c.id === cookieId)!
      return {
        cookieId,
        cookieName: cookie.name,
        quantity,
      }
    })

    addItem({
      id: `pack-${selectedSize}-${Date.now()}`,
      name: `Pack Personalizado (${selectedSize} galletas)`,
      price: currentPack.price,
      imageUrl: "/cookie-pack.jpg",
      isPack: true,
      packCookies,
    })

    toast.success(`Pack de ${selectedSize} galletas añadido al carrito`)
    setSelections({})
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-[#930021] flex items-center gap-2">
            <Package className="w-6 h-6" />
            Arma tu Pack Personalizado
          </DialogTitle>
          <DialogDescription>Elige el tamaño de tu pack y selecciona los sabores que quieras</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="grid grid-cols-3 gap-4">
            {PACK_SIZES.map((pack) => (
              <Button
                key={pack.size}
                variant={selectedSize === pack.size ? "default" : "outline"}
                className={`h-auto p-4 flex flex-col items-center gap-2 ${
                  selectedSize === pack.size
                    ? "bg-[#930021] text-white hover:bg-[#930021]/90"
                    : "border-[#930021]/30 text-[#930021] hover:bg-[#930021]/10"
                }`}
                onClick={() => {
                  setSelectedSize(pack.size)
                  setSelections({})
                }}
              >
                <span className="text-3xl font-bold">{pack.size}</span>
                <span className="text-sm">galletas</span>
                <span className="text-lg font-bold">€{pack.price}</span>
                <span className="text-xs bg-[#F8E19A] text-[#930021] px-2 py-1 rounded-full">{pack.discount}</span>
              </Button>
            ))}
          </div>

          <div className="bg-[#F8E19A]/30 rounded-lg p-4 border-2 border-[#930021]/20">
            <div className="flex justify-between items-center text-lg font-semibold text-[#930021]">
              <span>Progreso:</span>
              <span>
                {totalSelected} / {selectedSize} galletas
              </span>
            </div>
            <div className="mt-2 h-2 bg-white rounded-full overflow-hidden">
              <div
                className="h-full bg-[#930021] transition-all"
                style={{ width: `${(totalSelected / selectedSize) * 100}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cookies.map((cookie) => {
              const selected = selections[cookie.id] || 0
              return (
                <div
                  key={cookie.id}
                  className="flex gap-3 p-3 border-2 border-[#930021]/20 rounded-lg hover:bg-[#F8E19A]/20 transition-all bg-white"
                >
                  <div className="w-20 h-20 bg-[#F8E19A]/30 rounded-md relative overflow-hidden flex-shrink-0">
                    <Image
                      src={cookie.imageUrl || "/placeholder.svg?height=80&width=80&query=cookie"}
                      alt={cookie.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-[#930021] line-clamp-2 mb-2">{cookie.name}</h4>
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 hover:bg-[#930021] hover:text-[#F8E19A] text-[#930021]"
                        onClick={() => handleRemove(cookie.id)}
                        disabled={selected === 0}
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </Button>
                      <span className="text-lg font-bold text-[#930021] min-w-[2rem] text-center">{selected}</span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 hover:bg-[#930021] hover:text-[#F8E19A] text-[#930021]"
                        onClick={() => handleAdd(cookie.id)}
                        disabled={totalSelected >= selectedSize}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </Button>
                      {selected > 0 && <Check className="w-4 h-4 text-green-600 ml-auto" />}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <Button
            className="w-full h-12 bg-[#930021] hover:bg-[#930021]/90 text-[#F8E19A] font-bold text-lg"
            onClick={handleAddToCart}
            disabled={totalSelected !== selectedSize}
          >
            {totalSelected === selectedSize
              ? `Añadir Pack al Carrito - €${currentPack.price}`
              : `Selecciona ${selectedSize - totalSelected} galletas más`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
