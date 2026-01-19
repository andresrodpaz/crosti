// Simple in-memory store for cookies (CRUD)
export type Cookie = {
  id: string
  name: string
  description: string
  price: number
  imageUrl?: string
  createdAt: Date
}

// Initial mock data
const cookiesData: Cookie[] = [
  {
    id: "1",
    name: "Duo de chocolates y mantequilla de cacahuete",
    description: "Deliciosa combinación de chocolate negro y blanco con mantequilla de cacahuete",
    price: 3.5,
    imageUrl: "/stack-of-delicious-chocolate-chip-cookies-on-white.jpg",
    createdAt: new Date(),
  },
  {
    id: "2",
    name: "Triple chocolate",
    description: "Para los amantes del chocolate: negro, con leche y blanco",
    price: 3.75,
    imageUrl: "/stack-of-delicious-chocolate-chip-cookies-on-white.jpg",
    createdAt: new Date(),
  },
  {
    id: "3",
    name: "Avellana y caramelo",
    description: "Crujiente avellana del Piamonte con trozos de caramelo salado",
    price: 4.0,
    imageUrl: "/stack-of-delicious-chocolate-chip-cookies-on-white.jpg",
    createdAt: new Date(),
  },
  {
    id: "4",
    name: "Clásica con chips de chocolate",
    description: "La receta tradicional con generosos chips de chocolate belga",
    price: 3.25,
    imageUrl: "/stack-of-delicious-chocolate-chip-cookies-on-white.jpg",
    createdAt: new Date(),
  },
  {
    id: "5",
    name: "Mantequilla de almendra",
    description: "Suave mantequilla de almendra tostada con almendras laminadas",
    price: 3.8,
    imageUrl: "/stack-of-delicious-chocolate-chip-cookies-on-white.jpg",
    createdAt: new Date(),
  },
  {
    id: "6",
    name: "Red velvet con chocolate blanco",
    description: "Galleta tipo red velvet con chips de chocolate blanco cremoso",
    price: 4.25,
    imageUrl: "/stack-of-delicious-chocolate-chip-cookies-on-white.jpg",
    createdAt: new Date(),
  },
  {
    id: "7",
    name: "Nutella con avellanas",
    description: "Rellena de Nutella original con avellanas caramelizadas",
    price: 4.5,
    imageUrl: "/stack-of-delicious-chocolate-chip-cookies-on-white.jpg",
    createdAt: new Date(),
  },
  {
    id: "8",
    name: "Limón y semillas de amapola",
    description: "Refrescante galleta de limón con semillas de amapola crujientes",
    price: 3.6,
    imageUrl: "/stack-of-delicious-chocolate-chip-cookies-on-white.jpg",
    createdAt: new Date(),
  },
  {
    id: "9",
    name: "Cookies & cream",
    description: "Galleta de vainilla con trozos de galleta Oreo",
    price: 3.9,
    imageUrl: "/stack-of-delicious-chocolate-chip-cookies-on-white.jpg",
    createdAt: new Date(),
  },
  {
    id: "10",
    name: "Matcha y chocolate blanco",
    description: "Té verde matcha premium con chips de chocolate blanco",
    price: 4.2,
    imageUrl: "/stack-of-delicious-chocolate-chip-cookies-on-white.jpg",
    createdAt: new Date(),
  },
]

export function getCookies(): Cookie[] {
  return cookiesData
}

export function getCookieById(id: string): Cookie | undefined {
  return cookiesData.find((c) => c.id === id)
}

export function createCookie(cookie: Omit<Cookie, "id" | "createdAt">): Cookie {
  const newCookie: Cookie = {
    ...cookie,
    id: Date.now().toString(),
    createdAt: new Date(),
  }
  cookiesData.push(newCookie)
  return newCookie
}

export function updateCookie(id: string, updates: Partial<Omit<Cookie, "id" | "createdAt">>): Cookie | null {
  const index = cookiesData.findIndex((c) => c.id === id)
  if (index === -1) return null
  cookiesData[index] = { ...cookiesData[index], ...updates }
  return cookiesData[index]
}

export function deleteCookie(id: string): boolean {
  const index = cookiesData.findIndex((c) => c.id === id)
  if (index === -1) return false
  cookiesData.splice(index, 1)
  return true
}
