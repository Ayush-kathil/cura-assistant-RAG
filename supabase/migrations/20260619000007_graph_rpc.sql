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
