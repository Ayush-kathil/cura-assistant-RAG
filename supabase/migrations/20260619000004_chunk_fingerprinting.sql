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
