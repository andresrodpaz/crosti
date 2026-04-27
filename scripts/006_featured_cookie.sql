-- ============================================================
-- TABLA SEPARADA: featured_cookie
-- Guarda UNA sola galleta destacada del mes.
-- Completamente independiente de monthly_collections.
-- ============================================================

CREATE TABLE IF NOT EXISTS featured_cookie (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cookie_id UUID REFERENCES cookies(id) ON DELETE SET NULL,
  custom_description TEXT,          -- Descripción especial para la home
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE featured_cookie ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view featured cookie" ON featured_cookie
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage featured cookie" ON featured_cookie
  FOR ALL USING (auth.role() = 'authenticated');

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_featured_cookie_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_featured_cookie_modtime
  BEFORE UPDATE ON featured_cookie
  FOR EACH ROW EXECUTE PROCEDURE update_featured_cookie_timestamp();

-- Insertar una fila vacía inicial (patrón singleton)
INSERT INTO featured_cookie (cookie_id, custom_description, is_active)
SELECT NULL, NULL, false
WHERE NOT EXISTS (SELECT 1 FROM featured_cookie);
