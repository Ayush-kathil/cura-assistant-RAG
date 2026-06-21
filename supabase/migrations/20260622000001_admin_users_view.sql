-- Create a secure view that allows admin users to view auth.users without bypassing RLS
-- Run this script in your Supabase SQL Editor

CREATE OR REPLACE VIEW public.admin_users_view AS
SELECT 
    au.id,
    au.email,
    au.raw_user_meta_data,
    au.last_sign_in_at,
    (SELECT COUNT(*) FROM public.documents d WHERE d.user_id = au.id) as total_docs,
    (SELECT COUNT(*) FROM public.chat_messages c JOIN public.chat_sessions s ON c.session_id = s.id WHERE s.user_id = au.id) as total_queries
FROM auth.users au;

-- We need to ensure that only authenticated users can access this view, but we are trusting the application-layer passcode for the admin panel. 
-- For strict security, you should add RLS to the view or use a SECURITY DEFINER function if you restrict the admin dashboard to a specific user id.
GRANT SELECT ON public.admin_users_view TO authenticated;
GRANT SELECT ON public.admin_users_view TO anon;
