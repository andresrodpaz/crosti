-- Añadir columnas de personalización de colores a monthly_collections
-- Ejecutar en el SQL Editor de Supabase

ALTER TABLE monthly_collections
  ADD COLUMN IF NOT EXISTS text_color TEXT DEFAULT '#924c14',
  ADD COLUMN IF NOT EXISTS title_color TEXT DEFAULT '#930021';

-- Verificar que se añadieron correctamente
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'monthly_collections'
  AND column_name IN ('text_color', 'title_color');
