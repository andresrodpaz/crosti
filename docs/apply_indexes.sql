-- =================================================================
-- INDICES ESTRATÉGICOS PARA REDUCIR CONSUMO DE DISK I/O EN SUPABASE
-- =================================================================
-- Ejecuta estas sentencias en el SQL Editor de tu panel de Supabase.
-- Eliminan los Sequential Scans en tablas intermedias y aceleran las búsquedas O(log N).

-- 1. Índices para la tabla de relación cookie_tags
CREATE INDEX IF NOT EXISTS idx_cookie_tags_cookie_id ON cookie_tags(cookie_id);
CREATE INDEX IF NOT EXISTS idx_cookie_tags_tag_id ON cookie_tags(tag_id);

-- 2. Índices para los ítems de colecciones mensuales
CREATE INDEX IF NOT EXISTS idx_monthly_collection_items_collection_id ON monthly_collection_items(collection_id);

-- 3. Índices para las cajas predefinidas
CREATE INDEX IF NOT EXISTS idx_box_cookies_box_id ON box_cookies(box_id);

-- 4. Índice compuesto para visibilidad y carrusel de galletas
CREATE INDEX IF NOT EXISTS idx_cookies_visibility ON cookies(is_visible, in_carousel);
