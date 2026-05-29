/**
 * =====================================================================
 * Club Crosti — Jest Unit Tests
 * =====================================================================
 * Tests for pure utility functions and business logic that don't
 * require a running server or database connection.
 * =====================================================================
 */

import {
  generateClubWelcomeEmailHTML,
  generateStampNotificationEmailHTML,
  generateRewardUnlockedEmailHTML,
  generateBirthdayEmailHTML,
  generateWinBackEmailHTML,
} from "../../lib/club-email-templates"

// ─────────────────────────────────────────────────────────────────────────────
// 1. EMAIL TEMPLATES — generateClubWelcomeEmailHTML
// ─────────────────────────────────────────────────────────────────────────────

describe("generateClubWelcomeEmailHTML", () => {
  const baseReward = "Tu cookie gratis"

  it("devuelve un string de HTML válido", () => {
    const html = generateClubWelcomeEmailHTML("María", 0, baseReward)
    expect(typeof html).toBe("string")
    expect(html).toMatch(/<!DOCTYPE html>/i)
    expect(html).toMatch(/<\/html>/i)
  })

  it("incluye el nombre del cliente cuando se proporciona", () => {
    const html = generateClubWelcomeEmailHTML("Carlos", 0, baseReward)
    expect(html).toContain("Carlos")
  })

  it("no rompe cuando el nombre está vacío", () => {
    const html = generateClubWelcomeEmailHTML("", 0, baseReward)
    expect(html).toMatch(/Club Crosti/i)
    expect(html).not.toContain("undefined")
    expect(html).not.toContain("null")
  })

  it("incluye la descripción del premio", () => {
    const html = generateClubWelcomeEmailHTML("Ana", 0, "Café gratis")
    expect(html).toContain("Café gratis")
  })

  it("muestra los sellos bonus cuando stampCount > 0", () => {
    const html = generateClubWelcomeEmailHTML("Luis", 2, baseReward)
    expect(html).toContain("2")
    expect(html).toMatch(/sello/i)
  })

  it("NO muestra mensaje de sellos cuando stampCount es 0", () => {
    const html = generateClubWelcomeEmailHTML("Luis", 0, baseReward)
    expect(html).not.toContain("regalo de bienvenida")
  })

  it("incluye un enlace al club", () => {
    const html = generateClubWelcomeEmailHTML("Test", 0, baseReward)
    expect(html).toMatch(/href=".*club/i)
  })

  it("incluye la sección de header con color corporativo #930021", () => {
    const html = generateClubWelcomeEmailHTML("Test", 0, baseReward)
    expect(html).toContain("#930021")
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 2. EMAIL TEMPLATES — generateStampNotificationEmailHTML
// ─────────────────────────────────────────────────────────────────────────────

describe("generateStampNotificationEmailHTML", () => {
  it("devuelve HTML válido", () => {
    const html = generateStampNotificationEmailHTML(1, 3, 10)
    expect(html).toMatch(/<!DOCTYPE html>/i)
  })

  it("muestra la cantidad de sellos dados (singular)", () => {
    const html = generateStampNotificationEmailHTML(1, 1, 10)
    expect(html).toContain("+1 Sello")
  })

  it("muestra la cantidad de sellos dados (plural)", () => {
    const html = generateStampNotificationEmailHTML(3, 3, 10)
    expect(html).toContain("+3 Sellos")
  })

  it("muestra el progreso actual sobre el total", () => {
    const html = generateStampNotificationEmailHTML(2, 4, 10)
    expect(html).toContain("4")
    expect(html).toContain("10")
  })

  it("no contiene valores undefined o null", () => {
    const html = generateStampNotificationEmailHTML(1, 5, 10)
    expect(html).not.toContain("undefined")
    expect(html).not.toContain("null")
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 3. EMAIL TEMPLATES — generateRewardUnlockedEmailHTML
// ─────────────────────────────────────────────────────────────────────────────

describe("generateRewardUnlockedEmailHTML", () => {
  it("devuelve HTML válido", () => {
    const html = generateRewardUnlockedEmailHTML("Una cookie de chocolate")
    expect(html).toMatch(/<!DOCTYPE html>/i)
  })

  it("incluye la descripción del premio", () => {
    const html = generateRewardUnlockedEmailHTML("Cookie XL gratis")
    expect(html).toContain("Cookie XL gratis")
  })

  it("contiene mensaje de enhorabuena", () => {
    const html = generateRewardUnlockedEmailHTML("Premio")
    expect(html).toMatch(/enhorabuena|felici/i)
  })

  it("usa color verde para el header del premio", () => {
    const html = generateRewardUnlockedEmailHTML("Premio")
    expect(html).toMatch(/#059669/i) // green-600
  })

  it("no contiene valores undefined o null", () => {
    const html = generateRewardUnlockedEmailHTML("Premio")
    expect(html).not.toContain("undefined")
    expect(html).not.toContain("null")
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 4. EMAIL TEMPLATES — generateBirthdayEmailHTML
// ─────────────────────────────────────────────────────────────────────────────

describe("generateBirthdayEmailHTML", () => {
  it("devuelve HTML válido", () => {
    const html = generateBirthdayEmailHTML("Marta")
    expect(html).toMatch(/<!DOCTYPE html>/i)
  })

  it("incluye el nombre del cliente", () => {
    const html = generateBirthdayEmailHTML("Roberto")
    expect(html).toContain("Roberto")
  })

  it("menciona el sello de regalo", () => {
    const html = generateBirthdayEmailHTML("Pepe")
    expect(html).toMatch(/sello/i)
  })

  it("funciona con nombre vacío sin errores", () => {
    expect(() => generateBirthdayEmailHTML("")).not.toThrow()
    const html = generateBirthdayEmailHTML("")
    expect(html).not.toContain("null")
  })

  it("el asunto implícito hace referencia al cumpleaños", () => {
    const html = generateBirthdayEmailHTML("Test")
    expect(html).toMatch(/cumpleaños/i)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 5. EMAIL TEMPLATES — generateWinBackEmailHTML
// ─────────────────────────────────────────────────────────────────────────────

describe("generateWinBackEmailHTML", () => {
  it("devuelve HTML válido", () => {
    const html = generateWinBackEmailHTML()
    expect(html).toMatch(/<!DOCTYPE html>/i)
  })

  it("menciona que se les echa de menos", () => {
    const html = generateWinBackEmailHTML()
    expect(html).toMatch(/echamos de menos|tiempo/i)
  })

  it("no contiene valores undefined o null", () => {
    const html = generateWinBackEmailHTML()
    expect(html).not.toContain("undefined")
    expect(html).not.toContain("null")
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 6. BUSINESS LOGIC — Stamp & Reward calculations
// ─────────────────────────────────────────────────────────────────────────────

describe("Lógica de negocio — Cálculo de sellos y premios", () => {
  /** Mirror of the reward-unlock logic from /api/club/stamps */
  function checkRewardUnlocked(currentStamps: number, newStamps: number, stampTotal: number): boolean {
    return currentStamps < stampTotal && currentStamps + newStamps >= stampTotal
  }

  it("detecta correctamente que se ha desbloqueado un premio", () => {
    expect(checkRewardUnlocked(9, 1, 10)).toBe(true)
    expect(checkRewardUnlocked(8, 3, 10)).toBe(true)
    expect(checkRewardUnlocked(0, 10, 10)).toBe(true)
  })

  it("no marca como desbloqueado si ya se había desbloqueado antes", () => {
    expect(checkRewardUnlocked(10, 1, 10)).toBe(false)
    expect(checkRewardUnlocked(15, 1, 10)).toBe(false)
  })

  it("no marca como desbloqueado si aún faltan sellos", () => {
    expect(checkRewardUnlocked(5, 3, 10)).toBe(false)
    expect(checkRewardUnlocked(0, 9, 10)).toBe(false)
  })

  it("funciona con total de sellos personalizado (6, 8, 12)", () => {
    expect(checkRewardUnlocked(5, 1, 6)).toBe(true)
    expect(checkRewardUnlocked(7, 1, 8)).toBe(true)
    expect(checkRewardUnlocked(11, 1, 12)).toBe(true)
  })

  /** Duplicate order detection (mirror from stamps route) */
  function isDuplicateOrder(orderId: string, existingOrderIds: Set<string>): boolean {
    return existingOrderIds.has(orderId)
  }

  it("detecta pedidos duplicados correctamente", () => {
    const existing = new Set(["GLV-001", "UE-002"])
    expect(isDuplicateOrder("GLV-001", existing)).toBe(true)
    expect(isDuplicateOrder("GLV-999", existing)).toBe(false)
  })

  /** Referral code generation (mirror of DB default) */
  function generateReferralCode(): string {
    return Math.random().toString(36).substring(2, 10).toUpperCase()
  }

  it("genera códigos de referido de longitud correcta", () => {
    const code = generateReferralCode()
    expect(code.length).toBeGreaterThanOrEqual(6)
    expect(code.length).toBeLessThanOrEqual(8)
  })

  it("genera códigos de referido únicos", () => {
    const codes = new Set(Array.from({ length: 100 }, generateReferralCode))
    expect(codes.size).toBeGreaterThan(90) // Very low probability of collision
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 7. VALIDATION — Input sanitisation helpers
// ─────────────────────────────────────────────────────────────────────────────

describe("Validación de inputs", () => {
  function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  it("acepta emails válidos", () => {
    expect(isValidEmail("user@example.com")).toBe(true)
    expect(isValidEmail("test+tag@mail.co.uk")).toBe(true)
  })

  it("rechaza emails inválidos", () => {
    expect(isValidEmail("")).toBe(false)
    expect(isValidEmail("not-an-email")).toBe(false)
    expect(isValidEmail("@nodomain")).toBe(false)
    expect(isValidEmail("missing@")).toBe(false)
  })

  function isValidPin(pin: string): boolean {
    return /^\d{4,8}$/.test(pin)
  }

  it("acepta PINs numéricos de 4–8 dígitos", () => {
    expect(isValidPin("1234")).toBe(true)
    expect(isValidPin("12345678")).toBe(true)
  })

  it("rechaza PINs inválidos", () => {
    expect(isValidPin("123")).toBe(false)     // Too short
    expect(isValidPin("123456789")).toBe(false) // Too long
    expect(isValidPin("abc4")).toBe(false)     // Non-numeric
    expect(isValidPin("")).toBe(false)
  })
})
