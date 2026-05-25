-- Create nexus_docs Storage Bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) VALUES ('nexus_docs', 'nexus_docs', false) ON CONFLICT (id) DO NOTHING;

-- Storage Policies for nexus_docs
DROP POLICY IF EXISTS "Users can view own storage objects in nexus_docs" ON storage.objects;
CREATE POLICY "Users can view own storage objects in nexus_docs" ON storage.objects FOR SELECT USING (auth.uid() = owner AND bucket_id = 'nexus_docs');

DROP POLICY IF EXISTS "Users can upload to own storage in nexus_docs" ON storage.objects;
CREATE POLICY "Users can upload to own storage in nexus_docs" ON storage.objects FOR INSERT WITH CHECK (auth.uid() = owner AND bucket_id = 'nexus_docs');

DROP POLICY IF EXISTS "Users can delete own storage in nexus_docs" ON storage.objects;
CREATE POLICY "Users can delete own storage in nexus_docs" ON storage.objects FOR DELETE USING (auth.uid() = owner AND bucket_id = 'nexus_docs');
