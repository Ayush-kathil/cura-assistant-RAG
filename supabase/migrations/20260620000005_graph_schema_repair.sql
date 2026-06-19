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
