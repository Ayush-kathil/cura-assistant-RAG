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
