# 🧪 Guía de Testing - Crosti Cookies

Este proyecto incluye tres tipos principales de pruebas: **Unitarias** (Jest), **End-to-End** (Playwright) y **API** (Postman/Newman). 

Aquí tienes todos los comandos necesarios para ejecutarlos localmente.

---

## 1. Pruebas Unitarias (Jest)
Miden la lógica interna de la aplicación, como el cálculo del carrito de compras, validación de cupones, generación del número de pedido y templates de email. Son extremadamente rápidas de ejecutar.

**Ejecutar todos los tests unitarios:**
```bash
npm run test:unit
```

**Ejecutar tests en modo "Watch" (se re-ejecutan al guardar archivos):**
```bash
npm run test:unit:watch
```

**Generar reporte de cobertura (Coverage):**
```bash
npm run test:coverage
```
*Esto generará una carpeta `tests/coverage/` con un archivo `index.html` que puedes abrir en tu navegador para ver qué porcentaje del código está cubierto por tests.*

---

## 2. Pruebas End-to-End (Playwright)
Simulan un usuario real navegando por la web, haciendo clic en botones, agregando productos al carrito y usando el panel de administrador.

> ⚠️ **Importante:** Antes de ejecutar los tests E2E por primera vez en un equipo nuevo, debes instalar los navegadores de Playwright ejecutando: `npx playwright install --with-deps`

**Ejecutar todos los tests E2E (se ejecutarán en segundo plano, sin abrir ventanas):**
```bash
npm run test:e2e
```

**Ejecutar los tests E2E con interfaz gráfica (viendo cómo el bot navega):**
```bash
npm run test:e2e:ui
```
*Se abrirá una ventana de Playwright donde podrás ver paso a paso lo que hace cada test, ideal para debuggear si algo falla.*

**Ver el reporte HTML de los últimos tests ejecutados:**
```bash
npx playwright show-report
```

---

## 3. Pruebas de API (Postman / Newman)
Valida que los endpoints de la API respondan correctamente y manejen errores (ej. intentos de manipulación de precios).

**Ejecutar los tests de API en la consola:**
```bash
npm run test:api
```

---

## 🚀 Todos los Tests a la vez
Si quieres comprobar la integridad total de la aplicación (por ejemplo, antes de hacer un push a producción), puedes ejecutar este comando que corre todas las suites (Unit, E2E y API) en secuencia:

```bash
npm run test:all
```

---

## 🤖 ¿Cómo funciona la Automatización (CI/CD)?

Estos comandos se ejecutan automáticamente gracias a los workflows configurados en `.github/workflows/`:
- **En cada subida de código (Push / PR):** Se ejecutan los tests unitarios (`npm run test:unit`).
- **Al mezclar en la rama `main`:** Se ejecutan los tests unitarios, los tests E2E (`npm run test:e2e`) y los tests de API (`npm run test:api`). Si algún test falla, el despliegue automático a producción se cancela para proteger la web.
