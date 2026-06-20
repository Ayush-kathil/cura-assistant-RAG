-- 1. Add UPDATE policy for documents
DROP POLICY IF EXISTS "Tenant users can update workspace documents" ON public.documents;
CREATE POLICY "Tenant users can update workspace documents" ON public.documents
    FOR UPDATE USING (workspace_id IN (SELECT public.get_auth_user_workspaces()));
