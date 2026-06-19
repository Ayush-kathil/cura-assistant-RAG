-- Create Document Versions Table
CREATE TABLE IF NOT EXISTS public.document_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
    version_number INT NOT NULL,
    checksum TEXT NOT NULL,
    status TEXT DEFAULT 'uploaded', -- 'uploaded', 'queued', 'processing', 'embedding', 'indexing_graph', 'completed', 'failed'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alter Documents table to point to current version
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS current_version_id UUID REFERENCES public.document_versions(id) ON DELETE SET NULL;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Enable RLS
ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Tenant users can view workspace document versions" ON public.document_versions
    FOR SELECT USING (
        document_id IN (
            SELECT id FROM public.documents WHERE workspace_id IN (
                SELECT workspace_id FROM public.workspace_users WHERE user_id = auth.uid()
            )
        )
    );

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.set_current_timestamp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_document_versions_updated_at
BEFORE UPDATE ON public.document_versions
FOR EACH ROW
EXECUTE FUNCTION public.set_current_timestamp_updated_at();

CREATE TRIGGER set_documents_updated_at
BEFORE UPDATE ON public.documents
FOR EACH ROW
EXECUTE FUNCTION public.set_current_timestamp_updated_at();
