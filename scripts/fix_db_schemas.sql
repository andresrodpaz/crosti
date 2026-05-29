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

-- ==========================================
-- CLUB CROSTI LOYALTY SYSTEM SCHEMAS
-- ==========================================

-- Configuración de la tarjeta (una fila)
CREATE TABLE IF NOT EXISTS club_card_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  primary_color TEXT DEFAULT '#7C4A1E',
  accent_color TEXT DEFAULT '#F5D89C',
  text_color TEXT DEFAULT '#ffffff',
  font TEXT DEFAULT 'Inter',
  stamp_total INT DEFAULT 10,
  reward_description TEXT DEFAULT 'Tu cookie gratis',
  logo_url TEXT,
  geo_lat FLOAT,
  geo_lng FLOAT,
  geo_alert_radius INT DEFAULT 200,
  win_back_days INT DEFAULT 30,
  birthday_reminder_days INT DEFAULT 1,
  notif_stamp BOOLEAN DEFAULT true,
  notif_reward BOOLEAN DEFAULT true,
  notif_geo BOOLEAN DEFAULT true,
  notif_birthday BOOLEAN DEFAULT true,
  notif_winback BOOLEAN DEFAULT true,
  notif_weekly_digest BOOLEAN DEFAULT true,
  staff_pin TEXT, -- hashed con bcrypt
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Socios del club
CREATE TABLE IF NOT EXISTS club_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  birthday DATE,
  stamp_count INT DEFAULT 0,
  total_stamps_ever INT DEFAULT 0,
  referral_code TEXT UNIQUE DEFAULT substr(md5(random()::text), 0, 9),
  referred_by UUID REFERENCES club_customers(id),
  apple_push_token TEXT,
  google_wallet_object_id TEXT,
  last_visit TIMestamptz,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Eventos de sello
CREATE TABLE IF NOT EXISTS club_stamp_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES club_customers(id) ON DELETE CASCADE,
  given_by TEXT,
  stamps_given INT DEFAULT 1,
  ticket_amount FLOAT,
  origin TEXT CHECK (origin IN ('counter', 'delivery', 'campaign', 'manual')) DEFAULT 'counter',
  platform TEXT CHECK (platform IN ('glovo', 'ubereats', 'justeat', 'other')),
  external_order_id TEXT,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Canjes de premio
CREATE TABLE IF NOT EXISTS club_reward_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES club_customers(id) ON DELETE CASCADE,
  redeemed_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campañas
CREATE TABLE IF NOT EXISTS club_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('manual', 'birthday', 'winback', 'double_stamp', 'promo')),
  status TEXT CHECK (status IN ('draft', 'scheduled', 'active', 'completed')) DEFAULT 'draft',
  message TEXT,
  target_segment TEXT CHECK (target_segment IN ('all', 'active', 'inactive', 'birthday')),
  double_stamp_multiplier INT DEFAULT 2,
  scheduled_at TIMESTAMPTZ,
  reach_count INT DEFAULT 0,
  sent_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Añadir políticas RLS (simplificado: público para insert clientes, admin full access)
ALTER TABLE club_card_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_stamp_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_reward_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read card config" ON club_card_config FOR SELECT USING (true);
CREATE POLICY "Admin full access card config" ON club_card_config FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access customers" ON club_customers FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Public can insert customers" ON club_customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin full access stamp events" ON club_stamp_events FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access redemptions" ON club_reward_redemptions FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access campaigns" ON club_campaigns FOR ALL USING (auth.role() = 'authenticated');
