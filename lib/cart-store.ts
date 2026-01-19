"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { CartItem } from "./types/orders"

interface CartStore {
  items: CartItem[]
  addItem: (item: Omit<CartItem, "quantity">) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          if (item.isPack) {
            return {
              items: [...state.items, { ...item, quantity: 1 }],
            }
          }

          const existingItem = state.items.find((i) => i.id === item.id && !i.isPack)
          if (existingItem) {
            return {
              items: state.items.map((i) => (i.id === item.id && !i.isPack ? { ...i, quantity: i.quantity + 1 } : i)),
            }
          }
          return {
            items: [...state.items, { ...item, quantity: 1 }],
          }
        }),
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),
      updateQuantity: (id, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.id !== id)
              : state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
        })),
      clearCart: () => set({ items: [] }),
      getTotalItems: () => {
        const state = get()
        return state.items.reduce((sum, item) => sum + item.quantity, 0)
      },
      getTotalPrice: () => {
        const state = get()
        return state.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
      },
    }),
    {
      name: "crosti-cart-storage",
    },
  ),
)
