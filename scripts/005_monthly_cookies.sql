-- ============================================
-- MONTHLY COOKIES FEATURE
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 1. Create table for Monthly Collections
CREATE TABLE IF NOT EXISTS monthly_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL DEFAULT 'Galletas del Mes',
  subtitle TEXT NOT NULL DEFAULT 'Una selección especial disponible solo por tiempo limitado',
  description TEXT, -- Optional marketing text
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  bg_color VARCHAR(20) DEFAULT '#FEFCF5', -- Allow some theming
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create junction table for Items in a Collection
CREATE TABLE IF NOT EXISTS monthly_collection_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID REFERENCES monthly_collections(id) ON DELETE CASCADE,
  cookie_id UUID REFERENCES cookies(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  is_hero BOOLEAN DEFAULT false, -- If we want to highlight one specifically
  custom_tag VARCHAR(50), -- e.g. "Nueva Receta", "Vuelve en Noviembre"
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enable RLS
ALTER TABLE monthly_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_collection_items ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies
-- Allow read access to everyone for active collections
CREATE POLICY "Public can view active monthly collections" ON monthly_collections
  FOR SELECT USING (status = 'active' OR auth.role() = 'authenticated');

CREATE POLICY "Public can view items of active collections" ON monthly_collection_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM monthly_collections 
      WHERE monthly_collections.id = monthly_collection_items.collection_id 
      AND (monthly_collections.status = 'active' OR auth.role() = 'authenticated')
    )
  );

-- Allow full access to authenticated users (admins)
CREATE POLICY "Admins can manage monthly collections" ON monthly_collections
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage monthly collection items" ON monthly_collection_items
  FOR ALL USING (auth.role() = 'authenticated');

-- 5. Trigger for updated_at
CREATE TRIGGER update_monthly_collections_modtime
  BEFORE UPDATE ON monthly_collections
  FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
