export type CartItem = {
  id: string
  name: string
  price: number
  quantity: number
  imageUrl?: string
  isPack?: boolean
  packCookies?: Array<{
    cookieId: string
    cookieName: string
    quantity: number
  }>
}

export type Order = {
  id?: string
  email: string
  whatsapp: string
  address: string
  delivery_date: string
  delivery_time: string
  status?: string
  total_amount: number
  invoice_url?: string | null
  created_at?: string
  updated_at?: string
}

export type OrderItem = {
  id?: string
  order_id: string
  cookie_id: string
  cookie_name: string
  quantity: number
  unit_price: number
  subtotal: number
  pack_cookies?: Array<{
    cookieId: string
    cookieName: string
    quantity: number
  }> | null
  created_at?: string
}
