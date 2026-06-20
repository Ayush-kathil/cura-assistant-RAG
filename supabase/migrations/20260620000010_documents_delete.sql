DROP POLICY IF EXISTS "Users can delete own documents" ON public.documents;
DROP POLICY IF EXISTS "Tenant users can delete workspace documents" ON public.documents;

CREATE POLICY "Tenant users can delete workspace documents" ON public.documents
    FOR DELETE USING (workspace_id IN (SELECT public.get_auth_user_workspaces()));
