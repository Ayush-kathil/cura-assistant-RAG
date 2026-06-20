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
