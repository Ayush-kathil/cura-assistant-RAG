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
