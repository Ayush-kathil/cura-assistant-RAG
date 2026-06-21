import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { LayoutDashboard, Users, Database, Network, Key, ShieldCheck, Cpu, HardDrive, BarChart3, Activity, Settings, BookOpen } from "lucide-react";
import { AdminAuthWrapper } from "./AdminAuthWrapper";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Enforce access control
  if (!user || user.email !== "kathilshiva@gmail.com") {
    notFound(); // Return 404 for unauthorized users
  }

  const expectedPasscode = process.env.PASSCODE || "0000";

  return (
    <AdminAuthWrapper expectedPasscode={expectedPasscode}>
      <div className="bg-slate-50 min-h-screen text-slate-800 font-sans flex overflow-hidden">
        {/* Admin Sidebar */}
        <aside className="hidden md:flex fixed left-0 top-0 h-full z-40 flex-col w-64 bg-slate-900 border-r border-slate-800 transition-all duration-300">
          <div className="flex items-center gap-3 p-6 mb-4 border-b border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-medium text-xl tracking-tight text-white">Cura Admin</h1>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Command Center</p>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar px-4 space-y-8 pb-8">
            
            <div>
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 pl-2">System</h3>
              <nav className="space-y-1">
                <Link href="/admin" className="flex items-center gap-3 px-4 py-2 text-slate-300 hover:bg-slate-800 hover:text-white transition-all rounded-lg text-sm font-medium">
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Overview</span>
                </Link>
                <Link href="/admin/workspaces" className="flex items-center gap-3 px-4 py-2 text-slate-300 hover:bg-slate-800 hover:text-white transition-all rounded-lg text-sm font-medium">
                  <HardDrive className="w-4 h-4" />
                  <span>Workspaces</span>
                </Link>
                <Link href="/admin/users" className="flex items-center gap-3 px-4 py-2 text-slate-300 hover:bg-slate-800 hover:text-white transition-all rounded-lg text-sm font-medium">
                  <Users className="w-4 h-4" />
                  <span>Users</span>
                </Link>
              </nav>
            </div>

            <div>
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 pl-2">AI Intelligence</h3>
              <nav className="space-y-1">
                <Link href="/admin/ai" className="flex items-center gap-3 px-4 py-2 text-slate-300 hover:bg-slate-800 hover:text-white transition-all rounded-lg text-sm font-medium">
                  <BarChart3 className="w-4 h-4" />
                  <span>AI Analytics</span>
                </Link>
                <Link href="/admin/retrieval" className="flex items-center gap-3 px-4 py-2 text-slate-300 hover:bg-slate-800 hover:text-white transition-all rounded-lg text-sm font-medium">
                  <Activity className="w-4 h-4" />
                  <span>Retrieval Debugger</span>
                </Link>
                <Link href="/admin/ingestion" className="flex items-center gap-3 px-4 py-2 text-slate-300 hover:bg-slate-800 hover:text-white transition-all rounded-lg text-sm font-medium">
                  <Database className="w-4 h-4" />
                  <span>Ingestion Monitor</span>
                </Link>
              </nav>
            </div>

          </div>
          
          <div className="p-4 mt-auto border-t border-slate-800">
            <Link href="/dashboard" className="w-full py-3 bg-slate-800 text-slate-300 rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:bg-slate-700 hover:text-white transition-all">
              Exit Admin
            </Link>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 md:ml-64 flex flex-col min-h-screen relative overflow-y-auto bg-slate-50">
          {children}
        </main>
      </div>
    </AdminAuthWrapper>
  );
}
