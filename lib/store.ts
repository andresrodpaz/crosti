// Centralized store for all data management

export type Tag = {
  id: string
  name: string
  colorId: string
}

export type FavoriteColor = {
  id: string
  hex: string
  alias: string
}

export type CookieItem = {
  id: string
  name: string
  description: string
  ingredients: string[]
  price: number
  imageUrls: string[] // Changed from single imageUrl to array of imageUrls
  tags: string[] // Tag IDs
  isVisible: boolean
  showInCarousel: boolean
}

export type User = {
  id: string
  email: string
  name: string
  role: "admin" | "editor" | "viewer"
  createdAt: string
}

export type CarouselSettings = {
  maxItems: number
  selectedCookieIds: string[]
}

// Default colors
const defaultColors: FavoriteColor[] = [
  { id: "1", hex: "#22C55E", alias: "Verde (Vegano)" },
  { id: "2", hex: "#F59E0B", alias: "Naranja (Sin Gluten)" },
  { id: "3", hex: "#3B82F6", alias: "Azul (Sin Lactosa)" },
  { id: "4", hex: "#EC4899", alias: "Rosa (Especial)" },
  { id: "5", hex: "#8B5CF6", alias: "Morado (Premium)" },
]

// Default tags
const defaultTags: Tag[] = [
  { id: "1", name: "Vegano", colorId: "1" },
  { id: "2", name: "Sin Gluten", colorId: "2" },
  { id: "3", name: "Sin Lactosa", colorId: "3" },
]

// Default cookies
const defaultCookies: CookieItem[] = [
  {
    id: "1",
    name: "Duo de chocolates y mantequilla de cacahuete",
    description: "Deliciosa combinación de chocolate negro y blanco con mantequilla de cacahuete",
    ingredients: [
      "Harina de trigo",
      "Mantequilla",
      "Chocolate negro 70%",
      "Chocolate blanco",
      "Mantequilla de cacahuete",
      "Huevo",
      "Azúcar moreno",
    ],
    price: 3.5,
    tags: [],
    imageUrls: [], // Updated to array
    isVisible: true,
    showInCarousel: true,
  },
  {
    id: "2",
    name: "Triple chocolate",
    description: "Para los amantes del chocolate: negro, con leche y blanco",
    ingredients: [
      "Harina de trigo",
      "Mantequilla",
      "Chocolate negro",
      "Chocolate con leche",
      "Chocolate blanco",
      "Huevo",
      "Azúcar",
    ],
    price: 3.75,
    tags: [],
    imageUrls: [], // Updated to array
    isVisible: true,
    showInCarousel: true,
  },
  {
    id: "3",
    name: "Avellana y caramelo",
    description: "Crujiente avellana del Piamonte con trozos de caramelo salado",
    ingredients: [
      "Harina de trigo",
      "Mantequilla",
      "Avellanas del Piamonte",
      "Caramelo salado",
      "Huevo",
      "Azúcar moreno",
      "Sal marina",
    ],
    price: 4.0,
    tags: ["1"],
    imageUrls: [], // Updated to array
    isVisible: true,
    showInCarousel: true,
  },
]

// Default users
const defaultUsers: User[] = [
  { id: "1", email: "admin@crosti.com", name: "Administrador", role: "admin", createdAt: new Date().toISOString() },
]

// Default carousel settings
const defaultCarouselSettings: CarouselSettings = {
  maxItems: 7,
  selectedCookieIds: [],
}

// Storage helpers
function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue
  const stored = localStorage.getItem(key)
  return stored ? JSON.parse(stored) : defaultValue
}

function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return
  localStorage.setItem(key, JSON.stringify(value))
}

// Colors CRUD
export function getColors(): FavoriteColor[] {
  return getFromStorage("crosti-colors", defaultColors)
}

export function saveColors(colors: FavoriteColor[]): void {
  saveToStorage("crosti-colors", colors)
}

export function addColor(color: Omit<FavoriteColor, "id">): FavoriteColor {
  const colors = getColors()
  const newColor = { ...color, id: Date.now().toString() }
  colors.push(newColor)
  saveColors(colors)
  return newColor
}

export function updateColor(id: string, updates: Partial<Omit<FavoriteColor, "id">>): void {
  const colors = getColors()
  const index = colors.findIndex((c) => c.id === id)
  if (index !== -1) {
    colors[index] = { ...colors[index], ...updates }
    saveColors(colors)
  }
}

export function deleteColor(id: string): void {
  const colors = getColors().filter((c) => c.id !== id)
  saveColors(colors)
}

