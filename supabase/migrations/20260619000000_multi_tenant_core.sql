-- Create Workspaces Table
CREATE TABLE IF NOT EXISTS public.workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Workspace Users Table (for many-to-many relationship)
CREATE TABLE IF NOT EXISTS public.workspace_users (
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member', -- 'owner', 'admin', 'member'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (workspace_id, user_id)
);

-- Enable RLS for workspaces
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_users ENABLE ROW LEVEL SECURITY;

-- Workspace Policies
CREATE POLICY "Users can view workspaces they belong to" ON public.workspaces
    FOR SELECT USING (id IN (SELECT workspace_id FROM public.workspace_users WHERE user_id = auth.uid()));

CREATE POLICY "Users can view workspace users they share a workspace with" ON public.workspace_users
    FOR SELECT USING (workspace_id IN (SELECT workspace_id FROM public.workspace_users WHERE user_id = auth.uid()));

-- Add workspace_id to existing tables
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE;
ALTER TABLE public.document_chunks ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE;
ALTER TABLE public.chat_sessions ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE;

-- Entities table for Knowledge Graph
CREATE TABLE IF NOT EXISTS public.entities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Relationships table for Knowledge Graph
CREATE TABLE IF NOT EXISTS public.relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
    source_entity_id UUID REFERENCES public.entities(id) ON DELETE CASCADE,
    target_entity_id UUID REFERENCES public.entities(id) ON DELETE CASCADE,
    relation_type TEXT NOT NULL,
    source_chunk_id UUID REFERENCES public.document_chunks(id) ON DELETE SET NULL,
    confidence_score FLOAT DEFAULT 1.0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Traces table for Observability (LangGraph execution states)
CREATE TABLE IF NOT EXISTS public.traces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
    session_id UUID REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
    run_id TEXT NOT NULL,
    node_name TEXT NOT NULL,
    input_payload JSONB,
    output_payload JSONB,
    latency_ms FLOAT,
    status TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- LLM Costs table for Cost Observability
CREATE TABLE IF NOT EXISTS public.llm_costs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    session_id UUID REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
    model TEXT NOT NULL,
    input_tokens INT DEFAULT 0,
    output_tokens INT DEFAULT 0,
    cost_usd FLOAT DEFAULT 0.0,
    operation_type TEXT, -- 'embedding', 'rerank', 'generation', 'web_search'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for new tables
ALTER TABLE public.entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.traces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.llm_costs ENABLE ROW LEVEL SECURITY;

-- Update RLS Policies to use workspace_id for strict multi-tenancy
DROP POLICY IF EXISTS "Users can view own documents" ON public.documents;
CREATE POLICY "Tenant users can view workspace documents" ON public.documents
    FOR SELECT USING (workspace_id IN (SELECT workspace_id FROM public.workspace_users WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can access own document chunks" ON public.document_chunks;
CREATE POLICY "Tenant users can access workspace document chunks" ON public.document_chunks
    FOR ALL USING (workspace_id IN (SELECT workspace_id FROM public.workspace_users WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can view own chat sessions" ON public.chat_sessions;
CREATE POLICY "Tenant users can view workspace chat sessions" ON public.chat_sessions
    FOR SELECT USING (workspace_id IN (SELECT workspace_id FROM public.workspace_users WHERE user_id = auth.uid()));

CREATE POLICY "Tenant users can access workspace entities" ON public.entities
    FOR ALL USING (workspace_id IN (SELECT workspace_id FROM public.workspace_users WHERE user_id = auth.uid()));

CREATE POLICY "Tenant users can access workspace relationships" ON public.relationships
    FOR ALL USING (workspace_id IN (SELECT workspace_id FROM public.workspace_users WHERE user_id = auth.uid()));

CREATE POLICY "Tenant users can access workspace traces" ON public.traces
    FOR ALL USING (workspace_id IN (SELECT workspace_id FROM public.workspace_users WHERE user_id = auth.uid()));

CREATE POLICY "Tenant users can access workspace costs" ON public.llm_costs
    FOR SELECT USING (workspace_id IN (SELECT workspace_id FROM public.workspace_users WHERE user_id = auth.uid()));

-- Update Hybrid Search RPC to be Tenant-Aware
DROP FUNCTION IF EXISTS public.match_document_chunks;
CREATE OR REPLACE FUNCTION public.match_document_chunks(
    query_embedding vector(768),
    query_text text,
    target_workspace_id UUID,
    match_count int DEFAULT 10,
    full_text_weight float DEFAULT 1,
    semantic_weight float DEFAULT 1,
    rrf_k int DEFAULT 50
)
RETURNS TABLE (
    id UUID,
    document_id UUID,
    content TEXT,
    metadata JSONB,
    similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH tenant_chunks AS (
        SELECT * FROM public.document_chunks WHERE workspace_id = target_workspace_id
    ),
    semantic_search AS (
        SELECT 
            tc.id,
            ROW_NUMBER() OVER (ORDER BY tc.embedding <=> query_embedding) as rank,
            1 - (tc.embedding <=> query_embedding) as semantic_similarity
        FROM tenant_chunks tc
        ORDER BY tc.embedding <=> query_embedding
        LIMIT match_count * 2
    ),
    keyword_search AS (
        SELECT 
            tc.id,
            ROW_NUMBER() OVER (ORDER BY ts_rank_cd(tc.fts, websearch_to_tsquery('english', query_text)) DESC) as rank,
            ts_rank_cd(tc.fts, websearch_to_tsquery('english', query_text)) as keyword_similarity
        FROM tenant_chunks tc
        WHERE tc.fts @@ websearch_to_tsquery('english', query_text)
        ORDER BY keyword_similarity DESC
        LIMIT match_count * 2
    )
    SELECT 
        c.id,
        c.document_id,
        c.content,
        c.metadata,
        COALESCE(1.0 / (rrf_k + COALESCE(ss.rank, 1000)), 0.0) * semantic_weight +
        COALESCE(1.0 / (rrf_k + COALESCE(ks.rank, 1000)), 0.0) * full_text_weight as similarity
    FROM tenant_chunks c
    LEFT JOIN semantic_search ss ON ss.id = c.id
    LEFT JOIN keyword_search ks ON ks.id = c.id
    WHERE ss.id IS NOT NULL OR ks.id IS NOT NULL
    ORDER BY similarity DESC
    LIMIT match_count;
END;
$$;
