-- ============================================
-- 1. SCHEMA DEFINITION
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
