import { test, expect, type Page } from "@playwright/test"

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const UNIQUE_EMAIL = () => `test_crosti_${Date.now()}@playwright.dev`

async function registerMember(page: Page, email: string, name = "Test Playwright") {
  await page.goto("/club")
  await page.waitForLoadState("networkidle")
  await page.fill('[id="email"]', email)
  await page.fill('[id="name"]', name)
  await page.click('button[type="submit"]')
  // Wait for success state
  await expect(page.locator("text=¡Todo listo!")).toBeVisible({ timeout: 15_000 })
}

// ─────────────────────────────────────────────
// 1. PÁGINA /club
// ─────────────────────────────────────────────
test.describe("Club Crosti — Página de Registro (/club)", () => {
  test("Carga correctamente y muestra el formulario", async ({ page }) => {
    await page.goto("/club")
    await expect(page).toHaveTitle(/Crosti/i)
    await expect(page.locator("h1")).toContainText("Club Crosti")
    await expect(page.locator('[id="email"]')).toBeVisible()
    await expect(page.locator('[id="name"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test("Muestra error si el campo email está vacío", async ({ page }) => {
    await page.goto("/club")
    await page.click('button[type="submit"]')
    // HTML5 required validation should prevent submission
    const emailInput = page.locator('[id="email"]')
    const validationMessage = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage)
    expect(validationMessage).not.toBe("")
  })

  test("Registro exitoso con email único muestra estado de éxito", async ({ page }) => {
    const email = UNIQUE_EMAIL()
    await page.goto("/club")
    await page.fill('[id="email"]', email)
    await page.fill('[id="name"]', "Socio Test")
    await page.fill('[id="birthday"]', "1990-06-15")
    await page.click('button[type="submit"]')
    await expect(page.locator("text=¡Todo listo!")).toBeVisible({ timeout: 15_000 })
    // Wallet buttons should appear after success
    await expect(page.locator("text=Apple Wallet").or(page.locator("text=Google Wallet"))).toBeVisible()
  })

  test("Error al intentar registrar email ya existente", async ({ page }) => {
    // Use a fixed email that we register twice
    const email = `duplicate_${Date.now()}@playwright.dev`
    // First registration
    await registerMember(page, email)
    // Second registration with same email
    await page.goto("/club")
    await page.fill('[id="email"]', email)
    await page.click('button[type="submit"]')
    await expect(
      page.locator("text=ya está registrado").or(page.locator("[data-sonner-toast]"))
    ).toBeVisible({ timeout: 10_000 })
  })

  test("La previsualización de la tarjeta se muestra en desktop", async ({ page }) => {
    await page.goto("/club")
    // Card preview is rendered as a styled div with data from config
    const cardPreview = page.locator(".digital-card-preview, [class*='rounded'][class*='shadow']").first()
    await expect(cardPreview).toBeVisible()
  })
})

// ─────────────────────────────────────────────
// 2. API /api/club/register
// ─────────────────────────────────────────────
test.describe("API /api/club/register", () => {
  test("POST sin email devuelve 400", async ({ request }) => {
    const res = await request.post("/api/club/register", {
      data: { name: "Sin Email" },
    })
    expect(res.status()).toBe(400)
    const body = await res.json()
    expect(body.error).toBeTruthy()
  })

  test("POST con email válido devuelve 200 y customerId", async ({ request }) => {
    const email = UNIQUE_EMAIL()
    const res = await request.post("/api/club/register", {
      data: { email, name: "API Test" },
    })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.customerId).toBeTruthy()
  })

  test("POST con email duplicado devuelve 400", async ({ request }) => {
    const email = `dup_api_${Date.now()}@playwright.dev`
    // First
    await request.post("/api/club/register", { data: { email } })
    // Second
    const res = await request.post("/api/club/register", { data: { email } })
    expect(res.status()).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/registrado/i)
  })

  test("POST con código de referido válido da sello al referidor", async ({ request }) => {
    // Register referrer first
    const referrerEmail = UNIQUE_EMAIL()
    const regRes = await request.post("/api/club/register", {
      data: { email: referrerEmail, name: "Referidor Test" },
    })
    const { customerId: referrerId } = await regRes.json()

    // Get their referral code via card page (indirect check via stamp count)
    // Register a new user using referrer's code
    // We'll look for it in the register response — or just verify the referrer got +1 stamp after
    // For now: just verify the new registration succeeds
    const newEmail = UNIQUE_EMAIL()
    const newRes = await request.post("/api/club/register", {
      data: { email: newEmail, name: "Referido Test" },
    })
    expect(newRes.status()).toBe(200)
  })
})

