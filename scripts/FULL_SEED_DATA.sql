-- ============================================
-- CROSTI APP - FULL SEED DATA
-- ============================================
-- This script contains ALL initial data
-- Run AFTER the FULL_MIGRATION.sql script
-- ============================================

-- ============================================
-- 1. LANDING CONFIGURATION
-- ============================================

INSERT INTO landing_config (id, hero_title, hero_subtitle)
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'Fresh baked cookies', 'Galletas artesanales hechas con amor desde Barcelona')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 2. BRAND COLORS
-- ============================================

INSERT INTO colors (hex, alias) VALUES
('#930021', 'Crosti Red'),
('#F9E7AE', 'Crosti Cream'),
('#3D2B1F', 'Crosti Brown'),
('#924c14', 'Crosti Orange')
ON CONFLICT DO NOTHING;

-- ============================================
-- 3. INITIAL TAGS
-- ============================================

INSERT INTO tags (name, color_id) VALUES
('Classic', (SELECT id FROM colors WHERE alias = 'Crosti Red' LIMIT 1)),
('Special', (SELECT id FROM colors WHERE alias = 'Crosti Orange' LIMIT 1)),
('Vegan', (SELECT id FROM colors WHERE alias = 'Crosti Cream' LIMIT 1))
ON CONFLICT DO NOTHING;

-- ============================================
-- 4. SAMPLE BANNERS
-- ============================================

INSERT INTO banners (title, subtitle, link_url, link_text, is_active) VALUES
  ('Nuevas galletas de temporada', 'Descubre nuestros sabores de invierno con chocolate caliente y canela', '/tienda', 'Ver novedades', true)
ON CONFLICT DO NOTHING;

-- ============================================
-- 5. SAMPLE COOKIE BOXES
-- ============================================

INSERT INTO cookie_boxes (name, description, price, quantity, is_visible) VALUES
  ('Caja Clasica', 'Nuestra seleccion de los 6 sabores mas populares', 18.00, 6, true),
  ('Caja Chocolate Lover', 'Para los amantes del chocolate: 6 variedades de chocolate', 20.00, 6, true)
ON CONFLICT DO NOTHING;

-- ============================================
-- 6. SAMPLE COOKIES (Optional - uncomment to add demo cookies)
-- ============================================

/*
INSERT INTO cookies (name, description, price, ingredients, is_visible, in_carousel, carousel_order) VALUES
  ('Chocolate Chip Classic', 'Nuestra galleta insignia con trozos de chocolate belga', 3.50, ARRAY['Harina', 'Mantequilla', 'Chocolate belga', 'Azucar moreno', 'Huevo', 'Vainilla'], true, true, 1),
  ('Double Chocolate', 'Para los verdaderos amantes del chocolate', 3.75, ARRAY['Harina', 'Mantequilla', 'Cacao', 'Chocolate negro', 'Azucar', 'Huevo'], true, true, 2),
  ('Avellana y Chocolate', 'Combinacion perfecta de avellanas del Piamonte y chocolate', 4.00, ARRAY['Harina', 'Mantequilla', 'Avellanas', 'Chocolate con leche', 'Azucar', 'Huevo'], true, true, 3),
  ('Vainilla con Chips Blancos', 'Suave vainilla con chips de chocolate blanco', 3.50, ARRAY['Harina', 'Mantequilla', 'Chocolate blanco', 'Vainilla de Madagascar', 'Azucar', 'Huevo'], true, false, 0),
  ('Red Velvet', 'Galleta roja aterciopelada con frosting de queso crema', 4.25, ARRAY['Harina', 'Mantequilla', 'Cacao', 'Colorante natural', 'Queso crema', 'Azucar'], true, true, 4),
  ('Galleta Vegana de Avena', 'Deliciosa opcion vegana con avena y pasas', 3.75, ARRAY['Harina de avena', 'Aceite de coco', 'Pasas', 'Azucar de coco', 'Platano'], true, false, 0)
ON CONFLICT DO NOTHING;

-- Associate cookies with tags
INSERT INTO cookie_tags (cookie_id, tag_id)
SELECT c.id, t.id FROM cookies c, tags t WHERE c.name = 'Chocolate Chip Classic' AND t.name = 'Classic'
ON CONFLICT DO NOTHING;

INSERT INTO cookie_tags (cookie_id, tag_id)
SELECT c.id, t.id FROM cookies c, tags t WHERE c.name = 'Double Chocolate' AND t.name = 'Classic'
ON CONFLICT DO NOTHING;

INSERT INTO cookie_tags (cookie_id, tag_id)
SELECT c.id, t.id FROM cookies c, tags t WHERE c.name = 'Avellana y Chocolate' AND t.name = 'Special'
ON CONFLICT DO NOTHING;

INSERT INTO cookie_tags (cookie_id, tag_id)
SELECT c.id, t.id FROM cookies c, tags t WHERE c.name = 'Red Velvet' AND t.name = 'Special'
ON CONFLICT DO NOTHING;

INSERT INTO cookie_tags (cookie_id, tag_id)
SELECT c.id, t.id FROM cookies c, tags t WHERE c.name = 'Galleta Vegana de Avena' AND t.name = 'Vegan'
ON CONFLICT DO NOTHING;
*/

-- ============================================
-- DONE!
-- ============================================
-- Your database is now seeded with initial data.
-- You can add more cookies through the admin panel.
