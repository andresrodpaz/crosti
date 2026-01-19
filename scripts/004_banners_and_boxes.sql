-- ============================================
-- BANNERS AND BOXES TABLES
-- ============================================

-- Banners table for promotional announcements
CREATE TABLE IF NOT EXISTS banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  subtitle TEXT,
  link_url TEXT,
  link_text VARCHAR(100),
  background_color VARCHAR(7) DEFAULT '#930021',
  text_color VARCHAR(7) DEFAULT '#F8E19A',
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  starts_at TIMESTAMP WITH TIME ZONE,
  ends_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Predefined boxes table
CREATE TABLE IF NOT EXISTS cookie_boxes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 6,
  image_url TEXT,
  is_visible BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Junction table for box contents (which cookies are in each box)
CREATE TABLE IF NOT EXISTS box_cookies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  box_id UUID REFERENCES cookie_boxes(id) ON DELETE CASCADE,
  cookie_id UUID REFERENCES cookies(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE cookie_boxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE box_cookies ENABLE ROW LEVEL SECURITY;

-- Public read access for banners (active only)
CREATE POLICY "Public can view active banners" ON banners
  FOR SELECT USING (is_active = true);

-- Public read access for visible boxes
CREATE POLICY "Public can view visible boxes" ON cookie_boxes
  FOR SELECT USING (is_visible = true);

-- Public read access for box contents
CREATE POLICY "Public can view box cookies" ON box_cookies
  FOR SELECT USING (true);

-- Admin full access for banners
CREATE POLICY "Admins can manage banners" ON banners
  FOR ALL USING (true);

-- Admin full access for boxes
CREATE POLICY "Admins can manage boxes" ON cookie_boxes
  FOR ALL USING (true);

-- Admin full access for box contents
CREATE POLICY "Admins can manage box cookies" ON box_cookies
  FOR ALL USING (true);

-- Insert sample banner
INSERT INTO banners (title, subtitle, link_url, link_text, is_active) VALUES
  ('Nuevas galletas de temporada', 'Descubre nuestros sabores de invierno con chocolate caliente y canela', '/tienda', 'Ver novedades', true);

-- Insert sample box
INSERT INTO cookie_boxes (name, description, price, quantity, is_visible) VALUES
  ('Caja Clásica', 'Nuestra selección de los 6 sabores más populares', 18.00, 6, true),
  ('Caja Chocolate Lover', 'Para los amantes del chocolate: 6 variedades de chocolate', 20.00, 6, true);
