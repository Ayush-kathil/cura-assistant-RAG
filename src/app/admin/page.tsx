"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function AdminPage() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [enhancedPrivacy, setEnhancedPrivacy] = useState(true);
  const [newFeatureLab, setNewFeatureLab] = useState(false);

  return (
    <div className="flex overflow-hidden bg-background text-on-surface font-body-md min-h-screen">
      
      {/* SideNavBar Shell */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full z-40 flex-col p-4 bg-surface-container-low h-screen w-64 rounded-r-lg shadow-lg shadow-primary/5 transition-all duration-300 ease-in-out">
        
        {/* Brand Header */}
        <div className="flex flex-col mb-8 px-4 py-2">
          <h1 className="font-headline-md text-headline-md text-primary font-bold">Cura AI</h1>
          <p className="font-body-md text-body-md text-on-surface-variant opacity-70">Admin Console</p>
        </div>
        
        {/* Navigation items */}
        <nav className="flex flex-col gap-2 flex-grow">
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 bg-primary-container text-on-primary-container rounded-xl transition-all duration-300 ease-in-out font-bold">
            <span className="material-symbols-outlined">settings</span>
            <span>Settings</span>
          </Link>
          <Link href="/workspace" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-secondary-container/50 transition-all duration-300 ease-in-out rounded-xl">
            <span className="material-symbols-outlined">chat_bubble</span>
            <span>Chat</span>
          </Link>
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-secondary-container/50 transition-all duration-300 ease-in-out rounded-xl">
            <span className="material-symbols-outlined">dashboard</span>
            <span>Dashboard</span>
          </Link>
          <Link href="/upload-pro" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-secondary-container/50 transition-all duration-300 ease-in-out rounded-xl">
            <span className="material-symbols-outlined">auto_stories</span>
            <span>Resources</span>
          </Link>
        </nav>
        
        {/* CTA & Profile */}
        <div className="mt-auto flex flex-col gap-4">
          <button className="w-full py-3 px-4 bg-primary text-white rounded-full font-label-md flex items-center justify-center gap-2 active:scale-95 transition-transform">
            <span className="material-symbols-outlined">add</span>
            New User
          </button>
          <div className="flex items-center gap-3 p-2 rounded-xl bg-white/50 border border-white/50">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-primary text-white flex items-center justify-center font-bold">
              AS
            </div>
            <div className="overflow-hidden">
              <p className="font-label-md text-on-surface truncate font-bold">Admin Sarah</p>
              <p className="text-[10px] uppercase tracking-wider text-primary font-bold">Root Access</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Canvas */}
      <main className="ml-0 md:ml-64 flex-1 h-screen overflow-y-auto bg-background p-6 md:p-10 relative custom-scrollbar">
        
        {/* Header */}
        <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h2 className="font-headline-lg text-[36px] font-bold text-on-background">System Overview</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant">Manage users, monitor AI performance, and adjust system settings.</p>
          </div>
          <div className="flex gap-4">
            <button className="flex items-center gap-2 px-6 py-2 rounded-full border border-outline-variant/30 text-on-surface hover:bg-white transition-colors shadow-sm">
              <span className="material-symbols-outlined">file_download</span>
              <span className="font-label-md font-bold">Export Reports</span>
            </button>
            <div className="p-2 bg-white rounded-full shadow-[0_10px_20px_rgba(12,103,128,0.05)] cursor-pointer hover:scale-105 transition-transform flex items-center justify-center w-10 h-10">
              <span className="material-symbols-outlined text-primary">notifications</span>
            </div>
          </div>
        </header>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          
          <div className="glass-panel p-6 rounded-[1.5rem] shadow-[0_20px_40px_-10px_rgba(12,103,128,0.05)] flex flex-col gap-2 relative overflow-hidden group border border-white/40">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary-container/20 rounded-full group-hover:scale-125 transition-transform duration-500"></div>
            <span className="font-label-sm text-on-surface-variant uppercase tracking-widest font-bold">Active Users</span>
            <span className="font-headline-lg text-[40px] font-bold text-primary">12.4k</span>
            <div className="flex items-center gap-1 text-emerald-600 mt-1">
              <span className="material-symbols-outlined text-[16px]">trending_up</span>
              <span className="font-label-sm font-bold">+8% vs last month</span>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-[1.5rem] shadow-[0_20px_40px_-10px_rgba(12,103,128,0.05)] flex flex-col gap-2 relative overflow-hidden group border border-white/40">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-secondary-container/20 rounded-full group-hover:scale-125 transition-transform duration-500"></div>
            <span className="font-label-sm text-on-surface-variant uppercase tracking-widest font-bold">Bot Accuracy</span>
            <span className="font-headline-lg text-[40px] font-bold text-primary">94.2%</span>
            <div className="w-full bg-surface-container-high h-2 rounded-full mt-2 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }} 
                animate={{ width: '94.2%' }} 
                transition={{ duration: 1.5, ease: "easeOut" }} 
                className="bg-primary h-full rounded-full"
              />
            </div>
          </div>

          <div className="glass-panel p-6 rounded-[1.5rem] shadow-[0_20px_40px_-10px_rgba(12,103,128,0.05)] flex flex-col gap-2 relative overflow-hidden group border border-white/40">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-tertiary-container/20 rounded-full group-hover:scale-125 transition-transform duration-500"></div>
            <span className="font-label-sm text-on-surface-variant uppercase tracking-widest font-bold">Support Tickets</span>
            <span className="font-headline-lg text-[40px] font-bold text-primary">42</span>
            <span className="font-label-sm text-on-surface-variant mt-1 font-bold">12 urgent pending</span>
          </div>

          <div className="glass-panel p-6 rounded-[1.5rem] shadow-[0_20px_40px_-10px_rgba(12,103,128,0.05)] flex flex-col gap-2 relative overflow-hidden group border border-white/40">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-error-container/20 rounded-full group-hover:scale-125 transition-transform duration-500"></div>
            <span className="font-label-sm text-on-surface-variant uppercase tracking-widest font-bold">System Health</span>
            <span className="font-headline-lg text-[32px] font-bold text-primary mt-1 mb-1">Normal</span>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="font-label-sm text-on-surface-variant font-bold">99.9% Uptime</span>
            </div>
          </div>
        </div>

        {/* User Management Table */}
        <div className="flex flex-col gap-6 mb-10">
          <div className="glass-panel rounded-[1.5rem] shadow-[0_20px_40px_-10px_rgba(12,103,128,0.05)] overflow-hidden border border-white/40">
            
            <div className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/50 border-b border-outline-variant/10">
              <h3 className="font-headline-md text-[24px] font-bold text-on-surface">User Management</h3>
              <div className="flex gap-4 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none">
                  <input className="w-full sm:w-64 pl-10 pr-4 py-2 rounded-full border border-outline-variant/30 bg-surface-container-low focus:ring-2 focus:ring-primary/20 focus:border-primary/50 font-body-md outline-none transition-all" placeholder="Search users..." type="text"/>
                  <span className="material-symbols-outlined absolute left-3 top-2 text-on-surface-variant">search</span>
                </div>
                <button className="p-2 bg-secondary-container/30 rounded-lg text-primary hover:bg-secondary-container/50 transition-colors border border-primary/10">
                  <span className="material-symbols-outlined">filter_list</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-on-surface-variant font-label-md border-b border-outline-variant/10 bg-white/30">
                    <th className="px-6 py-4 font-bold uppercase tracking-wider">User</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-wider">Access Level</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-wider">Last Active</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="font-body-md">
                  
                  {/* Row 1 */}
                  <tr className="hover:bg-primary-container/5 transition-colors border-b border-outline-variant/10 bg-white/40">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-secondary-container text-primary flex items-center justify-center font-bold">EM</div>
                        <div>
                          <p className="font-bold">Elena Martinez</p>
                          <p className="text-xs text-on-surface-variant">elena.m@example.com</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-surface-container-high rounded-full text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Pro Plan</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span className="font-bold text-sm">Active</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant text-sm">2 mins ago</td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 hover:bg-surface-container rounded-full transition-colors text-on-surface-variant">
                        <span className="material-symbols-outlined">more_vert</span>
                      </button>
                    </td>
                  </tr>

                  {/* Row 2 */}
                  <tr className="hover:bg-primary-container/5 transition-colors border-b border-outline-variant/10 bg-white/40">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-tertiary-container text-on-tertiary-container flex items-center justify-center font-bold">JD</div>
                        <div>
                          <p className="font-bold">Julian Drake</p>
                          <p className="text-xs text-on-surface-variant">j.drake@curasupport.ai</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-primary-container/50 rounded-full text-[11px] font-bold text-primary uppercase tracking-wider">Moderator</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span className="font-bold text-sm">Active</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant text-sm">1 hour ago</td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 hover:bg-surface-container rounded-full transition-colors text-on-surface-variant">
                        <span className="material-symbols-outlined">more_vert</span>
                      </button>
                    </td>
                  </tr>

                  {/* Row 3 */}
                  <tr className="hover:bg-primary-container/5 transition-colors border-b border-outline-variant/10 bg-white/40">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-secondary-container text-primary flex items-center justify-center font-bold">SM</div>
                        <div>
                          <p className="font-bold">Sarah Miller</p>
                          <p className="text-xs text-on-surface-variant">smiller@cloud.com</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-surface-container-high rounded-full text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Free Tier</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-outline-variant"></span>
                        <span className="font-bold text-sm text-on-surface-variant">Offline</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant text-sm">2 days ago</td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 hover:bg-surface-container rounded-full transition-colors text-on-surface-variant">
                        <span className="material-symbols-outlined">more_vert</span>
                      </button>
                    </td>
                  </tr>

                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            <div className="p-4 flex flex-col sm:flex-row justify-between items-center gap-4 bg-surface-container-low/50">
              <span className="font-label-sm text-on-surface-variant font-bold tracking-wider uppercase text-[11px]">Showing 1-10 of 12,431 users</span>
              <div className="flex gap-2">
                <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white transition-colors border border-outline-variant/20 shadow-sm">
                  <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary text-white font-bold text-xs shadow-md">1</button>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white font-bold text-xs border border-outline-variant/20 shadow-sm transition-colors">2</button>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white font-bold text-xs border border-outline-variant/20 shadow-sm transition-colors">3</button>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white transition-colors border border-outline-variant/20 shadow-sm">
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Performance & System Settings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          
          {/* AI Engine Stats */}
          <div className="glass-panel p-8 rounded-[1.5rem] shadow-[0_20px_40px_-10px_rgba(12,103,128,0.05)] border border-white/40">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h4 className="font-headline-md text-[24px] font-bold text-on-surface">AI Performance</h4>
                <p className="font-body-md text-on-surface-variant mt-1">Inference speed and token usage</p>
              </div>
              <div className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[11px] font-bold tracking-widest uppercase shadow-sm">Optimal</div>
            </div>
            
            <div className="flex flex-col gap-6 mt-8">
              <div className="flex justify-between items-end">
                <div className="flex flex-col">
                  <span className="font-label-md font-bold text-[16px]">Avg Response Time</span>
                  <span className="font-body-md text-sm text-on-surface-variant mt-1">Across all regions</span>
                </div>
                <span className="font-headline-md text-[32px] font-bold text-primary leading-none">1.2s</span>
              </div>
              
              <div className="w-full bg-surface-container-high h-3 rounded-full overflow-hidden shadow-inner">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '80%' }}
                  transition={{ duration: 1.2, delay: 0.2 }}
                  className="bg-primary h-full rounded-full"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="p-4 bg-white/60 rounded-xl border border-white shadow-sm">
                  <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Token Efficiency</p>
                  <p className="text-[28px] font-bold text-primary mt-1">88%</p>
                </div>
                <div className="p-4 bg-white/60 rounded-xl border border-white shadow-sm">
                  <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Context Drift</p>
                  <p className="text-[28px] font-bold text-primary mt-1">Lo-Risk</p>
                </div>
              </div>
            </div>
          </div>

          {/* System Config Quick Toggles */}
          <div className="glass-panel p-8 rounded-[1.5rem] shadow-[0_20px_40px_-10px_rgba(12,103,128,0.05)] border border-white/40">
            <h4 className="font-headline-md text-[24px] font-bold text-on-surface mb-6">System Controls</h4>
            
            <div className="flex flex-col gap-4">
              
              {/* Toggle 1 */}
              <div className="flex justify-between items-center p-4 bg-white/60 rounded-xl border border-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col">
                  <span className="font-label-md font-bold text-lg">Maintenance Mode</span>
                  <span className="text-sm text-on-surface-variant mt-1">Redirect users to status page</span>
                </div>
                <button 
                  onClick={() => setMaintenanceMode(!maintenanceMode)}
                  className={`w-14 h-8 rounded-full p-1 transition-colors relative shadow-inner ${maintenanceMode ? 'bg-primary' : 'bg-outline-variant/30'}`}
                >
                  <div className={`w-6 h-6 bg-white rounded-full shadow-sm transition-transform duration-300 ${maintenanceMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </button>
              </div>

              {/* Toggle 2 */}
              <div className="flex justify-between items-center p-4 bg-white/60 rounded-xl border border-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col">
                  <span className="font-label-md font-bold text-lg">Enhanced Privacy</span>
                  <span className="text-sm text-on-surface-variant mt-1">Aggressive PII scrubbing</span>
                </div>
                <button 
                  onClick={() => setEnhancedPrivacy(!enhancedPrivacy)}
                  className={`w-14 h-8 rounded-full p-1 transition-colors relative shadow-inner ${enhancedPrivacy ? 'bg-primary' : 'bg-outline-variant/30'}`}
                >
                  <div className={`w-6 h-6 bg-white rounded-full shadow-sm transition-transform duration-300 ${enhancedPrivacy ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </button>
              </div>

              {/* Toggle 3 */}
              <div className="flex justify-between items-center p-4 bg-white/60 rounded-xl border border-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col">
                  <span className="font-label-md font-bold text-lg">New Feature Lab</span>
                  <span className="text-sm text-on-surface-variant mt-1">Enable beta features for 10% of users</span>
                </div>
                <button 
                  onClick={() => setNewFeatureLab(!newFeatureLab)}
                  className={`w-14 h-8 rounded-full p-1 transition-colors relative shadow-inner ${newFeatureLab ? 'bg-primary' : 'bg-outline-variant/30'}`}
                >
                  <div className={`w-6 h-6 bg-white rounded-full shadow-sm transition-transform duration-300 ${newFeatureLab ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </button>
              </div>

            </div>
          </div>

        </div>

        {/* Footer */}
        <footer className="w-full py-8 mt-12 flex flex-col items-center gap-4 bg-surface-container-highest/50 rounded-t-xl border-t border-white/50">
          <h5 className="font-headline-md text-xl font-bold text-primary">Cura</h5>
          <div className="flex gap-8">
            <Link href="#" className="font-label-sm font-bold text-on-tertiary-fixed-variant hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="#" className="font-label-sm font-bold text-on-tertiary-fixed-variant hover:text-primary transition-colors">Terms of Service</Link>
            <Link href="#" className="font-label-sm font-bold text-on-tertiary-fixed-variant hover:text-primary transition-colors">Contact Us</Link>
          </div>
          <p className="font-label-sm text-on-tertiary-fixed-variant mt-2">© {new Date().getFullYear()} Cura AI. Made with empathy.</p>
        </footer>

      </main>
    </div>
  );
}
