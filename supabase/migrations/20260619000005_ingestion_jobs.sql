-- Create Ingestion Jobs Telemetry Table
CREATE TABLE IF NOT EXISTS public.ingestion_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_version_id UUID REFERENCES public.document_versions(id) ON DELETE CASCADE,
    parsing_time_ms INT DEFAULT 0,
    chunking_time_ms INT DEFAULT 0,
    embedding_time_ms INT DEFAULT 0,
    extraction_time_ms INT DEFAULT 0,
    total_time_ms INT DEFAULT 0,
    status TEXT DEFAULT 'running', -- 'running', 'completed', 'failed'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.ingestion_jobs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Tenant users can view workspace ingestion jobs" ON public.ingestion_jobs
    FOR SELECT USING (
        document_version_id IN (
            SELECT id FROM public.document_versions WHERE document_id IN (
                SELECT id FROM public.documents WHERE workspace_id IN (
                    SELECT workspace_id FROM public.workspace_users WHERE user_id = auth.uid()
                )
            )
        )
    );

-- Trigger for updated_at
CREATE TRIGGER set_ingestion_jobs_updated_at
BEFORE UPDATE ON public.ingestion_jobs
FOR EACH ROW
EXECUTE FUNCTION public.set_current_timestamp_updated_at();
