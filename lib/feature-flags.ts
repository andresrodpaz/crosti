/**
 * Flags de funcionalidad.
 */

/**
 * Tienda online (`/tienda`, carrito, checkout, pago, confirmación y `POST /api/orders`).
 *
 * Deshabilitada temporalmente: nada se ha borrado, sólo queda oculto detrás de
 * este flag. Para volver a activar la tienda, pon esta constante a `true`.
 */
// El tipo explícito `boolean` evita que TS estreche el literal y marque como
// muerto el código de la tienda mientras el flag está apagado.
export const STORE_ENABLED: boolean = false
