"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Search, MoreVertical, HardDrive, FileText, Database, ShieldAlert } from "lucide-react";

export default function UsersAdmin() {
  const supabase = createClient();
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      // Trying to fetch from auth.users requires service_role key, which we don't use on client.
      // So we use mock data with Google-level touch points as requested.
      setTimeout(() => {
        setUsers([
          { id: '1', name: 'Ayush Kathil', email: 'ayush@example.com', lastActive: '2 mins ago', docs: 124, queries: 1405, storage: '1.2 GB', status: 'Active' },
          { id: '2', name: 'Sarah Connor', email: 'sarah.c@techcorp.com', lastActive: '5 hours ago', docs: 12, queries: 45, storage: '50 MB', status: 'Active' },
          { id: '3', name: 'John Doe', email: 'j.doe@unknown.net', lastActive: '2 days ago', docs: 0, queries: 0, storage: '0 MB', status: 'Suspended' },
          { id: '4', name: 'Elena Rostova', email: 'elena.r@research.edu', lastActive: 'Just now', docs: 890, queries: 12500, storage: '14.5 GB', status: 'Active' },
        ]);
        setIsLoading(false);
      }, 500);
    }
    fetchUsers();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <header className="mb-8">
        <h1 className="text-3xl font-light tracking-tight text-slate-900 mb-2">User Management</h1>
        <p className="text-slate-500 font-light">Monitor activity, token usage, and system access.</p>
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
            placeholder="Search users by name or email..."
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-widest text-slate-500 font-medium">
                <th className="py-4 px-6">User</th>
                <th className="py-4 px-6">Status / Last Active</th>
                <th className="py-4 px-6">Documents Uploaded</th>
                <th className="py-4 px-6">Queries Executed</th>
                <th className="py-4 px-6">Storage Used</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-700 divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">Loading users...</td>
                </tr>
              ) : users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-medium text-slate-600">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">{u.name}</div>
                        <div className="text-xs text-slate-500">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-col gap-1">
                      <span className={`inline-flex w-fit items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        u.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {u.status}
                      </span>
                      <span className="text-xs text-slate-500">{u.lastActive}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate-400" />
                      {u.docs}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-slate-400" />
                      {new Intl.NumberFormat('en-US').format(u.queries)}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <HardDrive className="w-4 h-4 text-slate-400" />
                      {u.storage}
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
