-- Revise handle_new_user to bootstrap workspace infrastructure
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  base_username text;
  new_username text;
  random_hex text;
  is_unique boolean := false;
  new_workspace_id uuid;
BEGIN
  base_username := COALESCE(new.raw_user_meta_data->>'first_name', split_part(new.email, '@', 1), 'user');
  base_username := lower(regexp_replace(base_username, '[^a-zA-Z0-9]', '', 'g'));
  
  WHILE NOT is_unique LOOP
    random_hex := lpad(to_hex(floor(random() * 65536)::int), 4, '0');
    new_username := base_username || random_hex;
    
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE username = new_username) THEN
      is_unique := true;
    END IF;
  END LOOP;

  INSERT INTO public.profiles (id, username, plan_tier, storage_used_bytes)
  VALUES (new.id, new_username, 'free', 0);

  -- Create personal workspace
  new_workspace_id := gen_random_uuid();
  INSERT INTO public.workspaces (id, name)
  VALUES (new_workspace_id, new_username || '''s Workspace');
  
  -- Add user as owner to the workspace
  INSERT INTO public.workspace_users (workspace_id, user_id, role)
  VALUES (new_workspace_id, new.id, 'owner');

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
