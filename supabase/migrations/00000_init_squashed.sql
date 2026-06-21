-- Migration: 00000_init.sql
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


-- Migration: 00001_chat_history.sql
-- Create Chat Sessions Table
CREATE TABLE IF NOT EXISTS public.chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Chat Messages Table
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Policies for Chat Sessions
CREATE POLICY "Users can view own chat sessions" ON public.chat_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own chat sessions" ON public.chat_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own chat sessions" ON public.chat_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own chat sessions" ON public.chat_sessions FOR DELETE USING (auth.uid() = user_id);

-- Policies for Chat Messages
CREATE POLICY "Users can view own chat messages" ON public.chat_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.chat_sessions s WHERE s.id = session_id AND s.user_id = auth.uid())
);
CREATE POLICY "Users can insert own chat messages" ON public.chat_messages FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.chat_sessions s WHERE s.id = session_id AND s.user_id = auth.uid())
);
CREATE POLICY "Users can delete own chat messages" ON public.chat_messages FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.chat_sessions s WHERE s.id = session_id AND s.user_id = auth.uid())
);


-- Migration: 20260525151511_add_nexus_docs_bucket.sql
-- Create nexus_docs Storage Bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) VALUES ('nexus_docs', 'nexus_docs', false) ON CONFLICT (id) DO NOTHING;

-- Storage Policies for nexus_docs
DROP POLICY IF EXISTS "Users can view own storage objects in nexus_docs" ON storage.objects;
CREATE POLICY "Users can view own storage objects in nexus_docs" ON storage.objects FOR SELECT USING (auth.uid() = owner AND bucket_id = 'nexus_docs');

DROP POLICY IF EXISTS "Users can upload to own storage in nexus_docs" ON storage.objects;
CREATE POLICY "Users can upload to own storage in nexus_docs" ON storage.objects FOR INSERT WITH CHECK (auth.uid() = owner AND bucket_id = 'nexus_docs');

DROP POLICY IF EXISTS "Users can delete own storage in nexus_docs" ON storage.objects;
CREATE POLICY "Users can delete own storage in nexus_docs" ON storage.objects FOR DELETE USING (auth.uid() = owner AND bucket_id = 'nexus_docs');


-- Migration: 20260526002500_add_chunks_to_documents.sql
-- Add a chunks JSONB column to the documents table to store extracted text chunks
ALTER TABLE public.documents 
ADD COLUMN IF NOT EXISTS chunks JSONB DEFAULT '[]'::jsonb;


-- Migration: 20260618000000_add_pgvector_and_metrics.sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA public;

-- Create document_chunks table for embeddings
CREATE TABLE IF NOT EXISTS public.document_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    embedding vector(768),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create HNSW index for ultra-fast vector search
CREATE INDEX IF NOT EXISTS document_chunks_embedding_idx 
ON public.document_chunks USING hnsw (embedding vector_cosine_ops);

-- Create BM25 full-text search index on chunks
ALTER TABLE public.document_chunks ADD COLUMN IF NOT EXISTS fts tsvector GENERATED ALWAYS AS (to_tsvector('english', content)) STORED;
CREATE INDEX IF NOT EXISTS document_chunks_fts_idx ON public.document_chunks USING GIN (fts);

