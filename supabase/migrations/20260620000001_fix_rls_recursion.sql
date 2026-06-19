-- 1. Create a helper function that bypasses RLS to prevent infinite recursion
CREATE OR REPLACE FUNCTION public.get_auth_user_workspaces()
RETURNS SETOF UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT workspace_id FROM public.workspace_users WHERE user_id = auth.uid();
$$;

-- 2. Drop the recursive policies
DROP POLICY IF EXISTS "Users can view workspace users they share a workspace with" ON public.workspace_users;
DROP POLICY IF EXISTS "Tenant users can view workspace documents" ON public.documents;
DROP POLICY IF EXISTS "Tenant users can view workspace chat sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Tenant users can view workspace document versions" ON public.document_versions;
DROP POLICY IF EXISTS "Tenant users can access workspace entities" ON public.entities;
DROP POLICY IF EXISTS "Tenant users can access workspace relationships" ON public.relationships;
DROP POLICY IF EXISTS "Tenant users can access workspace traces" ON public.traces;
DROP POLICY IF EXISTS "Tenant users can access workspace costs" ON public.llm_costs;

-- 3. Recreate the policies using the non-recursive helper function
CREATE POLICY "Users can view workspace users they share a workspace with" ON public.workspace_users
    FOR SELECT USING (workspace_id IN (SELECT public.get_auth_user_workspaces()));

CREATE POLICY "Tenant users can view workspace documents" ON public.documents
    FOR SELECT USING (workspace_id IN (SELECT public.get_auth_user_workspaces()));

CREATE POLICY "Tenant users can view workspace chat sessions" ON public.chat_sessions
    FOR SELECT USING (workspace_id IN (SELECT public.get_auth_user_workspaces()));

CREATE POLICY "Tenant users can view workspace document versions" ON public.document_versions
    FOR SELECT USING (
        document_id IN (
            SELECT id FROM public.documents WHERE workspace_id IN (
                SELECT public.get_auth_user_workspaces()
            )
        )
    );

CREATE POLICY "Tenant users can access workspace entities" ON public.entities
    FOR ALL USING (workspace_id IN (SELECT public.get_auth_user_workspaces()));

CREATE POLICY "Tenant users can access workspace relationships" ON public.relationships
    FOR ALL USING (workspace_id IN (SELECT public.get_auth_user_workspaces()));

CREATE POLICY "Tenant users can access workspace traces" ON public.traces
    FOR ALL USING (workspace_id IN (SELECT public.get_auth_user_workspaces()));

CREATE POLICY "Tenant users can access workspace costs" ON public.llm_costs
    FOR SELECT USING (workspace_id IN (SELECT public.get_auth_user_workspaces()));

-- 4. Ensure proper execute permissions for authenticated users
REVOKE EXECUTE ON FUNCTION public.get_auth_user_workspaces() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_auth_user_workspaces() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_auth_user_workspaces() TO service_role;
