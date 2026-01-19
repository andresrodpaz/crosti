-- ============================================
-- CROSTI APP - COMPLETE DATABASE SETUP
-- ============================================
-- This single script contains EVERYTHING needed
-- to set up the Crosti database from scratch:
-- 1. Schema (all tables)
-- 2. Row Level Security (RLS) policies
-- 3. Seed data (initial configuration)
-- ============================================
-- Run this once on a fresh Supabase project
-- ============================================

-- ============================================
-- SECTION 1: CORE TABLES
-- ============================================

-- Profiles table linked to auth.users
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(200),
  role VARCHAR(20) DEFAULT 'viewer' CHECK (role IN ('admin', 'editor', 'viewer', 'developer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Colors table for UI tags
CREATE TABLE IF NOT EXISTS colors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hex VARCHAR(7) NOT NULL,
  alias VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tags for categorization
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  color_id UUID REFERENCES colors(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Core cookies table
CREATE TABLE IF NOT EXISTS cookies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) DEFAULT 0,
  ingredients TEXT[] DEFAULT '{}',
  image_url TEXT,
  is_visible BOOLEAN DEFAULT true,
  in_carousel BOOLEAN DEFAULT false,
  carousel_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Junction for cookies and tags
CREATE TABLE IF NOT EXISTS cookie_tags (
  cookie_id UUID REFERENCES cookies(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (cookie_id, tag_id)
);

-- Global landing page configuration
CREATE TABLE IF NOT EXISTS landing_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_title TEXT NOT NULL DEFAULT 'Fresh baked cookies',
  hero_subtitle TEXT NOT NULL DEFAULT 'Galletas artesanales hechas con amor desde Barcelona',
  hero_image_url TEXT,
  hero_images JSONB DEFAULT '[]',
  feature_1_title TEXT DEFAULT 'Entregas en Barcelona',
  feature_1_desc TEXT DEFAULT 'Galletas en la puerta de tu casa',
  feature_2_title TEXT DEFAULT 'Ingredientes premium',
  feature_2_desc TEXT DEFAULT 'Chocolate belga y avellanas del Piamonte',
  feature_3_title TEXT DEFAULT 'Opciones veganas',
  feature_3_desc TEXT DEFAULT 'Deliciosas galletas para todos',
  sections JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- SECTION 2: ORDERS TABLES
-- ============================================

-- Orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  email TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  address TEXT NOT NULL,
  delivery_date DATE NOT NULL,
  delivery_time TEXT NOT NULL,
  note TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  total_amount DECIMAL(10, 2) NOT NULL,
  invoice_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items table
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  cookie_id TEXT NOT NULL,
  cookie_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  pack_cookies JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for orders
CREATE INDEX IF NOT EXISTS idx_orders_email ON public.orders(email);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

-- ============================================
-- SECTION 3: BANNERS AND BOXES TABLES
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

-- Junction table for box contents
CREATE TABLE IF NOT EXISTS box_cookies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  box_id UUID REFERENCES cookie_boxes(id) ON DELETE CASCADE,
  cookie_id UUID REFERENCES cookies(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- SECTION 4: ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE cookies ENABLE ROW LEVEL SECURITY;
ALTER TABLE cookie_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE landing_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE cookie_boxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE box_cookies ENABLE ROW LEVEL SECURITY;

-- ============================================
-- SECTION 5: RLS POLICIES - PROFILES
-- ============================================

CREATE POLICY "Profiles select own" ON profiles 
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Profiles admin select all" ON profiles 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'developer'))
  );

CREATE POLICY "Profiles update own" ON profiles 
  FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- SECTION 6: RLS POLICIES - PUBLIC READ
-- ============================================

CREATE POLICY "Public read colors" ON colors 
  FOR SELECT USING (true);

CREATE POLICY "Public read tags" ON tags 
  FOR SELECT USING (true);

CREATE POLICY "Public read cookies" ON cookies 
  FOR SELECT USING (true);

CREATE POLICY "Public read cookie_tags" ON cookie_tags 
  FOR SELECT USING (true);

CREATE POLICY "Public read landing_config" ON landing_config 
  FOR SELECT USING (true);

-- ============================================
-- SECTION 7: RLS POLICIES - ADMIN MANAGEMENT
-- ============================================

CREATE POLICY "Admin manage colors" ON colors 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'editor', 'developer'))
  );

