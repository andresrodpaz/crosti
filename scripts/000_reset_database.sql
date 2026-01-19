-- ============================================
-- 0. RESET DATABASE
-- ============================================
-- Drops ALL tables to allow a clean re-installation
-- WARNING: This will delete ALL data!
-- ============================================

-- Drop order-related tables first (due to FK constraints)
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;

-- Drop box-related tables
DROP TABLE IF EXISTS box_cookies CASCADE;
DROP TABLE IF EXISTS cookie_boxes CASCADE;

-- Drop banners
DROP TABLE IF EXISTS banners CASCADE;

-- Drop cookie-related tables
DROP TABLE IF EXISTS cookie_tags CASCADE;
DROP TABLE IF EXISTS cookies CASCADE;

-- Drop tag/color tables
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS colors CASCADE;

-- Drop config and profiles
DROP TABLE IF EXISTS landing_config CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Confirm reset
SELECT 'Database reset complete. All tables dropped.' as status;
