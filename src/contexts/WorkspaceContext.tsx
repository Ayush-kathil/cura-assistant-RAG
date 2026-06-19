"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '@/utils/supabase/client';

export interface Workspace {
  id: string;
  name: string;
  created_at: string;
}

interface WorkspaceContextType {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  setActiveWorkspace: (workspaceId: string) => void;
  isLoading: boolean;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspaceState] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    let mounted = true;

    async function loadWorkspaces() {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) {
          if (mounted) setIsLoading(false);
          return;
        }

        const { data: workspacesData, error } = await supabase
          .from('workspaces')
          .select('*, workspace_users!inner(role)')
          .eq('workspace_users.user_id', userData.user.id);

        if (error) throw error;

        if (mounted && workspacesData) {
          setWorkspaces(workspacesData);
          
          // Hydrate from localStorage
          const savedWorkspaceId = localStorage.getItem('cura_active_workspace');
          if (savedWorkspaceId) {
            const savedWorkspace = workspacesData.find((w: Workspace) => w.id === savedWorkspaceId);
            if (savedWorkspace) {
              setActiveWorkspaceState(savedWorkspace);
              return;
            }
          }
          
          // Fallback to first available workspace
          if (workspacesData.length > 0) {
            setActiveWorkspaceState(workspacesData[0]);
            localStorage.setItem('cura_active_workspace', workspacesData[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to load workspaces", err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    loadWorkspaces();

    return () => {
      mounted = false;
    };
  }, []);

  const setActiveWorkspace = (workspaceId: string) => {
    const workspace = workspaces.find(w => w.id === workspaceId);
    if (workspace) {
      setActiveWorkspaceState(workspace);
      localStorage.setItem('cura_active_workspace', workspace.id);
    }
  };

  return (
    <WorkspaceContext.Provider value={{ workspaces, activeWorkspace, setActiveWorkspace, isLoading }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}
