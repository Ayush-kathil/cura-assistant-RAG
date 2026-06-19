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
