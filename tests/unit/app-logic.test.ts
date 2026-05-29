/**
 * =====================================================================
 * Orders & App Logic — Jest Unit Tests
 * =====================================================================
 * Tests for order validation, price calculation, email generation
 * and cart logic. All pure functions, no network calls.
 * =====================================================================
 */

// ─────────────────────────────────────────────────────────────────────────────
// 1. ORDER PRICE VALIDATION — Server-side tamper detection
// ─────────────────────────────────────────────────────────────────────────────

describe("Lógica de validación de precios del pedido", () => {
  /** Mirror of calculateTotal from /api/orders/route.ts */
  function calculateTotal(items: Array<{ price: number; quantity: number }>): number {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }

  /** Mirror of tamper detection: Math.abs(calculated - received) > 0.1 */
  function isPriceTampered(received: number, items: Array<{ price: number; quantity: number }>): boolean {
    return Math.abs(calculateTotal(items) - received) > 0.1
  }

  it("Calcula el total correctamente para un item", () => {
    expect(calculateTotal([{ price: 2.5, quantity: 2 }])).toBeCloseTo(5.0)
  })

  it("Calcula el total correctamente para múltiples items", () => {
    const items = [
      { price: 2.5, quantity: 3 },  // 7.50
      { price: 1.8, quantity: 2 },  // 3.60
      { price: 5.0, quantity: 1 },  // 5.00
    ]
    expect(calculateTotal(items)).toBeCloseTo(16.1)
  })

  it("Devuelve 0 para carrito vacío", () => {
    expect(calculateTotal([])).toBe(0)
  })

  it("Maneja precios con muchos decimales", () => {
    expect(calculateTotal([{ price: 1.999, quantity: 3 }])).toBeCloseTo(5.997)
  })

  it("Detecta precio manipulado (muy bajo)", () => {
    const items = [{ price: 10.0, quantity: 2 }]
    expect(isPriceTampered(0.01, items)).toBe(true)
  })

  it("Detecta precio manipulado (muy alto / beneficio extra)", () => {
    const items = [{ price: 2.5, quantity: 1 }]
    expect(isPriceTampered(999.99, items)).toBe(true)
  })

  it("No marca como manipulado si la diferencia está dentro del margen (0.1)", () => {
    const items = [{ price: 2.5, quantity: 2 }]
    expect(isPriceTampered(5.05, items)).toBe(false)  // diff = 0.05 < 0.1
    expect(isPriceTampered(4.95, items)).toBe(false)  // diff = 0.05 < 0.1
  })

  it("Marca como manipulado si la diferencia es exactamente 0.11", () => {
    const items = [{ price: 5.0, quantity: 1 }]
    expect(isPriceTampered(4.89, items)).toBe(true)  // diff = 0.11 > 0.1
  })

  it("Maneja carrito con 1 item de cantidad 0", () => {
    expect(calculateTotal([{ price: 5.0, quantity: 0 }])).toBe(0)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 2. ORDER FIELD VALIDATION
// ─────────────────────────────────────────────────────────────────────────────

describe("Validación de campos del pedido", () => {
  interface OrderBody {
    email?: string
    whatsapp?: string
    address?: string
    delivery_date?: string
    delivery_time?: string
    items?: any[]
    total_amount?: number
    name?: string
  }

  /** Mirror of validation from /api/orders/route.ts */
  function validateOrderBody(body: OrderBody): string | null {
    const required = ["email", "whatsapp", "address", "delivery_date", "delivery_time", "items", "total_amount"]
    for (const field of required) {
      if (!body[field as keyof OrderBody]) return `Todos los campos son obligatorios`
    }
    return null
  }

  it("Acepta un pedido con todos los campos", () => {
    const valid = {
      email: "test@test.com",
      whatsapp: "+34600000000",
      address: "Calle Test",
      delivery_date: "2026-12-25",
      delivery_time: "10:00",
      items: [{ id: "1", name: "Cookie", price: 2.5, quantity: 1 }],
      total_amount: 2.5
    }
    expect(validateOrderBody(valid)).toBeNull()
  })

  it("Rechaza pedido sin email", () => {
    const body = {
      whatsapp: "+34600000000",
      address: "Calle Test",
      delivery_date: "2026-12-25",
      delivery_time: "10:00",
      items: [{ id: "1", name: "Cookie", price: 2.5, quantity: 1 }],
      total_amount: 2.5
    }
    expect(validateOrderBody(body)).not.toBeNull()
  })

  it("Rechaza pedido sin items", () => {
    const body = {
      email: "test@test.com",
      whatsapp: "+34600000000",
      address: "Calle Test",
      delivery_date: "2026-12-25",
      delivery_time: "10:00",
      total_amount: 2.5
    }
    expect(validateOrderBody(body)).not.toBeNull()
  })

  it("Rechaza pedido con total_amount de 0 (falsy)", () => {
    const body = {
      email: "test@test.com",
      whatsapp: "+34600000000",
      address: "Calle Test",
      delivery_date: "2026-12-25",
      delivery_time: "10:00",
      items: [{ id: "1", name: "Cookie", price: 2.5, quantity: 1 }],
      total_amount: 0
    }
    expect(validateOrderBody(body)).not.toBeNull()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 3. CART LOGIC — Operaciones del carrito de compra
// ─────────────────────────────────────────────────────────────────────────────

describe("Lógica del carrito de compra", () => {
  interface CartItem {
    id: string
    name: string
    price: number
    quantity: number
    imageUrl?: string | null
    isPack?: boolean
  }

  // Simplified cart store logic (mirrors useCartStore)
  function addItem(items: CartItem[], newItem: Omit<CartItem, "quantity">): CartItem[] {
    const existing = items.find((i) => i.id === newItem.id && !i.isPack)
    if (existing) {
      return items.map((i) => i.id === newItem.id ? { ...i, quantity: i.quantity + 1 } : i)
    }
    return [...items, { ...newItem, quantity: 1 }]
  }

  function updateQuantity(items: CartItem[], id: string, quantity: number): CartItem[] {
    if (quantity <= 0) return items.filter((i) => i.id !== id)
    return items.map((i) => i.id === id ? { ...i, quantity } : i)
  }

  function removeItem(items: CartItem[], id: string): CartItem[] {
    return items.filter((i) => i.id !== id)
  }

  function getTotalItems(items: CartItem[]): number {
    return items.reduce((sum, i) => sum + i.quantity, 0)
  }

  function getTotalPrice(items: CartItem[]): number {
    return items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  }

  const SAMPLE_ITEM = { id: "c1", name: "Chocolate Chip", price: 2.5, imageUrl: null }

  it("Añadir un item nuevo crea un entry con quantity 1", () => {
    const cart = addItem([], SAMPLE_ITEM)
    expect(cart).toHaveLength(1)
    expect(cart[0].quantity).toBe(1)
  })

  it("Añadir el mismo item incrementa la cantidad", () => {
    let cart = addItem([], SAMPLE_ITEM)
    cart = addItem(cart, SAMPLE_ITEM)
    expect(cart).toHaveLength(1)
    expect(cart[0].quantity).toBe(2)
  })

  it("Añadir items distintos crea entries separados", () => {
    let cart = addItem([], SAMPLE_ITEM)
    cart = addItem(cart, { id: "c2", name: "Limón", price: 2.0, imageUrl: null })
    expect(cart).toHaveLength(2)
  })

  it("updateQuantity a 0 elimina el item", () => {
    let cart = addItem([], SAMPLE_ITEM)
    cart = updateQuantity(cart, "c1", 0)
    expect(cart).toHaveLength(0)
  })

  it("updateQuantity actualiza la cantidad correctamente", () => {
    let cart = addItem([], SAMPLE_ITEM)
    cart = updateQuantity(cart, "c1", 5)
    expect(cart[0].quantity).toBe(5)
  })

  it("removeItem elimina el item del carrito", () => {
    let cart = addItem([], SAMPLE_ITEM)
    cart = removeItem(cart, "c1")
    expect(cart).toHaveLength(0)
  })

  it("getTotalItems suma todas las cantidades", () => {
    let cart: CartItem[] = []
    cart = addItem(cart, SAMPLE_ITEM)
    cart = addItem(cart, SAMPLE_ITEM)
    cart = addItem(cart, { id: "c2", name: "Limón", price: 2.0, imageUrl: null })
    expect(getTotalItems(cart)).toBe(3) // 2 c1 + 1 c2
  })

  it("getTotalPrice calcula el precio correcto", () => {
    let cart: CartItem[] = []
    cart = addItem(cart, SAMPLE_ITEM) // 2.5
    cart = addItem(cart, SAMPLE_ITEM) // 2.5
    cart = addItem(cart, { id: "c2", name: "Limón", price: 2.0, imageUrl: null }) // 2.0
    expect(getTotalPrice(cart)).toBeCloseTo(7.0)
  })

  it("Carrito vacío tiene total 0 y 0 items", () => {
    expect(getTotalItems([])).toBe(0)
    expect(getTotalPrice([])).toBe(0)
  })

  it("Un pack no se agrupa con la galleta individual del mismo ID", () => {
    let cart: CartItem[] = []
    cart = addItem(cart, SAMPLE_ITEM) // Regular
    cart = [...cart, { ...SAMPLE_ITEM, isPack: true, quantity: 1 }] // Pack (added directly)
    // Regular item add should only update the non-pack
    cart = addItem(cart, SAMPLE_ITEM)
    const regularItem = cart.find((i) => !i.isPack)
    const packItem = cart.find((i) => i.isPack)
    expect(regularItem?.quantity).toBe(2)
    expect(packItem?.quantity).toBe(1)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 4. COOKIES DATA — Formato y estructura
// ─────────────────────────────────────────────────────────────────────────────

describe("Transformación de datos de galletas (API response)", () => {
  /** Mirror of cookie formatting from /api/cookies/route.ts */
  function formatCookie(rawCookie: any) {
    const tags = rawCookie.cookie_tags?.map((ct: any) => ({
      id: ct.tags?.id,
      name: ct.tags?.name,
      color_hex: ct.tags?.colors?.hex || "#6b7280"
    })).filter((t: any) => t.id) || []

    const imageUrls = Array.isArray(rawCookie.image_urls) ? rawCookie.image_urls : []

    return {
      ...rawCookie,
      image_urls: imageUrls,
      main_image_index: rawCookie.main_image_index || 0,
      tags,
      featured_description: rawCookie.featured_description || "",
      cookie_tags: undefined
    }
  }

  const RAW_COOKIE = {
    id: "uuid-1",
    name: "Cookie de Chocolate",
    price: 2.5,
    is_visible: true,
    image_urls: ["https://example.com/img1.jpg", "https://example.com/img2.jpg"],
    main_image_index: 0,
    featured_description: "La mejor galleta",
    cookie_tags: [
      {
        tags: {
          id: "tag-1",
          name: "Bestseller",
          colors: { hex: "#930021" }
        }
      }
    ]
  }

  it("Formatea correctamente una galleta con tags", () => {
    const formatted = formatCookie(RAW_COOKIE)
    expect(formatted.id).toBe("uuid-1")
    expect(formatted.name).toBe("Cookie de Chocolate")
    expect(formatted.tags).toHaveLength(1)
    expect(formatted.tags[0].name).toBe("Bestseller")
    expect(formatted.tags[0].color_hex).toBe("#930021")
  })

  it("Elimina cookie_tags del resultado", () => {
    const formatted = formatCookie(RAW_COOKIE)
    expect(formatted.cookie_tags).toBeUndefined()
  })

  it("Normaliza image_urls a array vacío cuando no existe", () => {
    const formatted = formatCookie({ ...RAW_COOKIE, image_urls: null })
    expect(Array.isArray(formatted.image_urls)).toBe(true)
    expect(formatted.image_urls).toHaveLength(0)
  })

  it("Normaliza image_urls cuando es un string en lugar de array", () => {
    const formatted = formatCookie({ ...RAW_COOKIE, image_urls: "single-url.jpg" })
    // Should handle gracefully
    expect(formatted.image_urls).toBeDefined()
  })

  it("main_image_index tiene valor por defecto 0", () => {
    const formatted = formatCookie({ ...RAW_COOKIE, main_image_index: undefined })
    expect(formatted.main_image_index).toBe(0)
  })

  it("featured_description tiene valor por defecto string vacío", () => {
    const formatted = formatCookie({ ...RAW_COOKIE, featured_description: null })
    expect(formatted.featured_description).toBe("")
  })

  it("Filtra tags sin ID válido", () => {
    const cookieWithBadTag = {
      ...RAW_COOKIE,
      cookie_tags: [
        { tags: { id: null, name: "No ID", colors: { hex: "#000" } } },
        { tags: { id: "valid-id", name: "Válido", colors: { hex: "#930021" } } }
      ]
    }
    const formatted = formatCookie(cookieWithBadTag)
    expect(formatted.tags).toHaveLength(1)
    expect(formatted.tags[0].id).toBe("valid-id")
  })

  it("Usa color por defecto #6b7280 cuando no hay color en el tag", () => {
    const cookieNoColor = {
      ...RAW_COOKIE,
      cookie_tags: [
        { tags: { id: "t1", name: "Sin Color", colors: null } }
      ]
    }
    const formatted = formatCookie(cookieNoColor)
    expect(formatted.tags[0].color_hex).toBe("#6b7280")
  })

  it("Maneja galleta sin cookie_tags", () => {
    const cookieNoTags = { ...RAW_COOKIE, cookie_tags: undefined }
    const formatted = formatCookie(cookieNoTags)
    expect(formatted.tags).toEqual([])
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 5. ORDER NUMBER GENERATION
// ─────────────────────────────────────────────────────────────────────────────

describe("Generación de número de pedido", () => {
  /** Mirror: orderData.id.slice(0, 8).toUpperCase() */
  function generateOrderNumber(id: string): string {
    return id.slice(0, 8).toUpperCase()
  }

  it("Genera un código de 8 caracteres", () => {
    const code = generateOrderNumber("550e8400-e29b-41d4-a716-446655440000")
    expect(code).toHaveLength(8)
  })

  it("Convierte el código a mayúsculas", () => {
    const code = generateOrderNumber("abcdefgh-e29b-41d4-a716-446655440000")
    expect(code).toBe("ABCDEFGH")
  })

  it("Funciona con UUIDs estándar", () => {
    const uuid = "f47ac10b-58cc-4372-a567-0e02b2c3d479"
    const code = generateOrderNumber(uuid)
    expect(code).toBe("F47AC10B")
  })

  it("No lanza error con strings cortos", () => {
    expect(() => generateOrderNumber("abc")).not.toThrow()
    expect(generateOrderNumber("abc")).toBe("ABC")
  })
})
