DROP VIEW IF EXISTS public.admin_users_view;

CREATE OR REPLACE FUNCTION public.get_admin_users()
RETURNS TABLE (
    id uuid,
    email varchar,
    raw_user_meta_data jsonb,
    last_sign_in_at timestamptz,
    total_docs bigint,
    total_queries bigint
)
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Explicitly verify admin email
    IF auth.jwt() ->> 'email' != 'kathilshiva@gmail.com' THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    RETURN QUERY
    SELECT 
        au.id,
        au.email::varchar,
        au.raw_user_meta_data,
        au.last_sign_in_at,
        (SELECT COUNT(*) FROM public.documents d WHERE d.user_id = au.id) as total_docs,
        (SELECT COUNT(*) FROM public.chat_messages c JOIN public.chat_sessions s ON c.session_id = s.id WHERE s.user_id = au.id) as total_queries
    FROM auth.users au;
END;
$$ LANGUAGE plpgsql;

-- Secure the function permissions
REVOKE ALL ON FUNCTION public.get_admin_users() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_admin_users() FROM anon;
GRANT EXECUTE ON FUNCTION public.get_admin_users() TO authenticated;
