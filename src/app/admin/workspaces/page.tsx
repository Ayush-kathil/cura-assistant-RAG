"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Search, MoreVertical, ShieldAlert, HardDrive, Users, Activity } from "lucide-react";

export default function WorkspacesAdmin() {
  const supabase = createClient();
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchWorkspaces() {
      const { data, error } = await supabase.from('workspaces').select(`
        id,
        name,
        created_at,
        documents (id)
      `).limit(50);
      
      if (data && !error) {
        const mapped = data.map((ws: any) => ({
          id: ws.id,
          name: ws.name,
          status: 'Active',
          storage: 'Calculating...', 
          queries: 0, 
          users: 1, 
          created: new Date(ws.created_at).toLocaleDateString()
        }));
        setWorkspaces(mapped);
      } else {
        setWorkspaces([]);
      }
      setIsLoading(false);
    }
    fetchWorkspaces();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-slate-900 mb-2">Workspaces</h1>
          <p className="text-slate-500 font-light">Manage tenants, storage quotas, and access.</p>
        </div>
      </header>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
            placeholder="Search workspaces by name or ID..."
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            Export CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-widest text-slate-500 font-medium">
                <th className="py-4 px-6">Workspace Name</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Storage Used</th>
                <th className="py-4 px-6">Query Volume</th>
                <th className="py-4 px-6">Active Users</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-700 divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">Loading workspaces...</td>
                </tr>
              ) : workspaces.map((ws) => (
                <tr key={ws.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="py-4 px-6 font-medium text-slate-900">{ws.name}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      ws.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {ws.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <HardDrive className="w-4 h-4 text-slate-400" />
                      {ws.storage}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-slate-400" />
                      {new Intl.NumberFormat('en-US').format(ws.queries)}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-slate-400" />
                      {ws.users}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button className="p-2 hover:bg-slate-200 text-slate-400 hover:text-slate-700 rounded-lg transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
