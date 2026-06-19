import { createClient } from "@/utils/supabase/server";

export class WorkspaceService {
  /**
   * Retrieves the current user's active workspaces
   */
  static async getWorkspaces() {
    const supabase = await createClient();
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error("Unauthorized");

    const { data: workspaces, error } = await supabase
      .from('workspaces')
      .select('*, workspace_users!inner(role)')
      .eq('workspace_users.user_id', user.user.id);

    if (error) throw error;
    return workspaces;
  }

  /**
   * Creates a new workspace and assigns the user as owner
   */
  static async createWorkspace(name: string) {
    const supabase = await createClient();
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error("Unauthorized");

    // 1. Create Workspace
    const { data: workspace, error: wsError } = await supabase
      .from('workspaces')
      .insert({ name })
      .select()
      .single();

    if (wsError || !workspace) throw wsError;

    // 2. Assign Owner
    const { error: roleError } = await supabase
      .from('workspace_users')
      .insert({
        workspace_id: workspace.id,
        user_id: user.user.id,
        role: 'owner'
      });

    if (roleError) throw roleError;
    return workspace;
  }
}
