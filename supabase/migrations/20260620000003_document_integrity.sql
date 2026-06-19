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
