DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'plan_tier_enum') THEN
        CREATE TYPE plan_tier_enum AS ENUM ('free', 'pro');
    END IF;
END $$;

-- Create Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    plan_tier plan_tier_enum DEFAULT 'free',
    storage_used_bytes BIGINT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Documents Table
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    storage_path TEXT NOT NULL,
    vector_status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Documents Policies
DROP POLICY IF EXISTS "Users can view own documents" ON public.documents;
CREATE POLICY "Users can view own documents" ON public.documents FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own documents" ON public.documents;
CREATE POLICY "Users can insert own documents" ON public.documents FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own documents" ON public.documents;
CREATE POLICY "Users can delete own documents" ON public.documents FOR DELETE USING (auth.uid() = user_id);

-- Username Generation Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  base_username text;
  new_username text;
  random_hex text;
  is_unique boolean := false;
BEGIN
  base_username := COALESCE(new.raw_user_meta_data->>'first_name', split_part(new.email, '@', 1), 'user');
  base_username := lower(regexp_replace(base_username, '[^a-zA-Z0-9]', '', 'g'));
  
  WHILE NOT is_unique LOOP
    random_hex := lpad(to_hex(floor(random() * 65536)::int), 4, '0');
    new_username := base_username || random_hex;
    
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE username = new_username) THEN
      is_unique := true;
    END IF;
  END LOOP;

  INSERT INTO public.profiles (id, username, plan_tier, storage_used_bytes)
  VALUES (new.id, new_username, 'free', 0);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create Storage Bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('nexus_docs', 'nexus_docs', false) ON CONFLICT (id) DO NOTHING;

-- Storage Policies
DROP POLICY IF EXISTS "Users can view own storage objects" ON storage.objects;
CREATE POLICY "Users can view own storage objects" ON storage.objects FOR SELECT USING (auth.uid() = owner AND bucket_id IN ('documents', 'nexus_docs'));

DROP POLICY IF EXISTS "Users can upload to own storage" ON storage.objects;
CREATE POLICY "Users can upload to own storage" ON storage.objects FOR INSERT WITH CHECK (auth.uid() = owner AND bucket_id IN ('documents', 'nexus_docs'));

DROP POLICY IF EXISTS "Users can delete own storage" ON storage.objects;
CREATE POLICY "Users can delete own storage" ON storage.objects FOR DELETE USING (auth.uid() = owner AND bucket_id IN ('documents', 'nexus_docs'));

-- Storage Policies
DROP POLICY IF EXISTS "Users can view own storage objects" ON storage.objects;
CREATE POLICY "Users can view own storage objects" ON storage.objects FOR SELECT USING (auth.uid() = owner AND bucket_id = 'documents');

DROP POLICY IF EXISTS "Users can upload to own storage" ON storage.objects;
CREATE POLICY "Users can upload to own storage" ON storage.objects FOR INSERT WITH CHECK (auth.uid() = owner AND bucket_id = 'documents');

DROP POLICY IF EXISTS "Users can delete own storage" ON storage.objects;
CREATE POLICY "Users can delete own storage" ON storage.objects FOR DELETE USING (auth.uid() = owner AND bucket_id = 'documents');
