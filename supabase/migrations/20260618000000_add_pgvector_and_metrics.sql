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
