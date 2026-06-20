-- Migration: 20260620000006_document_versions_rls.sql
-- Description: Add missing INSERT, UPDATE, and DELETE RLS policies to document_versions to resolve HTTP 403 Forbidden on upload.

-- 1. INSERT Policy
DROP POLICY IF EXISTS "Tenant users can insert workspace document versions" ON public.document_versions;
CREATE POLICY "Tenant users can insert workspace document versions" ON public.document_versions
    FOR INSERT WITH CHECK (
        document_id IN (
            SELECT id FROM public.documents WHERE workspace_id IN (
                SELECT public.get_auth_user_workspaces()
            )
        )
    );

-- 2. UPDATE Policy
DROP POLICY IF EXISTS "Tenant users can update workspace document versions" ON public.document_versions;
CREATE POLICY "Tenant users can update workspace document versions" ON public.document_versions
    FOR UPDATE USING (
        document_id IN (
            SELECT id FROM public.documents WHERE workspace_id IN (
                SELECT public.get_auth_user_workspaces()
            )
        )
    );

-- 3. DELETE Policy
DROP POLICY IF EXISTS "Tenant users can delete workspace document versions" ON public.document_versions;
CREATE POLICY "Tenant users can delete workspace document versions" ON public.document_versions
    FOR DELETE USING (
        document_id IN (
            SELECT id FROM public.documents WHERE workspace_id IN (
                SELECT public.get_auth_user_workspaces()
            )
        )
    );
