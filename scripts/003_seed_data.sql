-- ============================================
-- 3. SEED INITIAL DATA
-- ============================================

-- Initial Landing Configuration
INSERT INTO landing_config (id, hero_title, hero_subtitle)
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'Fresh baked cookies', 'Galletas artesanales hechas con amor desde Barcelona')
ON CONFLICT (id) DO NOTHING;

-- Brand Colors
INSERT INTO colors (hex, alias) VALUES
('#930021', 'Crosti Red'),
('#F9E7AE', 'Crosti Cream'),
('#3D2B1F', 'Crosti Brown'),
('#924c14', 'Crosti Orange')
ON CONFLICT DO NOTHING;

-- Initial Tags
INSERT INTO tags (name, color_id) VALUES
('Classic', (SELECT id FROM colors WHERE alias = 'Crosti Red' LIMIT 1)),
('Special', (SELECT id FROM colors WHERE alias = 'Crosti Orange' LIMIT 1)),
('Vegan', (SELECT id FROM colors WHERE alias = 'Crosti Cream' LIMIT 1))
ON CONFLICT DO NOTHING;