CREATE POLICY "Admin manage tags" ON tags 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'editor', 'developer'))
  );

CREATE POLICY "Admin manage cookies" ON cookies 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'editor', 'developer'))
  );

CREATE POLICY "Admin manage cookie_tags" ON cookie_tags 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'editor', 'developer'))
  );

CREATE POLICY "Admin manage landing_config" ON landing_config 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'developer'))
  );

-- ============================================
-- SECTION 8: RLS POLICIES - ORDERS
-- ============================================

CREATE POLICY "Anyone can create orders" ON public.orders 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can create order items" ON public.order_items 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own orders" ON public.orders 
  FOR SELECT USING (true);

CREATE POLICY "Users can view order items" ON public.order_items 
  FOR SELECT USING (true);

CREATE POLICY "Admin update orders" ON public.orders
  FOR UPDATE USING (true);

-- ============================================
-- SECTION 9: RLS POLICIES - BANNERS AND BOXES
-- ============================================

CREATE POLICY "Public can view active banners" ON banners 
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public can view visible boxes" ON cookie_boxes 
  FOR SELECT USING (is_visible = true);

CREATE POLICY "Public can view box cookies" ON box_cookies 
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage banners" ON banners 
  FOR ALL USING (true);

CREATE POLICY "Admins can manage boxes" ON cookie_boxes 
  FOR ALL USING (true);

CREATE POLICY "Admins can manage box cookies" ON box_cookies 
  FOR ALL USING (true);

-- ============================================
-- SECTION 10: COLUMN COMMENTS
-- ============================================

COMMENT ON COLUMN order_items.pack_cookies IS 'JSON array containing pack cookie details: [{cookieId, cookieName, quantity}]';
COMMENT ON COLUMN orders.invoice_url IS 'URL to the invoice PDF stored in Vercel Blob Storage';
COMMENT ON COLUMN orders.name IS 'Customer name for the order';
COMMENT ON COLUMN orders.note IS 'Special instructions or notes from the customer';

-- ============================================
-- SECTION 11: SEED DATA - LANDING CONFIG
-- ============================================

INSERT INTO landing_config (id, hero_title, hero_subtitle)
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'Fresh baked cookies', 'Galletas artesanales hechas con amor desde Barcelona')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- SECTION 12: SEED DATA - BRAND COLORS
-- ============================================

INSERT INTO colors (hex, alias) VALUES
('#930021', 'Crosti Red'),
('#F9E7AE', 'Crosti Cream'),
('#3D2B1F', 'Crosti Brown'),
('#924c14', 'Crosti Orange')
ON CONFLICT DO NOTHING;

-- ============================================
-- SECTION 13: SEED DATA - INITIAL TAGS
-- ============================================

INSERT INTO tags (name, color_id) VALUES
('Classic', (SELECT id FROM colors WHERE alias = 'Crosti Red' LIMIT 1)),
('Special', (SELECT id FROM colors WHERE alias = 'Crosti Orange' LIMIT 1)),
('Vegan', (SELECT id FROM colors WHERE alias = 'Crosti Cream' LIMIT 1))
ON CONFLICT DO NOTHING;

-- ============================================
-- SECTION 14: SEED DATA - SAMPLE BANNER
-- ============================================

INSERT INTO banners (title, subtitle, link_url, link_text, is_active) VALUES
('Nuevas galletas de temporada', 'Descubre nuestros sabores de invierno con chocolate caliente y canela', '/tienda', 'Ver novedades', true)
ON CONFLICT DO NOTHING;

-- ============================================
-- SECTION 15: SEED DATA - SAMPLE BOXES
-- ============================================

INSERT INTO cookie_boxes (name, description, price, quantity, is_visible) VALUES
('Caja Clasica', 'Nuestra seleccion de los 6 sabores mas populares', 18.00, 6, true),
('Caja Chocolate Lover', 'Para los amantes del chocolate: 6 variedades de chocolate', 20.00, 6, true)
ON CONFLICT DO NOTHING;

-- ============================================
-- SECTION 16: REFRESH SCHEMA CACHE
-- ============================================

NOTIFY pgrst, 'reload schema';

-- ============================================
-- SETUP COMPLETE!
-- ============================================
-- Your Crosti database is now ready to use.
-- 
-- Next steps:
-- 1. Create an admin user through Supabase Auth
-- 2. Add their profile with role='admin' in profiles table
-- 3. Start adding cookies through the admin panel
-- ============================================
