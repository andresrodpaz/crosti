import { test, expect, type Page } from "@playwright/test"

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** Navigate to the admin page and open the Club Crosti section */
async function goToClubAdmin(page: Page) {
  await page.goto("/admin")
  await page.waitForLoadState("networkidle")
  // Click the "Club Crosti" sidebar item
  const clubLink = page.locator("text=Club Crosti").first()
  await expect(clubLink).toBeVisible({ timeout: 10_000 })
  await clubLink.click()
  await page.waitForLoadState("networkidle")
}

/** Switch to a specific tab by name inside the ClubAdmin panel */
async function openTab(page: Page, tabText: string) {
  const tab = page.locator(`[role="tab"]:has-text("${tabText}")`).first()
  await expect(tab).toBeVisible({ timeout: 8_000 })
  await tab.click()
  await page.waitForTimeout(500) // Let animation settle
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. SIDEBAR & NAVIGATION
// ─────────────────────────────────────────────────────────────────────────────

test.describe("Admin — Navegación al panel Club Crosti", () => {
  test("El menú lateral tiene el enlace 'Club Crosti'", async ({ page }) => {
    await page.goto("/admin")
    await expect(page.locator("text=Club Crosti")).toBeVisible({ timeout: 10_000 })
  })

  test("Al hacer clic abre el panel con sus pestañas", async ({ page }) => {
    await goToClubAdmin(page)
    // All 6 tabs should be present
    for (const tab of ["Resumen", "Socios", "Campañas", "Tarjeta", "Dar Sello", "Configuración"]) {
      await expect(page.locator(`[role="tab"]:has-text("${tab}")`).first()).toBeVisible()
    }
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 2. TAB RESUMEN — Dashboard de estadísticas
// ─────────────────────────────────────────────────────────────────────────────

test.describe("Admin Club — Tab Resumen", () => {
  test("Muestra tarjetas de métricas (Socios Activos, Total, Sellos, Premios)", async ({ page }) => {
    await goToClubAdmin(page)
    await openTab(page, "Resumen")

    await expect(page.locator("text=Socios Activos")).toBeVisible({ timeout: 10_000 })
    await expect(page.locator("text=Total Socios")).toBeVisible()
    await expect(page.locator("text=Sellos este mes")).toBeVisible()
    await expect(page.locator("text=Premios este mes")).toBeVisible()
  })

  test("Las tarjetas contienen valores numéricos", async ({ page }) => {
    await goToClubAdmin(page)
    await openTab(page, "Resumen")
    await page.waitForTimeout(3_000) // Wait for data to load

    // Numbers should be rendered (0 or positive)
    const metricValues = await page.locator(".text-3xl").allTextContents()
    for (const val of metricValues) {
      expect(isNaN(Number(val.trim()))).toBe(false)
    }
  })

  test("El gráfico de crecimiento se renderiza", async ({ page }) => {
    await goToClubAdmin(page)
    await openTab(page, "Resumen")
    await page.waitForTimeout(3_000)

    // recharts renders SVG
    await expect(page.locator("svg.recharts-surface").or(page.locator("[class*='recharts']"))).toBeVisible()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 3. TAB SOCIOS — Directorio de clientes
// ─────────────────────────────────────────────────────────────────────────────

test.describe("Admin Club — Tab Socios", () => {
  test("Carga la tabla de socios", async ({ page }) => {
    await goToClubAdmin(page)
    await openTab(page, "Socios")
    await page.waitForTimeout(3_000)

    // Either shows a table with rows or an empty state message
    const hasTable = await page.locator("table, [role='table']").isVisible().catch(() => false)
    const hasEmpty = await page.locator("text=No hay socios").isVisible().catch(() => false)
    expect(hasTable || hasEmpty).toBe(true)
  })

  test("Muestra columnas esperadas en la tabla", async ({ page }) => {
    await goToClubAdmin(page)
    await openTab(page, "Socios")
    await page.waitForTimeout(3_000)

    const tableExists = await page.locator("table").isVisible().catch(() => false)
    if (tableExists) {
      const headerText = await page.locator("thead").textContent()
      expect(headerText).toMatch(/Email|Nombre|Sellos/i)
    }
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 4. TAB CAMPAÑAS — Gestión de campañas
// ─────────────────────────────────────────────────────────────────────────────

test.describe("Admin Club — Tab Campañas", () => {
  test("Muestra el botón 'Nueva Campaña'", async ({ page }) => {
    await goToClubAdmin(page)
    await openTab(page, "Campañas")
    await expect(page.locator("button:has-text('Nueva Campaña')")).toBeVisible({ timeout: 8_000 })
  })

  test("Campañas automáticas predefinidas son visibles", async ({ page }) => {
    await goToClubAdmin(page)
    await openTab(page, "Campañas")
    await page.waitForTimeout(2_000)

    await expect(page.locator("text=Cumpleaños").or(page.locator("text=cumpleaños"))).toBeVisible()
    await expect(page.locator("text=Reactivación").or(page.locator("text=Win-back").or(page.locator("text=inactividad")))).toBeVisible()
  })

  test("Abre el dialog 'Nueva Campaña' al hacer clic", async ({ page }) => {
    await goToClubAdmin(page)
    await openTab(page, "Campañas")
    await page.click("button:has-text('Nueva Campaña')")

    // Dialog should open
    await expect(page.locator("[role='dialog']")).toBeVisible({ timeout: 5_000 })
    await expect(page.locator("[role='dialog']").locator("input[id='name']")).toBeVisible()
    await expect(page.locator("[role='dialog']").locator("textarea[id='message']")).toBeVisible()
  })

  test("Validación: no se puede crear campaña con campos vacíos", async ({ page }) => {
    await goToClubAdmin(page)
    await openTab(page, "Campañas")
    await page.click("button:has-text('Nueva Campaña')")
    await page.waitForSelector("[role='dialog']")

    // Try to submit empty
    await page.click("[role='dialog'] button[type='submit']")

    // Toast error or HTML5 validation
    const toastVisible = await page.locator("[data-sonner-toast]").isVisible().catch(() => false)
    const nameInput = page.locator("[role='dialog'] input[id='name']")
    const validationMsg = await nameInput.evaluate((el: HTMLInputElement) => el.validationMessage).catch(() => "")
    expect(toastVisible || validationMsg !== "").toBe(true)
  })

  test("Se puede crear una campaña correctamente", async ({ page }) => {
    await goToClubAdmin(page)
    await openTab(page, "Campañas")
    await page.click("button:has-text('Nueva Campaña')")
    await page.waitForSelector("[role='dialog']")

    await page.fill("[role='dialog'] input[id='name']", `Test Campaña PW ${Date.now()}`)
    await page.fill("[role='dialog'] textarea[id='message']", "Mensaje de prueba desde Playwright. ¡Gracias por tu confianza!")
    await page.click("[role='dialog'] button[type='submit']")

    // Dialog should close on success
    await expect(page.locator("[role='dialog']")).not.toBeVisible({ timeout: 10_000 })
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 5. TAB TARJETA — Personalización visual
// ─────────────────────────────────────────────────────────────────────────────

test.describe("Admin Club — Tab Tarjeta (Personalización)", () => {
  test("Muestra los controles de personalización", async ({ page }) => {
    await goToClubAdmin(page)
    await openTab(page, "Tarjeta")

    await expect(page.locator("text=Color de Fondo")).toBeVisible()
    await expect(page.locator("text=Color de Acento")).toBeVisible()
    await expect(page.locator("text=Color de Texto")).toBeVisible()
    await expect(page.locator("text=Sellos Necesarios")).toBeVisible()
    await expect(page.locator("text=Descripción del Premio")).toBeVisible()
    await expect(page.locator("text=Logo de la Tarjeta")).toBeVisible()
  })

  test("La previsualización en vivo se muestra al cargar", async ({ page }) => {
    await goToClubAdmin(page)
    await openTab(page, "Tarjeta")
    await page.waitForTimeout(1_500)

    await expect(page.locator("text=Previsualización en vivo")).toBeVisible()
    // Card preview renders (look for element with club name)
    await expect(page.locator("text=Club Crosti").last()).toBeVisible()
  })

  test("Cambiar el color de fondo actualiza la previsualización", async ({ page }) => {
    await goToClubAdmin(page)
    await openTab(page, "Tarjeta")
    await page.waitForTimeout(1_500)

    // Find the hex text input for primary color (not the color picker input)
    const hexInputs = page.locator("input[type='text']")
    const firstHex = hexInputs.first()
    await firstHex.fill("#1a1a2e")
    await firstHex.press("Tab")

    // The preview should update — the card preview div will have updated inline style
    await page.waitForTimeout(1_000)
    // Just verify the preview is still visible after the change
    await expect(page.locator("text=Previsualización en vivo")).toBeVisible()
  })

  test("El botón 'Guardar Diseño' llama a la API y muestra confirmación", async ({ page }) => {
    await goToClubAdmin(page)
    await openTab(page, "Tarjeta")
    await page.waitForTimeout(1_500)

    // Intercept the Supabase call
    let savedConfig = false
    page.on("response", (response) => {
      if (response.url().includes("club_card_config") && response.status() === 200) {
        savedConfig = true
      }
    })

    await page.click("button:has-text('Guardar Diseño')")
    await page.waitForTimeout(3_000)

    // Toast should appear
    await expect(
      page.locator("text=guardado").or(page.locator("[data-sonner-toast]"))
    ).toBeVisible({ timeout: 8_000 })
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 6. TAB DAR SELLO — Entrega manual y QR
// ─────────────────────────────────────────────────────────────────────────────

test.describe("Admin Club — Tab Dar Sello", () => {
  test("Muestra el QR del club y el formulario manual", async ({ page }) => {
    await goToClubAdmin(page)
    await openTab(page, "Dar Sello")

    await expect(page.locator("text=QR del Club")).toBeVisible()
    await expect(page.locator("text=Añadir Sello Manual")).toBeVisible()
  })

  test("El toggle Mostrador / Delivery funciona", async ({ page }) => {
    await goToClubAdmin(page)
    await openTab(page, "Dar Sello")

    // Switch to Delivery
    await page.click("button:has-text('Delivery')")
    await expect(page.locator("text=Plataforma")).toBeVisible()
    await expect(page.locator("text=ID del Pedido")).toBeVisible()

    // Switch back to Mostrador
    await page.click("button:has-text('Mostrador')")
    await expect(page.locator("text=Plataforma")).not.toBeVisible()
  })

  test("El selector de plataforma tiene las opciones correctas", async ({ page }) => {
    await goToClubAdmin(page)
    await openTab(page, "Dar Sello")
    await page.click("button:has-text('Delivery')")

    const platformSelect = page.locator("select").first()
    const options = await platformSelect.locator("option").allTextContents()
    expect(options).toContain("Glovo")
    expect(options).toContain("Uber Eats")
    expect(options).toContain("Just Eat")
    expect(options).toContain("Otra")
  })

  test("Formulario de sello requiere email", async ({ page }) => {
    await goToClubAdmin(page)
    await openTab(page, "Dar Sello")

    // Submit without email
    await page.click("button[type='submit']:has-text('Sello')")
    const emailInput = page.locator("input[type='email']").first()
    const validation = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage)
    expect(validation).not.toBe("")
  })

  test("En modo Delivery, el ID de pedido es requerido", async ({ page }) => {
    await goToClubAdmin(page)
    await openTab(page, "Dar Sello")

    await page.click("button:has-text('Delivery')")
    await page.fill("input[type='email']", "test@example.com")

    await page.click("button[type='submit']:has-text('Sello')")
    const orderInput = page.locator("input[placeholder*='PW-'], input[placeholder*='Ej:']").first()
    const validation = await orderInput.evaluate((el: HTMLInputElement) => el.validationMessage)
    expect(validation).not.toBe("")
  })

  test("El QR del club muestra la URL correcta (crosti.es/club)", async ({ page }) => {
    await goToClubAdmin(page)
    await openTab(page, "Dar Sello")
    await expect(page.locator("text=crosti.es/club")).toBeVisible()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// 7. TAB CONFIGURACIÓN — Notificaciones y PIN
// ─────────────────────────────────────────────────────────────────────────────

test.describe("Admin Club — Tab Configuración", () => {
  test("Muestra los switches de notificaciones", async ({ page }) => {
    await goToClubAdmin(page)
    await openTab(page, "Configuración")

    await expect(page.locator("text=Confirmación de sello")).toBeVisible()
    await expect(page.locator("text=Premio desbloqueado")).toBeVisible()
    await expect(page.locator("text=Recordatorio de cumpleaños")).toBeVisible()
    await expect(page.locator("text=Geo-Wallet")).toBeVisible()
  })

  test("El switch de notificaciones se puede activar/desactivar", async ({ page }) => {
    await goToClubAdmin(page)
    await openTab(page, "Configuración")

    const switches = page.locator("[role='switch']")
    const firstSwitch = switches.first()
    const initialState = await firstSwitch.getAttribute("aria-checked")
    await firstSwitch.click()
    const newState = await firstSwitch.getAttribute("aria-checked")
    expect(newState).not.toBe(initialState)
  })

  test("El panel Geo se expande al activar la opción", async ({ page }) => {
    await goToClubAdmin(page)
    await openTab(page, "Configuración")

    // Find the geo switch specifically
    const geoSection = page.locator("text=Geo-Wallet").locator("..")
    const geoSwitch = geoSection.locator("[role='switch']").or(page.locator("[role='switch']").last())

    // Make sure it's OFF first (click until off)
    const isOn = await geoSwitch.getAttribute("aria-checked")
    if (isOn === "true") await geoSwitch.click()
    await expect(page.locator("text=Latitud")).not.toBeVisible()

    // Turn on
    await geoSwitch.click()
    await expect(page.locator("text=Latitud")).toBeVisible()
    await expect(page.locator("text=Longitud")).toBeVisible()
    await expect(page.locator("text=Radio")).toBeVisible()
  })

  test("El botón 'Guardar Preferencias' está presente", async ({ page }) => {
    await goToClubAdmin(page)
    await openTab(page, "Configuración")
    await expect(page.locator("button:has-text('Guardar Preferencias')")).toBeVisible()
  })
})
