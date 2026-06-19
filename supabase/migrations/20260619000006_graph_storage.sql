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
