-- ============================================
-- 2. ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE cookies ENABLE ROW LEVEL SECURITY;
ALTER TABLE cookie_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE landing_config ENABLE ROW LEVEL SECURITY;

-- Profiles: Users see own, Admins see all
CREATE POLICY "Profiles select own" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Profiles admin select all" ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'developer'))
);
CREATE POLICY "Profiles update own" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Public Read Policies
CREATE POLICY "Public read colors" ON colors FOR SELECT USING (true);
CREATE POLICY "Public read tags" ON tags FOR SELECT USING (true);
CREATE POLICY "Public read cookies" ON cookies FOR SELECT USING (true);
CREATE POLICY "Public read cookie_tags" ON cookie_tags FOR SELECT USING (true);
CREATE POLICY "Public read landing_config" ON landing_config FOR SELECT USING (true);

-- Admin Management Policies
CREATE POLICY "Admin manage colors" ON colors FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'editor', 'developer'))
);
CREATE POLICY "Admin manage tags" ON tags FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'editor', 'developer'))
);
CREATE POLICY "Admin manage cookies" ON cookies FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'editor', 'developer'))
);
CREATE POLICY "Admin manage cookie_tags" ON cookie_tags FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'editor', 'developer'))
);
CREATE POLICY "Admin manage landing_config" ON landing_config FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'developer'))
);