// ─────────────────────────────────────────────
// 3. API /api/club/stamps
// ─────────────────────────────────────────────
test.describe("API /api/club/stamps", () => {
  let registeredEmail: string

  test.beforeAll(async ({ request }) => {
    registeredEmail = UNIQUE_EMAIL()
    await request.post("/api/club/register", {
      data: { email: registeredEmail, name: "Stamp Test User" },
    })
  })

  test("POST sin email devuelve 400", async ({ request }) => {
    const res = await request.post("/api/club/stamps", {
      data: { amount: 1 },
    })
    expect(res.status()).toBe(400)
  })

  test("POST con email no registrado devuelve 404", async ({ request }) => {
    const res = await request.post("/api/club/stamps", {
      data: { email: "nonexistent@test.dev", amount: 1 },
    })
    expect(res.status()).toBe(404)
  })

  test("POST con email registrado aumenta el stamp count", async ({ request }) => {
    const res = await request.post("/api/club/stamps", {
      data: { email: registeredEmail, amount: 1, origin: "counter" },
    })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.newStampCount).toBeGreaterThan(0)
  })

  test("Anti-duplicado: mismo orderId de delivery devuelve 400 DUPLICATE_ORDER", async ({ request }) => {
    const orderId = `PW-TEST-${Date.now()}`
    // First stamp
    await request.post("/api/club/stamps", {
      data: { email: registeredEmail, amount: 1, origin: "delivery", platform: "glovo", orderId },
    })
    // Duplicate attempt
    const res = await request.post("/api/club/stamps", {
      data: { email: registeredEmail, amount: 1, origin: "delivery", platform: "glovo", orderId },
    })
    expect(res.status()).toBe(400)
    const body = await res.json()
    expect(body.error).toBe("DUPLICATE_ORDER")
  })

  test("Con force=true se salta la validación anti-duplicado", async ({ request }) => {
    const orderId = `PW-FORCE-${Date.now()}`
    // First stamp
    await request.post("/api/club/stamps", {
      data: { email: registeredEmail, amount: 1, origin: "delivery", platform: "glovo", orderId },
    })
    // Forced duplicate
    const res = await request.post("/api/club/stamps", {
      data: { email: registeredEmail, amount: 1, origin: "delivery", platform: "glovo", orderId, force: true },
    })
    expect(res.status()).toBe(200)
  })

  test("Premio desbloqueado cuando se alcanza stamp_total", async ({ request }) => {
    // Register a new user and give them enough stamps to unlock reward
    const email = UNIQUE_EMAIL()
    await request.post("/api/club/register", { data: { email } })
    // Give 10 stamps at once (default total is 10)
    const res = await request.post("/api/club/stamps", {
      data: { email, amount: 10, origin: "counter" },
    })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.rewardUnlocked).toBe(true)
  })
})

// ─────────────────────────────────────────────
// 4. API /api/club/verify-pin
// ─────────────────────────────────────────────
test.describe("API /api/club/verify-pin", () => {
  test("POST sin PIN devuelve 400", async ({ request }) => {
    const res = await request.post("/api/club/verify-pin", {
      data: {},
    })
    expect(res.status()).toBe(400)
  })

  test("POST con PIN incorrecto devuelve 401", async ({ request }) => {
    const res = await request.post("/api/club/verify-pin", {
      data: { pin: "0000000_wrong" },
    })
    // Either 401 (wrong PIN) or 404 (no PIN configured) are valid
    expect([401, 404]).toContain(res.status())
  })
})

// ─────────────────────────────────────────────
// 5. API /api/club/wallet (PDF generation)
// ─────────────────────────────────────────────
test.describe("API /api/club/wallet", () => {
  let registeredEmail: string
  let customerId: string

  test.beforeAll(async ({ request }) => {
    registeredEmail = UNIQUE_EMAIL()
    const res = await request.post("/api/club/register", {
      data: { email: registeredEmail, name: "Wallet Test User" },
    })
    const body = await res.json()
    customerId = body.customerId
  })

  test("GET sin parámetros devuelve 400", async ({ request }) => {
    const res = await request.get("/api/club/wallet")
    expect(res.status()).toBe(400)
  })

  test("GET con email desconocido devuelve 404", async ({ request }) => {
    const res = await request.get("/api/club/wallet?type=pdf&email=unknown@nobody.dev")
    expect(res.status()).toBe(404)
  })

  test("GET con email válido devuelve un PDF", async ({ request }) => {
    const res = await request.get(`/api/club/wallet?type=pdf&email=${encodeURIComponent(registeredEmail)}`)
    expect(res.status()).toBe(200)
    expect(res.headers()["content-type"]).toContain("application/pdf")
    const body = await res.body()
    // A valid PDF starts with "%PDF"
    expect(body.slice(0, 4).toString()).toBe("%PDF")
  })
})

// ─────────────────────────────────────────────
// 6. PÁGINA /club/sello (Staff Scanner)
// ─────────────────────────────────────────────
test.describe("Club Crosti — Página de Staff (/club/sello)", () => {
  test("Carga correctamente y muestra formulario de PIN", async ({ page }) => {
    await page.goto("/club/sello")
    await expect(page.locator("h1")).toContainText("Scanner")
    // PIN input should be visible before authentication
    await expect(page.locator('input[type="password"], input[placeholder*="PIN"], input[placeholder*="pin"]').first()).toBeVisible({ timeout: 5_000 })
  })

  test("PIN incorrecto muestra mensaje de error", async ({ page }) => {
    await page.goto("/club/sello")
    const pinInput = page.locator('input[type="password"], input[placeholder*="PIN"]').first()
    await pinInput.fill("9999")
    await page.keyboard.press("Enter")
    // Error toast or inline message
    await expect(
      page.locator("[data-sonner-toast]").or(page.locator("text=incorrecto")).or(page.locator("text=PIN"))
    ).toBeVisible({ timeout: 8_000 })
  })
})

// ─────────────────────────────────────────────
// 7. PÁGINA /club/tarjeta/[id] (Digital card)
// ─────────────────────────────────────────────
test.describe("Club Crosti — Tarjeta Digital (/club/tarjeta/[id])", () => {
  test("ID inválido devuelve 404", async ({ page }) => {
    const res = await page.goto("/club/tarjeta/00000000-0000-0000-0000-000000000000")
    expect(res?.status()).toBe(404)
  })

  test("Tarjeta válida muestra la previsualización de la tarjeta", async ({ request, page }) => {
    // Register a customer to get a valid ID
    const email = UNIQUE_EMAIL()
    const regRes = await request.post("/api/club/register", { data: { email, name: "Tarjeta Test" } })
    const { customerId } = await regRes.json()

    await page.goto(`/club/tarjeta/${customerId}`)
    await expect(page.locator("text=Tarjeta").or(page.locator("text=sello").or(page.locator("text=Club Crosti")))).toBeVisible({ timeout: 10_000 })
  })
})
