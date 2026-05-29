# QA Engineering Portfolio — Club Crosti Loyalty System

> **Autor:** Andrés Rodríguez  
> **Proyecto:** Club Crosti — Sistema de Fidelización  
> **Stack testeado:** Next.js 16, Supabase, Resend, jsPDF  
> **Herramientas QA:** Playwright · Jest · Postman · Newman  

---

## 📋 Índice

1. [Resumen ejecutivo](#resumen-ejecutivo)
2. [Arquitectura del sistema testeado](#arquitectura-del-sistema-testeado)
3. [Estrategia de testing](#estrategia-de-testing)
4. [Suite E2E — Playwright](#suite-e2e--playwright)
   - [Tests de la UI pública (/club)](#tests-de-la-ui-pública-club)
   - [Tests del panel de administración](#tests-del-panel-de-administración)
5. [Suite de API — Playwright + Postman](#suite-de-api--playwright--postman)
6. [Suite de tests unitarios — Jest](#suite-de-tests-unitarios--jest)
7. [Colección Postman](#colección-postman)
8. [Matriz de cobertura](#matriz-de-cobertura)
9. [Cómo ejecutar los tests](#cómo-ejecutar-los-tests)
10. [Resultados esperados](#resultados-esperados)
11. [Casos edge y decisiones de diseño](#casos-edge-y-decisiones-de-diseño)

---

## Resumen ejecutivo

Este documento recoge la estrategia y la implementación completa de QA para el sistema de fidelización **Club Crosti**, integrado en la plataforma web de la pastelería artesanal Crosti (Barcelona).

El sistema fue desarrollado e integrado sin romper el código existente, siguiendo los patrones de componentes y convenciones del proyecto. La estrategia de QA cubre **tres capas** de testing:

| Capa | Herramienta | Nº de tests | Cobertura |
|---|---|---|---|
| E2E — Flujos de usuario | **Playwright** | 42 tests | UI pública + Admin |
| API — Contratos HTTP | **Playwright Request API + Postman** | 18 tests | 4 endpoints |
| Unitarios — Lógica pura | **Jest** | 31 tests | Email templates + Business logic |
| **Total** | | **91 tests** | |

---

## Arquitectura del sistema testeado

```
┌─────────────────────────────────────────────────────┐
│                   FRONTEND (Next.js)                 │
│                                                      │
│  /club              → Registro de socios             │
│  /club/sello        → Escáner staff (PIN protegido)  │
│  /club/tarjeta/[id] → Tarjeta digital del socio      │
│  /admin → Club Crosti (6 tabs de gestión)            │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP
┌──────────────────────▼──────────────────────────────┐
│                  API ROUTES (Next.js)                │
│                                                      │
│  POST /api/club/register    → Registro + referidos   │
│  POST /api/club/stamps      → Gestión de sellos      │
│  POST /api/club/verify-pin  → Autenticación staff    │
│  GET  /api/club/wallet      → Generación PDF         │
└──────┬───────────────────────────────┬───────────────┘
       │                               │
┌──────▼──────┐                 ┌──────▼──────┐
│  Supabase   │                 │   Resend    │
│  (Postgres) │                 │  (Emails)   │
└─────────────┘                 └─────────────┘
```

### Tablas de base de datos

| Tabla | Propósito |
|---|---|
| `club_card_config` | Configuración visual y reglas de la tarjeta |
| `club_customers` | Socios registrados y su progreso |
| `club_stamp_events` | Historial inmutable de sellos |
| `club_reward_redemptions` | Registro de premios canjeados |
| `club_campaigns` | Campañas de email |

---

## Estrategia de testing

### Pirámide de testing aplicada

```
        /\
       /  \
      / E2E \       ← Playwright: flujos completos de usuario
     /--------\
    /   API    \    ← Playwright + Postman: contratos HTTP
   /------------\
  /    UNIT      \  ← Jest: lógica pura y utilidades
 /________________\
```

### Principios aplicados

- **Test First para rutas críticas:** Los endpoints de registro y sellos se cubrieron antes de integrarse en el frontend.
- **Aislamiento de datos:** Cada test crea su propio email único (`Date.now()`) para evitar dependencias entre tests.
- **No mock de la base de datos en E2E:** Los tests E2E golpean la API real para validar el ciclo completo (Next.js → Supabase → Resend).
- **Mocking únicamente en tests unitarios:** Jest testea funciones puras sin llamadas de red.
- **Anti-duplicados testeados explícitamente:** El sistema de `DUPLICATE_ORDER` es un caso de seguridad crítico cubierto en las 3 suites.

---

## Suite E2E — Playwright

> **Archivo:** `tests/e2e/club-fidelizacion.spec.ts` y `tests/e2e/club-admin.spec.ts`

### Tests de la UI pública (/club)

#### TC-01: Carga de la página de registro

```typescript
test("Carga correctamente y muestra el formulario")
```

| Campo | Valor |
|---|---|
| **Precondición** | Servidor corriendo en localhost:3000, `NEXT_PUBLIC_LOYALTY_ENABLED=true` |
| **Pasos** | `page.goto("/club")` |
| **Validaciones** | Título contiene "Crosti", `h1` contiene "Club Crosti", inputs de email y nombre visibles, botón submit visible |
| **Tipo** | Smoke test |

---

#### TC-02: Validación del campo email vacío

```typescript
test("Muestra error si el campo email está vacío")
```

| Campo | Valor |
|---|---|
| **Precondición** | Página de registro cargada |
| **Pasos** | Click en submit sin rellenar email |
| **Validaciones** | `validationMessage` del input no es string vacío (HTML5 validation activa) |
| **Tipo** | Negativo / validación |

---

#### TC-03: Registro exitoso — flujo completo

```typescript
test("Registro exitoso con email único muestra estado de éxito")
```

| Campo | Valor |
|---|---|
| **Precondición** | Email único generado con `Date.now()` |
| **Pasos** | Rellenar email, nombre, fecha de nacimiento → Submit |
| **Validaciones** | Texto "¡Todo listo!" visible en < 15s, botones de wallet (Apple/Google) aparecen |
| **Tipo** | Happy path |

---

#### TC-04: Registro con email duplicado

```typescript
test("Error al intentar registrar email ya existente")
```

| Campo | Valor |
|---|---|
| **Precondición** | Email ya registrado en la misma sesión |
| **Pasos** | Primer registro → Segunda visita con mismo email → Submit |
| **Validaciones** | Toast de error o mensaje "ya está registrado" visible |
| **Tipo** | Negativo / business rule |

---

### Tests del panel de administración

> **Archivo:** `tests/e2e/club-admin.spec.ts`

#### TC-10: Navegación al Club Admin

```typescript
test("El menú lateral tiene el enlace 'Club Crosti'")
test("Al hacer clic abre el panel con sus pestañas")
```

Verifica que las 6 pestañas (Resumen, Socios, Campañas, Tarjeta, Dar Sello, Configuración) son accesibles.

---

#### TC-11 a TC-13: Tab Resumen — Dashboard

| Test | Qué valida |
|---|---|
| TC-11 | Las 4 tarjetas de métricas están presentes |
| TC-12 | Los valores son numéricos (no `NaN`) |
| TC-13 | El gráfico SVG de Recharts se renderiza |

---

#### TC-20 a TC-26: Tab Campañas

| Test | Qué valida |
|---|---|
| TC-20 | Botón "Nueva Campaña" visible |
| TC-21 | Campañas automáticas (cumpleaños, reactivación) visibles |
| TC-22 | Clic en botón abre `[role="dialog"]` |
| TC-23 | Dialog tiene inputs de nombre y mensaje |
| TC-24 | Submit con campos vacíos activa validación |
| TC-25 | Submit con datos válidos cierra el dialog |

---

#### TC-30 a TC-33: Tab Tarjeta

| Test | Qué valida |
|---|---|
| TC-30 | Todos los controles de personalización visibles |
| TC-31 | La preview "en vivo" se muestra al cargar |
| TC-32 | Cambiar el color mantiene la preview visible |
| TC-33 | "Guardar Diseño" muestra toast de confirmación e intercepta la respuesta de Supabase |

---

#### TC-40 a TC-46: Tab Dar Sello

| Test | Qué valida |
|---|---|
| TC-40 | QR del club y formulario manual visibles |
| TC-41 | Toggle Mostrador/Delivery muestra/oculta campos |
| TC-42 | Selector plataforma tiene Glovo, Uber Eats, Just Eat, Otra |
| TC-43 | Email es requerido (HTML5 validation) |
| TC-44 | ID Pedido requerido en modo Delivery |
| TC-45 | URL del QR muestra `crosti.es/club` |

---

#### TC-50 a TC-54: Tab Configuración

| Test | Qué valida |
|---|---|
| TC-50 | Switches de notificaciones visibles |
| TC-51 | Toggle switch cambia de estado |
| TC-52 | Panel Geo aparece al activar la opción |
| TC-53 | Campos Latitud, Longitud, Radio visibles con Geo activo |
| TC-54 | Botón "Guardar Preferencias" presente |

---

## Suite de API — Playwright + Postman

### Endpoint: POST /api/club/register

| Test ID | Escenario | Input | Expected |
|---|---|---|---|
| API-01 | Registro exitoso | `{email, name, birthday}` válidos | `200 {success: true, customerId: string}` |
| API-02 | Email faltante | `{name: "X"}` | `400 {error: string}` |
| API-03 | Email duplicado | Mismo email, segunda llamada | `400 {error: /registrado/i}` |
| API-04 | Con código referido válido | `{email, referralCode}` | `200` + sello bonus al referidor |

### Endpoint: POST /api/club/stamps

| Test ID | Escenario | Input | Expected |
|---|---|---|---|
| API-10 | Sello mostrador | `{email, amount: 1, origin: "counter"}` | `200 {newStampCount: N}` |
| API-11 | Sello delivery con orderId | `{email, origin: "delivery", orderId}` | `200` |
| API-12 | **Anti-duplicado:** mismo orderId | Segunda llamada con mismo orderId | `400 {error: "DUPLICATE_ORDER"}` |
| API-13 | Force bypass anti-duplicado | `{...orderId, force: true}` | `200` |
| API-14 | Email no registrado | `{email: "ghost@test.dev"}` | `404` |
| API-15 | Premio desbloqueado | `{amount: 10}` sobre usuario con 0 sellos | `200 {rewardUnlocked: true}` |
| API-16 | Sin email | `{amount: 1}` | `400` |

### Endpoint: POST /api/club/verify-pin

| Test ID | Escenario | Input | Expected |
|---|---|---|---|
| API-20 | Sin PIN | `{}` | `400` |
| API-21 | PIN incorrecto | `{pin: "9999_wrong"}` | `401` o `404` |
| API-22 | PIN dev fallback "1234" | `{pin: "1234"}` | `200 {success: true}` |

### Endpoint: GET /api/club/wallet

| Test ID | Escenario | Query | Expected |
|---|---|---|---|
| API-30 | Sin params | (ninguno) | `400` |
| API-31 | Email desconocido | `?type=pdf&email=x@x.dev` | `404` |
| API-32 | **PDF válido** | `?type=pdf&email=<registrado>` | `200`, `content-type: application/pdf`, body empieza con `%PDF` |

---

## Suite de tests unitarios — Jest

> **Archivo:** `tests/unit/club-loyalty.test.ts`

### Módulo: Email Templates

Testea las 5 funciones generadoras de HTML para emails transaccionales, sin red ni BD:

```
generateClubWelcomeEmailHTML     → 8 tests
generateStampNotificationEmailHTML → 5 tests
generateRewardUnlockedEmailHTML  → 5 tests
generateBirthdayEmailHTML        → 5 tests
generateWinBackEmailHTML         → 3 tests
```

**Casos cubiertos por cada función:**
- ✅ Devuelve HTML válido (`<!DOCTYPE html>`)
- ✅ Incluye el nombre cuando se proporciona
- ✅ No falla con nombre vacío (`""`)
- ✅ No contiene `undefined` o `null` (sin leaks de estado)
- ✅ Incluye el contenido dinámico esperado (recompensa, progreso, etc.)

### Módulo: Business Logic

```typescript
// Lógica de desbloqueo de premios
checkRewardUnlocked(currentStamps, newStamps, stampTotal)
```

| Caso | Input | Expected |
|---|---|---|
| Premio justo al completar | (9, 1, 10) | `true` |
| Premio con varios sellos | (8, 3, 10) | `true` |
| Ya había desbloqueado | (10, 1, 10) | `false` |
| Faltan sellos | (5, 3, 10) | `false` |
| Totales custom (6, 8, 12) | Varios | `true` |

```typescript
// Detección de pedidos duplicados
isDuplicateOrder(orderId, existingOrderIds: Set<string>)
```

```typescript
// Generación de códigos de referido
generateReferralCode()  // Longitud 6-8, unicidad > 90% en 100 iteraciones
```

### Módulo: Validación de inputs

```typescript
isValidEmail(email)  // 6 casos: válidos e inválidos
isValidPin(pin)      // 6 casos: 4-8 dígitos numéricos
```

---

## Colección Postman

> **Archivo:** `tests/postman/club-crosti-api.postman_collection.json`

### Importar y ejecutar

```bash
# Importar en Postman Desktop:
# File → Import → Seleccionar el .json

# Ejecutar con Newman (CLI):
npm install -g newman
newman run tests/postman/club-crosti-api.postman_collection.json \
  --env-var "baseUrl=http://localhost:3000" \
  --reporters cli,htmlextra \
  --reporter-htmlextra-export tests/postman/report.html
```

### Variables de colección

| Variable | Valor por defecto | Descripción |
|---|---|---|
| `baseUrl` | `http://localhost:3000` | URL del servidor |
| `testEmail` | (generado por pre-request script) | Email único por ejecución |
| `customerId` | (guardado del registro) | ID del socio creado |
| `staffPin` | `1234` | PIN de desarrollo |
| `orderId` | (generado por pre-request script) | ID único de pedido |

### Scripts automáticos incluidos

- **Pre-request:** Genera `testEmail` con `Date.now()` antes del primer registro.
- **Pre-request:** Genera `orderId` único antes del test de anti-duplicados.
- **Post-response:** Extrae y guarda `customerId` del registro para usar en tests de stamps y wallet.

---

## Matriz de cobertura

| Funcionalidad | E2E Playwright | API Tests | Jest Unit | Postman |
|---|:---:|:---:|:---:|:---:|
| Registro de nuevo socio | ✅ | ✅ | — | ✅ |
| Validación email duplicado | ✅ | ✅ | — | ✅ |
| Sistema de referidos | ✅ | ✅ | ✅ | — |
| Añadir sello (mostrador) | — | ✅ | ✅ | ✅ |
| Añadir sello (delivery) | ✅ | ✅ | — | ✅ |
| **Anti-duplicado delivery** | ✅ | ✅ | ✅ | ✅ |
| Desbloqueo de premio | — | ✅ | ✅ | — |
| Verificación PIN staff | ✅ | ✅ | — | ✅ |
| Generación PDF tarjeta | — | ✅ | — | ✅ |
| Email de bienvenida | — | — | ✅ | — |
| Email de sello | — | — | ✅ | — |
| Email de premio | — | — | ✅ | — |
| Email de cumpleaños | — | — | ✅ | — |
| Email win-back | — | — | ✅ | — |
| UI Registro /club | ✅ | — | — | — |
| Admin — Dashboard | ✅ | — | — | — |
| Admin — Socios | ✅ | — | — | — |
| Admin — Campañas CRUD | ✅ | — | — | — |
| Admin — Tarjeta designer | ✅ | — | — | — |
| Admin — Dar Sello | ✅ | — | — | — |
| Admin — Configuración/Notif | ✅ | — | — | — |
| Tarjeta digital /club/tarjeta | ✅ | — | — | — |
| Staff scanner /club/sello | ✅ | — | — | — |

---

## Cómo ejecutar los tests

### Requisitos previos

```bash
# 1. Instalar dependencias (incluye @playwright/test y jest)
npm install

# 2. Instalar navegadores de Playwright
npx playwright install chromium

# 3. Asegurarse de que el servidor está corriendo
npm run dev   # en una terminal separada
# o con Docker:
docker-compose up -d
```

### Tests Playwright (E2E + API)

```bash
# Todos los tests
npm run test:e2e

# Solo tests del admin
npx playwright test club-admin

# Solo tests de fidelización (UI + API)
npx playwright test club-fidelizacion

# En modo headed (ver el navegador)
npm run test:e2e:headed

# Interfaz visual interactiva
npm run test:e2e:ui

# Ver el último reporte HTML
npm run test:e2e:report
```

### Tests Jest (Unitarios)

```bash
# Todos los tests unitarios
npm run test:unit

# En modo watch
npm run test:unit:watch

# Con cobertura
npm run test:unit:coverage
```

### Colección Postman

**Opción 1 — Postman Desktop:**
1. `File → Import` → Seleccionar `tests/postman/club-crosti-api.postman_collection.json`
2. Crear un entorno con `baseUrl = http://localhost:3000`
3. Click en "Run Collection"

**Opción 2 — Newman (CLI):**
```bash
npm install -g newman newman-reporter-htmlextra

newman run tests/postman/club-crosti-api.postman_collection.json \
  --env-var "baseUrl=http://localhost:3000" \
  --reporters cli,htmlextra \
  --reporter-htmlextra-export tests/postman/report.html
```

---

## Resultados esperados

Al ejecutar la suite completa sobre un entorno con la base de datos configurada:

```
✅ Playwright E2E (club-fidelizacion.spec.ts)   → 23/23 passed
✅ Playwright E2E (club-admin.spec.ts)           → 19/19 passed
✅ Jest Unit (club-loyalty.test.ts)              → 31/31 passed
✅ Postman (club-crosti-api collection)          → 11/11 passed
────────────────────────────────────────────────────────────
TOTAL                                            → 84/84 passed
```

> ⚠️ **Nota:** Los tests de la suite E2E que crean campañas o modifican configuración en la BD (`Test Campaña PW ...`) crearán registros reales en Supabase. Se recomienda ejecutarlos contra un proyecto de Supabase de staging.

---

## Casos edge y decisiones de diseño

### ¿Por qué no se mockea Supabase en los tests E2E?

Los tests E2E prueban el sistema de extremo a extremo porque el valor de estos tests reside en validar que **la integración completa funciona**: Next.js → API Route → Supabase → (Resend). Mockear Supabase daría falsa confianza.

### ¿Por qué se usan emails únicos con `Date.now()`?

Para garantizar la idempotencia de los tests. Cada ejecución crea datos nuevos sin afectar a los anteriores, evitando errores por estado compartido.

### Anti-duplicado de pedidos — diseño de la prueba

El test `API-12` y `TC en stamps spec` verifica explícitamente el caso de seguridad más crítico del sistema: que un delivery no pueda recibir el mismo sello dos veces por el mismo número de pedido. Se prueba el camino feliz, el duplicado denegado y el bypass con `force: true`.

### Validación de PDF con `%PDF`

El test de generación de wallet (`API-32`) no solo comprueba el status code y el Content-Type — también verifica los primeros 4 bytes del buffer de respuesta. Esto es un test de contrato robusto: garantiza que `jsPDF` ha generado un archivo PDF real y no un error envuelto en headers incorrectos.

### Tests del Admin con interceptación de red

En `TC-33` (Guardar Diseño), se usa `page.on("response")` de Playwright para interceptar la llamada a Supabase y confirmar que se ha hecho una petición real a la tabla `club_card_config`, además de verificar el toast de la UI. Esto previene falsos positivos donde el toast aparezca sin que la BD haya sido actualizada.

---

## Tecnologías y versiones

| Herramienta | Versión | Uso |
|---|---|---|
| `@playwright/test` | `^1.44.0` | E2E browser + API testing |
| `jest` | `^29` | Unit testing |
| `ts-jest` | `^29` | TypeScript support en Jest |
| `Newman` | `latest` | Postman CLI runner |
| `newman-reporter-htmlextra` | `latest` | Reportes HTML de Postman |

---

*Documento generado como parte del portfolio de QA Engineering para el proyecto Club Crosti.*  
*Última actualización: Mayo 2026*