// Tags CRUD
export function getTags(): Tag[] {
  return getFromStorage("crosti-tags", defaultTags)
}

export function saveTags(tags: Tag[]): void {
  saveToStorage("crosti-tags", tags)
}

export function addTag(tag: Omit<Tag, "id">): Tag {
  const tags = getTags()
  const newTag = { ...tag, id: Date.now().toString() }
  tags.push(newTag)
  saveTags(tags)
  return newTag
}

export function updateTag(id: string, updates: Partial<Omit<Tag, "id">>): void {
  const tags = getTags()
  const index = tags.findIndex((t) => t.id === id)
  if (index !== -1) {
    tags[index] = { ...tags[index], ...updates }
    saveTags(tags)
  }
}

export function deleteTag(id: string): void {
  const tags = getTags().filter((t) => t.id !== id)
  saveTags(tags)
}

// Cookies CRUD
export function getCookies(): CookieItem[] {
  return getFromStorage("crosti-cookies-v3", defaultCookies)
}

export function saveCookies(cookies: CookieItem[]): void {
  saveToStorage("crosti-cookies-v3", cookies)
}

export function addCookie(cookie: Omit<CookieItem, "id">): CookieItem {
  const cookies = getCookies()
  const newCookie = { ...cookie, id: Date.now().toString(), isVisible: true, showInCarousel: true, imageUrls: [] }
  cookies.push(newCookie)
  saveCookies(cookies)
  return newCookie
}

export function updateCookie(id: string, updates: Partial<Omit<CookieItem, "id">>): void {
  const cookies = getCookies()
  const index = cookies.findIndex((c) => c.id === id)
  if (index !== -1) {
    cookies[index] = { ...cookies[index], ...updates }
    saveCookies(cookies)
  }
}

export function deleteCookie(id: string): void {
  const cookies = getCookies().filter((c) => c.id !== id)
  saveCookies(cookies)
}

export function getVisibleCookies(): CookieItem[] {
  return getCookies().filter((c) => c.isVisible)
}

export function getCarouselCookies(): CookieItem[] {
  const cookies = getCookies()
  const settings = getCarouselSettings()

  if (settings.selectedCookieIds.length > 0) {
    return settings.selectedCookieIds
      .map((id) => cookies.find((c) => c.id === id))
      .filter((c): c is CookieItem => c !== undefined && c.showInCarousel)
      .slice(0, settings.maxItems)
  }

  return cookies.filter((c) => c.showInCarousel).slice(0, settings.maxItems)
}

// Carousel settings
export function getCarouselSettings(): CarouselSettings {
  return getFromStorage("crosti-carousel-settings", defaultCarouselSettings)
}

export function saveCarouselSettings(settings: CarouselSettings): void {
  saveToStorage("crosti-carousel-settings", settings)
}

// Users CRUD
export function getUsers(): User[] {
  return getFromStorage("crosti-users", defaultUsers)
}

export function saveUsers(users: User[]): void {
  saveToStorage("crosti-users", users)
}

export function addUser(user: Omit<User, "id" | "createdAt">): User {
  const users = getUsers()
  const newUser = { ...user, id: Date.now().toString(), createdAt: new Date().toISOString() }
  users.push(newUser)
  saveUsers(users)
  return newUser
}

export function updateUser(id: string, updates: Partial<Omit<User, "id" | "createdAt">>): void {
  const users = getUsers()
  const index = users.findIndex((u) => u.id === id)
  if (index !== -1) {
    users[index] = { ...users[index], ...updates }
    saveUsers(users)
  }
}

export function deleteUser(id: string): void {
  const users = getUsers().filter((u) => u.id !== id)
  saveUsers(users)
}

// Auth helpers
export function getAllowedEmails(): string[] {
  return getUsers().map((u) => u.email)
}

export function isEmailAllowed(email: string): boolean {
  return getAllowedEmails().includes(email.toLowerCase())
}

export type Permission =
  | "manage_cookies"
  | "manage_tags"
  | "manage_colors"
  | "manage_users"
  | "manage_carousel"
  | "export_data"
  | "view_only"

export function getRolePermissions(role: User["role"]): Permission[] {
  switch (role) {
    case "admin":
      return ["manage_cookies", "manage_tags", "manage_colors", "manage_users", "manage_carousel", "export_data"]
    case "editor":
      return ["manage_cookies", "manage_tags", "manage_colors", "manage_carousel", "export_data"]
    case "viewer":
      return ["view_only"]
    default:
      return []
  }
}

export function hasPermission(role: User["role"], permission: Permission): boolean {
  return getRolePermissions(role).includes(permission)
}
