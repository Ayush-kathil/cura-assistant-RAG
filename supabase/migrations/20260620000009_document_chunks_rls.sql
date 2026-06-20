-- Fix document_chunks RLS recursion that was missed in 20260620000001_fix_rls_recursion.sql
DROP POLICY IF EXISTS "Tenant users can access workspace document chunks" ON public.document_chunks;

CREATE POLICY "Tenant users can access workspace document chunks" ON public.document_chunks
    FOR ALL USING (workspace_id IN (SELECT public.get_auth_user_workspaces()));