-- Create hybrid search RPC function
CREATE OR REPLACE FUNCTION public.match_document_chunks(
    query_embedding vector(768),
    query_text text,
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
    WITH semantic_search AS (
        SELECT 
            c.id,
            ROW_NUMBER() OVER (ORDER BY c.embedding <=> query_embedding) as rank,
            1 - (c.embedding <=> query_embedding) as semantic_similarity
        FROM public.document_chunks c
        ORDER BY c.embedding <=> query_embedding
        LIMIT match_count * 2
    ),
    keyword_search AS (
        SELECT 
            c.id,
            ROW_NUMBER() OVER (ORDER BY ts_rank_cd(c.fts, websearch_to_tsquery('english', query_text)) DESC) as rank,
            ts_rank_cd(c.fts, websearch_to_tsquery('english', query_text)) as keyword_similarity
        FROM public.document_chunks c
        WHERE c.fts @@ websearch_to_tsquery('english', query_text)
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
    FROM public.document_chunks c
    LEFT JOIN semantic_search ss ON ss.id = c.id
    LEFT JOIN keyword_search ks ON ks.id = c.id
    WHERE ss.id IS NOT NULL OR ks.id IS NOT NULL
    ORDER BY similarity DESC
    LIMIT match_count;
END;
$$;

-- Create rag_evaluations table
CREATE TABLE IF NOT EXISTS public.rag_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    query TEXT NOT NULL,
    faithfulness_score FLOAT,
    relevance_score FLOAT,
    context_precision FLOAT,
    recall FLOAT,
    total_latency FLOAT,
    token_usage INT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create observability_metrics table
CREATE TABLE IF NOT EXISTS public.observability_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID,
    embedding_latency FLOAT,
    retrieval_latency FLOAT,
    generation_latency FLOAT,
    total_latency FLOAT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rag_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.observability_metrics ENABLE ROW LEVEL SECURITY;

-- Add RLS Policies
CREATE POLICY "Users can access own document chunks" ON public.document_chunks
    FOR ALL USING (document_id IN (SELECT id FROM public.documents WHERE user_id = auth.uid()));

CREATE POLICY "Users can access own evaluations" ON public.rag_evaluations
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can access own observability metrics" ON public.observability_metrics
    FOR ALL USING (true); -- Internal tracking, typically accessed via server role, but allow insert


-- Migration: 20260619000000_multi_tenant_core.sql
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


-- Migration: 20260619000001_graph_rag_traversal.sql
-- Function to perform graph traversal for Multi-hop RAG
CREATE OR REPLACE FUNCTION public.traverse_knowledge_graph(
    start_entity_id UUID,
    target_workspace_id UUID,
    max_depth INT DEFAULT 2,
    min_confidence FLOAT DEFAULT 0.5
)
RETURNS TABLE (
    path_depth INT,
    source_entity UUID,
    source_name TEXT,
    target_entity UUID,
    target_name TEXT,
    relation_type TEXT,
    confidence_score FLOAT,
    chunk_id UUID
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH RECURSIVE graph_paths AS (
        -- Base case: edges starting from the target entity
        SELECT 
            1 AS depth,
            r.source_entity_id,
            e1.name as source_entity_name,
            r.target_entity_id,
            e2.name as target_entity_name,
            r.relation_type,
            r.confidence_score,
            r.source_chunk_id
        FROM public.relationships r
        JOIN public.entities e1 ON r.source_entity_id = e1.id
        JOIN public.entities e2 ON r.target_entity_id = e2.id
        WHERE (r.source_entity_id = start_entity_id OR r.target_entity_id = start_entity_id)
          AND r.workspace_id = target_workspace_id
          AND r.confidence_score >= min_confidence
        
        UNION ALL
        
        -- Recursive case: traverse to next connected nodes
        SELECT 
            gp.depth + 1,
            r.source_entity_id,
            e1.name,
            r.target_entity_id,
            e2.name,
            r.relation_type,
            r.confidence_score,
            r.source_chunk_id
        FROM public.relationships r
        JOIN graph_paths gp ON (r.source_entity_id = gp.target_entity_id OR r.target_entity_id = gp.source_entity_id)
        JOIN public.entities e1 ON r.source_entity_id = e1.id
        JOIN public.entities e2 ON r.target_entity_id = e2.id
        WHERE r.workspace_id = target_workspace_id
          AND r.confidence_score >= min_confidence
          AND gp.depth < max_depth
    )
    SELECT 
        depth as path_depth,
        source_entity_id as source_entity,
        source_entity_name as source_name,
        target_entity_id as target_entity,
        target_entity_name as target_name,
        relation_type,
        confidence_score,
        source_chunk_id as chunk_id
    FROM graph_paths;
END;
$$;


-- Migration: 20260619000002_hybrid_search.sql
-- Drop the old insecure RPC function
DROP FUNCTION IF EXISTS public.match_document_chunks;

-- Recreate hybrid search RPC function with strict Multi-Tenant (workspace_id) isolation
CREATE OR REPLACE FUNCTION public.hybrid_search_chunks(
    target_workspace_id UUID,
    query_embedding vector(768),
    query_text text,
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
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    WITH semantic_search AS (
        SELECT 
            c.id,
            ROW_NUMBER() OVER (ORDER BY c.embedding <=> query_embedding) as rank,
            1 - (c.embedding <=> query_embedding) as semantic_similarity
        FROM public.document_chunks c
        WHERE c.workspace_id = target_workspace_id
        ORDER BY c.embedding <=> query_embedding
        LIMIT match_count * 2
    ),
    keyword_search AS (
        SELECT 
            c.id,
            ROW_NUMBER() OVER (ORDER BY ts_rank_cd(c.fts, websearch_to_tsquery('english', query_text)) DESC) as rank,
            ts_rank_cd(c.fts, websearch_to_tsquery('english', query_text)) as keyword_similarity
        FROM public.document_chunks c
        WHERE c.workspace_id = target_workspace_id
          AND c.fts @@ websearch_to_tsquery('english', query_text)
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
    FROM public.document_chunks c
    LEFT JOIN semantic_search ss ON ss.id = c.id
    LEFT JOIN keyword_search ks ON ks.id = c.id
    WHERE (ss.id IS NOT NULL OR ks.id IS NOT NULL)
      AND c.workspace_id = target_workspace_id
    ORDER BY similarity DESC
    LIMIT match_count;
END;
$$;

-- Create Retrieval Metrics Table for Observability
CREATE TABLE IF NOT EXISTS public.retrieval_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
    session_id UUID REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    query_variants JSONB DEFAULT '[]'::jsonb,
    vector_latency_ms FLOAT,
    rerank_latency_ms FLOAT,
    total_latency_ms FLOAT,
    chunks_retrieved INT DEFAULT 0,
    chunks_post_rerank INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.retrieval_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant users can view workspace retrieval metrics" ON public.retrieval_metrics
    FOR SELECT USING (workspace_id IN (SELECT workspace_id FROM public.workspace_users WHERE user_id = auth.uid()));


-- Migration: 20260619000003_document_versions.sql
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


-- Migration: 20260619000004_chunk_fingerprinting.sql
-- Alter document_chunks to support fingerprint deduplication
ALTER TABLE public.document_chunks ADD COLUMN IF NOT EXISTS fingerprint TEXT;

-- Add chunk_type for future structured data extraction
ALTER TABLE public.document_chunks ADD COLUMN IF NOT EXISTS chunk_type TEXT DEFAULT 'text'; -- 'text', 'table', 'figure'

-- To enforce uniqueness, we must clear out any duplicates if they exist, 
-- but assuming this is a fresh setup or we just drop the constraint if it fails.
-- For production safety, we'll use a unique index that ignores nulls.
CREATE UNIQUE INDEX IF NOT EXISTS document_chunks_workspace_fingerprint_idx 
ON public.document_chunks (workspace_id, fingerprint) 
WHERE fingerprint IS NOT NULL;

-- Create the join table for Version -> Chunks (Lineage & Deduplication)
CREATE TABLE IF NOT EXISTS public.document_version_chunks (
    document_version_id UUID REFERENCES public.document_versions(id) ON DELETE CASCADE,
    chunk_id UUID REFERENCES public.document_chunks(id) ON DELETE CASCADE,
    page_number INT,
    hierarchy JSONB DEFAULT '[]'::jsonb, -- e.g. ["Chapter 1", "Introduction"]
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (document_version_id, chunk_id)
);

-- Enable RLS
ALTER TABLE public.document_version_chunks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant users can view workspace version chunks" ON public.document_version_chunks
    FOR SELECT USING (
        document_version_id IN (
            SELECT id FROM public.document_versions WHERE document_id IN (
                SELECT id FROM public.documents WHERE workspace_id IN (
                    SELECT workspace_id FROM public.workspace_users WHERE user_id = auth.uid()
                )
            )
        )
    );

-- Update Hybrid Search RPC to join on current_version_id instead of raw document_id
-- We must drop the previous function to redefine its signature and logic
DROP FUNCTION IF EXISTS public.hybrid_search_chunks;

CREATE OR REPLACE FUNCTION public.hybrid_search_chunks(
    target_workspace_id UUID,
    query_embedding vector(768),
    query_text text,
    match_count int DEFAULT 10,
    full_text_weight float DEFAULT 1,
    semantic_weight float DEFAULT 1,
    rrf_k int DEFAULT 50
)
RETURNS TABLE (
    id UUID,
    document_id UUID,
    version_id UUID,
    content TEXT,
    metadata JSONB,
    similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    WITH active_chunks AS (
        -- Only search chunks that belong to the CURRENT active version of any document in the workspace
        SELECT c.*, d.id as active_document_id, dvc.document_version_id
        FROM public.document_chunks c
        JOIN public.document_version_chunks dvc ON dvc.chunk_id = c.id
        JOIN public.documents d ON d.current_version_id = dvc.document_version_id
        WHERE c.workspace_id = target_workspace_id
    ),
    semantic_search AS (
        SELECT 
            ac.id,
            ROW_NUMBER() OVER (ORDER BY ac.embedding <=> query_embedding) as rank,
            1 - (ac.embedding <=> query_embedding) as semantic_similarity
        FROM active_chunks ac
        ORDER BY ac.embedding <=> query_embedding
        LIMIT match_count * 2
    ),
    keyword_search AS (
        SELECT 
            ac.id,
            ROW_NUMBER() OVER (ORDER BY ts_rank_cd(ac.fts, websearch_to_tsquery('english', query_text)) DESC) as rank,
            ts_rank_cd(ac.fts, websearch_to_tsquery('english', query_text)) as keyword_similarity
        FROM active_chunks ac
        WHERE ac.fts @@ websearch_to_tsquery('english', query_text)
        ORDER BY keyword_similarity DESC
        LIMIT match_count * 2
    )
    SELECT 
        ac.id,
        ac.active_document_id as document_id,
        ac.document_version_id as version_id,
        ac.content,
        ac.metadata,
        COALESCE(1.0 / (rrf_k + COALESCE(ss.rank, 1000)), 0.0) * semantic_weight +
        COALESCE(1.0 / (rrf_k + COALESCE(ks.rank, 1000)), 0.0) * full_text_weight as similarity
    FROM active_chunks ac
    LEFT JOIN semantic_search ss ON ss.id = ac.id
    LEFT JOIN keyword_search ks ON ks.id = ac.id
    WHERE (ss.id IS NOT NULL OR ks.id IS NOT NULL)
    ORDER BY similarity DESC
    LIMIT match_count;
END;
$$;


-- Migration: 20260619000005_ingestion_jobs.sql
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


-- Migration: 20260619000006_graph_storage.sql
-- Create Entities Table
CREATE TABLE IF NOT EXISTS public.entities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL,
    canonical_name TEXT NOT NULL,
    aliases TEXT[] DEFAULT '{}',
    entity_type TEXT NOT NULL, -- 'person', 'organization', 'concept', 'technology'
    confidence_score FLOAT NOT NULL DEFAULT 1.0,
    source_count INT DEFAULT 1,
    mention_count INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(workspace_id, canonical_name, entity_type)
);

-- Create Relationships Table
CREATE TABLE IF NOT EXISTS public.relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_entity_id UUID REFERENCES public.entities(id) ON DELETE CASCADE,
    target_entity_id UUID REFERENCES public.entities(id) ON DELETE CASCADE,
    relationship_type TEXT NOT NULL,
    relationship_confidence FLOAT NOT NULL DEFAULT 1.0,
    supporting_chunk_ids UUID[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(source_entity_id, target_entity_id, relationship_type)
);

-- Extend Ingestion Telemetry
ALTER TABLE public.ingestion_jobs ADD COLUMN IF NOT EXISTS entities_created INT DEFAULT 0;
ALTER TABLE public.ingestion_jobs ADD COLUMN IF NOT EXISTS entities_merged INT DEFAULT 0;
ALTER TABLE public.ingestion_jobs ADD COLUMN IF NOT EXISTS relationships_created INT DEFAULT 0;
ALTER TABLE public.ingestion_jobs ADD COLUMN IF NOT EXISTS relationships_merged INT DEFAULT 0;

-- Extend Retrieval Telemetry
ALTER TABLE public.retrieval_metrics ADD COLUMN IF NOT EXISTS graph_hits INT DEFAULT 0;
ALTER TABLE public.retrieval_metrics ADD COLUMN IF NOT EXISTS entities_resolved INT DEFAULT 0;
ALTER TABLE public.retrieval_metrics ADD COLUMN IF NOT EXISTS nodes_traversed INT DEFAULT 0;
ALTER TABLE public.retrieval_metrics ADD COLUMN IF NOT EXISTS relationships_traversed INT DEFAULT 0;

-- Create Indexes for fast traversal
CREATE INDEX idx_entities_canonical_name ON public.entities USING btree (canonical_name);
CREATE INDEX idx_entities_aliases ON public.entities USING gin (aliases);
CREATE INDEX idx_relationships_source ON public.relationships USING btree (source_entity_id);
CREATE INDEX idx_relationships_target ON public.relationships USING btree (target_entity_id);

-- Enable RLS
ALTER TABLE public.entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relationships ENABLE ROW LEVEL SECURITY;

-- Policies for Multi-Tenant Isolation
CREATE POLICY "Tenant users can view workspace entities" ON public.entities
    FOR SELECT USING (
        workspace_id IN (
            SELECT workspace_id FROM public.workspace_users WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Tenant users can view workspace relationships" ON public.relationships
    FOR SELECT USING (
        source_entity_id IN (
            SELECT id FROM public.entities WHERE workspace_id IN (
                SELECT workspace_id FROM public.workspace_users WHERE user_id = auth.uid()
            )
        )
    );


-- Migration: 20260619000007_graph_rpc.sql
-- Migration to add the traverse_graph RPC for Graph RAG retrieval

CREATE OR REPLACE FUNCTION traverse_graph(
  p_workspace_id UUID,
  p_entities TEXT[],
  p_max_hops INT DEFAULT 2,
  p_limit INT DEFAULT 10
)
RETURNS TABLE (
  chunk_id UUID,
  graph_score FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE graph_cte AS (
    -- Base case: find chunks connected to the exact entities requested
    SELECT 
      r.supporting_chunk_ids,
      r.relationship_confidence AS current_score,
      1 AS hop_level,
      r.target_entity_id AS current_node
    FROM public.relationships r
    JOIN public.entities e ON r.source_entity_id = e.id
    WHERE e.workspace_id = p_workspace_id
      AND (e.canonical_name = ANY(p_entities) OR e.aliases && p_entities)
      
    UNION
    
    -- Recursive step: traverse relationships
    SELECT 
      r.supporting_chunk_ids,
      (cte.current_score * 0.7 * r.relationship_confidence) AS current_score,
      cte.hop_level + 1 AS hop_level,
      r.target_entity_id AS current_node
    FROM public.relationships r
    JOIN graph_cte cte ON r.source_entity_id = cte.current_node
    WHERE cte.hop_level < p_max_hops
  ),
  unnested_chunks AS (
    SELECT 
      unnest(supporting_chunk_ids) AS chunk_id,
      current_score
    FROM graph_cte
  )
  SELECT 
    uc.chunk_id,
    SUM(uc.current_score) AS graph_score
  FROM unnested_chunks uc
  GROUP BY uc.chunk_id
  ORDER BY graph_score DESC
  LIMIT p_limit;
END;
$$;


-- Migration: 20260620000000_graph_hardening.sql
-- Hardening migration for graph ingestion race conditions and vector search pre-filtering

CREATE OR REPLACE FUNCTION public.upsert_entity(
  p_workspace_id UUID,
  p_canonical_name TEXT,
  p_alias TEXT,
  p_type TEXT,
  p_confidence FLOAT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_entity_id UUID;
BEGIN
  INSERT INTO public.entities (workspace_id, canonical_name, entity_type, aliases, confidence_score)
  VALUES (
    p_workspace_id,
    p_canonical_name,
    p_type,
    ARRAY[p_alias],
    p_confidence
  )
  ON CONFLICT (workspace_id, canonical_name, entity_type)
  DO UPDATE SET 
    aliases = array_append(public.entities.aliases, p_alias),
    mention_count = public.entities.mention_count + 1,
    confidence_score = GREATEST(public.entities.confidence_score, EXCLUDED.confidence_score)
  RETURNING id INTO v_entity_id;
  
  RETURN v_entity_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.upsert_relationship(
  p_source_id UUID,
  p_target_id UUID,
  p_rel_type TEXT,
  p_confidence FLOAT,
  p_chunk_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.relationships (source_entity_id, target_entity_id, relationship_type, relationship_confidence, supporting_chunk_ids)
  VALUES (
    p_source_id,
    p_target_id,
    p_rel_type,
    p_confidence,
    ARRAY[p_chunk_id]
  )
  ON CONFLICT (source_entity_id, target_entity_id, relationship_type)
  DO UPDATE SET
    supporting_chunk_ids = array_append(public.relationships.supporting_chunk_ids, p_chunk_id),
    relationship_confidence = GREATEST(public.relationships.relationship_confidence, EXCLUDED.relationship_confidence);
END;
$$;

-- Optimize hybrid search to allow pre-filtering by document_id before vector ranking
DROP FUNCTION IF EXISTS public.hybrid_search_chunks;

CREATE OR REPLACE FUNCTION public.hybrid_search_chunks(
    target_workspace_id UUID,
    query_embedding vector(768),
    query_text text,
    target_document_id UUID DEFAULT NULL,
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
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    WITH semantic_search AS (
        SELECT 
            c.id,
            ROW_NUMBER() OVER (ORDER BY c.embedding <=> query_embedding) as rank,
            1 - (c.embedding <=> query_embedding) as semantic_similarity
        FROM public.document_chunks c
        WHERE c.workspace_id = target_workspace_id
          AND (target_document_id IS NULL OR c.document_id = target_document_id)
        ORDER BY c.embedding <=> query_embedding
        LIMIT match_count * 2
    ),
    keyword_search AS (
        SELECT 
            c.id,
            ROW_NUMBER() OVER (ORDER BY ts_rank_cd(c.fts, websearch_to_tsquery('english', query_text)) DESC) as rank,
            ts_rank_cd(c.fts, websearch_to_tsquery('english', query_text)) as keyword_similarity
        FROM public.document_chunks c
        WHERE c.workspace_id = target_workspace_id
          AND (target_document_id IS NULL OR c.document_id = target_document_id)
          AND c.fts @@ websearch_to_tsquery('english', query_text)
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
    FROM public.document_chunks c
    LEFT JOIN semantic_search ss ON ss.id = c.id
    LEFT JOIN keyword_search ks ON ks.id = c.id
    WHERE (ss.id IS NOT NULL OR ks.id IS NOT NULL)
      AND c.workspace_id = target_workspace_id
    ORDER BY similarity DESC
    LIMIT match_count;
END;
$$;


-- Migration: 20260620000001_fix_rls_recursion.sql
-- 1. Create a helper function that bypasses RLS to prevent infinite recursion
CREATE OR REPLACE FUNCTION public.get_auth_user_workspaces()
RETURNS SETOF UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT workspace_id FROM public.workspace_users WHERE user_id = auth.uid();
$$;

-- 2. Drop the recursive policies
DROP POLICY IF EXISTS "Users can view workspace users they share a workspace with" ON public.workspace_users;
DROP POLICY IF EXISTS "Tenant users can view workspace documents" ON public.documents;
DROP POLICY IF EXISTS "Tenant users can view workspace chat sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Tenant users can view workspace document versions" ON public.document_versions;
DROP POLICY IF EXISTS "Tenant users can access workspace entities" ON public.entities;
DROP POLICY IF EXISTS "Tenant users can access workspace relationships" ON public.relationships;
DROP POLICY IF EXISTS "Tenant users can access workspace traces" ON public.traces;
DROP POLICY IF EXISTS "Tenant users can access workspace costs" ON public.llm_costs;

-- 3. Recreate the policies using the non-recursive helper function
CREATE POLICY "Users can view workspace users they share a workspace with" ON public.workspace_users
    FOR SELECT USING (workspace_id IN (SELECT public.get_auth_user_workspaces()));

CREATE POLICY "Tenant users can view workspace documents" ON public.documents
    FOR SELECT USING (workspace_id IN (SELECT public.get_auth_user_workspaces()));

CREATE POLICY "Tenant users can view workspace chat sessions" ON public.chat_sessions
    FOR SELECT USING (workspace_id IN (SELECT public.get_auth_user_workspaces()));

CREATE POLICY "Tenant users can view workspace document versions" ON public.document_versions
    FOR SELECT USING (
        document_id IN (
            SELECT id FROM public.documents WHERE workspace_id IN (
                SELECT public.get_auth_user_workspaces()
            )
        )
    );

CREATE POLICY "Tenant users can access workspace entities" ON public.entities
    FOR ALL USING (workspace_id IN (SELECT public.get_auth_user_workspaces()));

CREATE POLICY "Tenant users can access workspace relationships" ON public.relationships
    FOR ALL USING (workspace_id IN (SELECT public.get_auth_user_workspaces()));

CREATE POLICY "Tenant users can access workspace traces" ON public.traces
    FOR ALL USING (workspace_id IN (SELECT public.get_auth_user_workspaces()));

CREATE POLICY "Tenant users can access workspace costs" ON public.llm_costs
    FOR SELECT USING (workspace_id IN (SELECT public.get_auth_user_workspaces()));

-- 4. Ensure proper execute permissions for authenticated users
REVOKE EXECUTE ON FUNCTION public.get_auth_user_workspaces() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_auth_user_workspaces() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_auth_user_workspaces() TO service_role;


-- Migration: 20260620000002_workspace_onboarding.sql
-- Revise handle_new_user to bootstrap workspace infrastructure
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  base_username text;
  new_username text;
  random_hex text;
  is_unique boolean := false;
  new_workspace_id uuid;
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

  -- Create personal workspace
  new_workspace_id := gen_random_uuid();
  INSERT INTO public.workspaces (id, name)
  VALUES (new_workspace_id, new_username || '''s Workspace');
  
  -- Add user as owner to the workspace
  INSERT INTO public.workspace_users (workspace_id, user_id, role)
  VALUES (new_workspace_id, new.id, 'owner');

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Migration: 20260620000003_document_integrity.sql
-- 1. Create personal workspaces for any user who doesn't have one (legacy users)
INSERT INTO public.workspaces (id, name)
SELECT gen_random_uuid(), username || '''s Workspace'
FROM public.profiles p
WHERE NOT EXISTS (SELECT 1 FROM public.workspace_users wu WHERE wu.user_id = p.id);

-- 2. Map those legacy users to their new workspaces
INSERT INTO public.workspace_users (workspace_id, user_id, role)
SELECT w.id, p.id, 'owner'
FROM public.profiles p
JOIN public.workspaces w ON w.name = p.username || '''s Workspace'
WHERE NOT EXISTS (SELECT 1 FROM public.workspace_users wu WHERE wu.user_id = p.id);

-- 3. Rescue legacy documents by assigning them to their owner's first available workspace
UPDATE public.documents d
SET workspace_id = (
    SELECT workspace_id 
    FROM public.workspace_users wu 
    WHERE wu.user_id = d.user_id 
    LIMIT 1
)
WHERE workspace_id IS NULL;

-- 4. Now that data is safe, enforce the NOT NULL constraint on documents
ALTER TABLE public.documents ALTER COLUMN workspace_id SET NOT NULL;

-- 5. Set default version number to 1 for document_versions
ALTER TABLE public.document_versions ALTER COLUMN version_number SET DEFAULT 1;

-- 6. Enforce document_versions foreign key mapping if missing
ALTER TABLE public.document_versions DROP CONSTRAINT IF EXISTS document_versions_document_id_fkey;
ALTER TABLE public.document_versions ADD CONSTRAINT document_versions_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.documents(id) ON DELETE CASCADE;

-- 7. Add indexing for workspace_id in documents
CREATE INDEX IF NOT EXISTS idx_documents_workspace_id ON public.documents(workspace_id);


-- Migration: 20260620000005_graph_schema_repair.sql
-- 20260620000005_graph_schema_repair.sql

-- 1. Add missing expected columns to entities (idempotent)
ALTER TABLE public.entities 
    ADD COLUMN IF NOT EXISTS canonical_name TEXT,
    ADD COLUMN IF NOT EXISTS aliases TEXT[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS entity_type TEXT DEFAULT 'concept',
    ADD COLUMN IF NOT EXISTS confidence_score FLOAT DEFAULT 1.0,
    ADD COLUMN IF NOT EXISTS source_count INT DEFAULT 1,
    ADD COLUMN IF NOT EXISTS mention_count INT DEFAULT 1;

-- 2. Add missing expected columns to relationships (idempotent)
ALTER TABLE public.relationships
    ADD COLUMN IF NOT EXISTS relationship_type TEXT,
    ADD COLUMN IF NOT EXISTS relationship_confidence FLOAT DEFAULT 1.0,
    ADD COLUMN IF NOT EXISTS supporting_chunk_ids UUID[] DEFAULT '{}';

-- 3. Backfill data safely without data loss
DO $$ 
BEGIN
    -- Backfill entities
    UPDATE public.entities 
    SET 
        canonical_name = COALESCE(canonical_name, name, 'Unknown ' || id::text),
        entity_type = COALESCE(entity_type, type, 'concept');

    -- Backfill relationships
    UPDATE public.relationships
    SET
        relationship_type = COALESCE(relationship_type, relation_type, 'related_to'),
        relationship_confidence = COALESCE(relationship_confidence, confidence_score, 1.0),
        supporting_chunk_ids = CASE 
            WHEN supporting_chunk_ids = '{}' AND source_chunk_id IS NOT NULL 
            THEN ARRAY[source_chunk_id] 
            ELSE supporting_chunk_ids 
        END;
END $$;

-- 4. Create missing constraints expected by downstream migrations
-- We don't drop the legacy columns to preserve any running application queries.
ALTER TABLE public.entities ALTER COLUMN canonical_name SET NOT NULL;
ALTER TABLE public.entities ALTER COLUMN entity_type SET NOT NULL;
ALTER TABLE public.relationships ALTER COLUMN relationship_type SET NOT NULL;

-- 5. Create Indexes
CREATE INDEX IF NOT EXISTS idx_entities_canonical_name ON public.entities USING btree (canonical_name);
CREATE INDEX IF NOT EXISTS idx_entities_aliases ON public.entities USING gin (aliases);
CREATE INDEX IF NOT EXISTS idx_relationships_source ON public.relationships USING btree (source_entity_id);
CREATE INDEX IF NOT EXISTS idx_relationships_target ON public.relationships USING btree (target_entity_id);

-- 6. UNIQUE Constraints needed for upsert logic
ALTER TABLE public.entities DROP CONSTRAINT IF EXISTS entities_workspace_id_canonical_name_entity_type_key;
ALTER TABLE public.entities ADD CONSTRAINT entities_workspace_id_canonical_name_entity_type_key UNIQUE(workspace_id, canonical_name, entity_type);

ALTER TABLE public.relationships DROP CONSTRAINT IF EXISTS relationships_source_entity_id_target_entity_id_relationship_type_key;
ALTER TABLE public.relationships ADD CONSTRAINT relationships_source_entity_id_target_entity_id_relationship_type_key UNIQUE(source_entity_id, target_entity_id, relationship_type);


-- Migration: 20260620000006_document_versions_rls.sql
-- Migration: 20260620000006_document_versions_rls.sql
-- Description: Add missing INSERT, UPDATE, and DELETE RLS policies to document_versions to resolve HTTP 403 Forbidden on upload.

-- 1. INSERT Policy
DROP POLICY IF EXISTS "Tenant users can insert workspace document versions" ON public.document_versions;
CREATE POLICY "Tenant users can insert workspace document versions" ON public.document_versions
    FOR INSERT WITH CHECK (
        document_id IN (
            SELECT id FROM public.documents WHERE workspace_id IN (
                SELECT public.get_auth_user_workspaces()
            )
        )
    );

-- 2. UPDATE Policy
DROP POLICY IF EXISTS "Tenant users can update workspace document versions" ON public.document_versions;
CREATE POLICY "Tenant users can update workspace document versions" ON public.document_versions
    FOR UPDATE USING (
        document_id IN (
            SELECT id FROM public.documents WHERE workspace_id IN (
                SELECT public.get_auth_user_workspaces()
            )
        )
    );

-- 3. DELETE Policy
DROP POLICY IF EXISTS "Tenant users can delete workspace document versions" ON public.document_versions;
CREATE POLICY "Tenant users can delete workspace document versions" ON public.document_versions
    FOR DELETE USING (
        document_id IN (
            SELECT id FROM public.documents WHERE workspace_id IN (
                SELECT public.get_auth_user_workspaces()
            )
        )
    );


-- Migration: 20260620000007_ingestion_jobs_rls.sql
-- 20260620000007_ingestion_jobs_rls.sql

-- Drop the old SELECT policy if it exists to keep everything unified
DROP POLICY IF EXISTS "Tenant users can view workspace ingestion jobs" ON public.ingestion_jobs;

-- Unified SELECT Policy
CREATE POLICY "Tenant users can view workspace ingestion jobs" ON public.ingestion_jobs
    FOR SELECT USING (
        document_version_id IN (
            SELECT id FROM public.document_versions WHERE document_id IN (
                SELECT id FROM public.documents WHERE workspace_id IN (
                    SELECT public.get_auth_user_workspaces()
                )
            )
        )
    );

-- Missing INSERT Policy
CREATE POLICY "Tenant users can insert workspace ingestion jobs" ON public.ingestion_jobs
    FOR INSERT WITH CHECK (
        document_version_id IN (
            SELECT id FROM public.document_versions WHERE document_id IN (
                SELECT id FROM public.documents WHERE workspace_id IN (
                    SELECT public.get_auth_user_workspaces()
                )
            )
        )
    );

-- Missing UPDATE Policy
CREATE POLICY "Tenant users can update workspace ingestion jobs" ON public.ingestion_jobs
    FOR UPDATE USING (
        document_version_id IN (
            SELECT id FROM public.document_versions WHERE document_id IN (
                SELECT id FROM public.documents WHERE workspace_id IN (
                    SELECT public.get_auth_user_workspaces()
                )
            )
        )
    );

-- Missing DELETE Policy
CREATE POLICY "Tenant users can delete workspace ingestion jobs" ON public.ingestion_jobs
    FOR DELETE USING (
        document_version_id IN (
            SELECT id FROM public.document_versions WHERE document_id IN (
                SELECT id FROM public.documents WHERE workspace_id IN (
                    SELECT public.get_auth_user_workspaces()
                )
            )
        )
    );


-- Migration: 20260620000008_documents_update.sql
-- 1. Add UPDATE policy for documents
DROP POLICY IF EXISTS "Tenant users can update workspace documents" ON public.documents;
CREATE POLICY "Tenant users can update workspace documents" ON public.documents
    FOR UPDATE USING (workspace_id IN (SELECT public.get_auth_user_workspaces()));


-- Migration: 20260620000009_document_chunks_rls.sql
-- Fix document_chunks RLS recursion that was missed in 20260620000001_fix_rls_recursion.sql
DROP POLICY IF EXISTS "Tenant users can access workspace document chunks" ON public.document_chunks;

CREATE POLICY "Tenant users can access workspace document chunks" ON public.document_chunks
    FOR ALL USING (workspace_id IN (SELECT public.get_auth_user_workspaces()));


-- Migration: 20260620000010_documents_delete.sql
DROP POLICY IF EXISTS "Users can delete own documents" ON public.documents;
DROP POLICY IF EXISTS "Tenant users can delete workspace documents" ON public.documents;

CREATE POLICY "Tenant users can delete workspace documents" ON public.documents
    FOR DELETE USING (workspace_id IN (SELECT public.get_auth_user_workspaces()));



