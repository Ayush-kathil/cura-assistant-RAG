-- Admin Panel Schema Setup
-- These views and tables support the /admin routes

-- 1. Audit Logs for /admin/logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    metadata JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Superadmins can view all audit logs" ON public.audit_logs FOR SELECT USING (true); -- Replace 'true' with actual admin check in production

-- 2. Token & Cost Tracking for /admin/costs and /admin/models
CREATE TABLE IF NOT EXISTS public.token_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    workspace_id UUID REFERENCES public.workspaces(id),
    model TEXT NOT NULL,
    prompt_tokens INTEGER DEFAULT 0,
    completion_tokens INTEGER DEFAULT 0,
    total_cost_usd DECIMAL(10, 6) DEFAULT 0.0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.token_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Superadmins can view all token usage" ON public.token_usage FOR SELECT USING (true);

-- 3. System Overview View for /admin
CREATE OR REPLACE VIEW public.admin_system_overview AS
SELECT
    (SELECT COUNT(*) FROM auth.users) as total_users,
    (SELECT COUNT(*) FROM public.workspaces) as total_workspaces,
    (SELECT COUNT(*) FROM public.documents) as total_documents,
    (SELECT COUNT(*) FROM public.document_chunks) as total_chunks,
    (SELECT COUNT(*) FROM public.chat_messages) as total_queries,
    (SELECT COALESCE(SUM(prompt_tokens + completion_tokens), 0) FROM public.token_usage) as total_tokens_used;

-- 4. Ingestion Pipeline View for /admin/ingestion
CREATE OR REPLACE VIEW public.admin_ingestion_stats AS
SELECT
    (SELECT COUNT(*) FROM public.documents) as uploaded_docs,
    (SELECT COUNT(*) FROM public.documents WHERE vector_status = 'pending') as processing_docs,
    (SELECT COUNT(*) FROM public.documents WHERE vector_status = 'failed') as failed_docs,
    (SELECT COUNT(*) FROM public.documents WHERE vector_status = 'ready') as completed_docs;

