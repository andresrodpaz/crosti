-- 1. Añadimos columnas esenciales para galleta del mes a la tabla cookies
ALTER TABLE cookies
ADD COLUMN IF NOT EXISTS featured_description TEXT,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- 2. Aseguramos que la tabla colors tenga la estructura que el portal de admin espera 
-- (Si ya existe, esto no sobreescribe nada, pero creará si fue eliminada por error u omitida)
CREATE TABLE IF NOT EXISTS colors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hex TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Asegurar RLS en Colors
ALTER TABLE colors ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura públicas si las necesitas en web, y de autenticacion para edicion
CREATE POLICY "Public read access for colors" ON colors FOR SELECT USING (true);
CREATE POLICY "Admin full access for colors" ON colors FOR ALL USING (auth.role() = 'authenticated');
