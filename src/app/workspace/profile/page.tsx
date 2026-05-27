"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { motion } from "framer-motion";
import { ChevronLeft, Cloud, CheckCircle, AlertTriangle, LogOut, Edit2 } from "lucide-react";

const plans = [
  { id: "1gb", name: "1 GB Starter", price: "₹50", limit: "1 GB Storage", color: "bg-blue-500", highlight: "border-blue-200" },
  { id: "2gb", name: "2 GB Pro", price: "₹100", limit: "2 GB Storage", color: "bg-indigo-500", highlight: "border-indigo-200", popular: true },
  { id: "5gb", name: "5 GB Ultra", price: "₹200", limit: "5 GB Storage", color: "bg-purple-500", highlight: "border-purple-200" }
];

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();
  const [userEmail, setUserEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState("");
  const [totalStorageBytes, setTotalStorageBytes] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUserEmail(user.email || "");
      setFullName(user.user_metadata?.full_name || "");
      setTempName(user.user_metadata?.full_name || "");

      // Calculate total storage by fetching documents
      const { data: docs } = await supabase.from('documents').select('file_size_bytes').eq('user_id', user.id);
      if (docs) {
        const total = docs.reduce((acc: number, doc: any) => acc + (doc.file_size_bytes || 0), 0);
        setTotalStorageBytes(total);
      }
      setLoading(false);
    }
    loadProfile();
  }, [router, supabase]);

  const handleSaveName = async () => {
    const { data, error } = await supabase.auth.updateUser({
      data: { full_name: tempName.trim() }
    });
    if (!error && data.user) {
      setFullName(tempName.trim());
    }
    setIsEditingName(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const freeLimit = 500 * 1024 * 1024; // 500 MB
  const percentage = Math.min((totalStorageBytes / freeLimit) * 100, 100);
  const usedMB = (totalStorageBytes / (1024 * 1024)).toFixed(1);

  return (
    <div className="min-h-[100dvh] bg-slate-50 text-slate-900 font-sans pb-10">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 flex items-center px-4 py-4 gap-3 shadow-sm">
        <button onClick={() => router.push('/workspace')} className="p-2 -ml-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold tracking-tight">Profile & Dashboard</h1>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 space-y-8">
        
        {/* Profile Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-2xl shadow-sm border-2 border-blue-200 shrink-0">
              {fullName?.[0]?.toUpperCase() || userEmail?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="flex-1">
              {isEditingName ? (
                <div className="flex items-center gap-2 mb-1">
                  <input 
                    type="text" 
                    value={tempName} 
                    onChange={(e) => setTempName(e.target.value)} 
                    placeholder="Enter your name"
                    className="border border-slate-200 rounded-lg px-3 py-1.5 text-lg font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-[200px]"
                    autoFocus
                  />
                  <button onClick={handleSaveName} className="bg-blue-500 text-white p-1.5 rounded-lg hover:bg-blue-600"><CheckCircle className="w-5 h-5"/></button>
                  <button onClick={() => {setIsEditingName(false); setTempName(fullName);}} className="bg-slate-200 text-slate-600 p-1.5 rounded-lg hover:bg-slate-300">Cancel</button>
                </div>
              ) : (
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{fullName || "Add your name"}</h2>
                  <button onClick={() => setIsEditingName(true)} className="text-slate-400 hover:text-blue-500 p-1">
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              )}
              <p className="text-sm text-slate-500 mb-1">{userEmail}</p>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-200 text-slate-600">
                Free Plan
              </span>
            </div>
          </div>
          
          <button onClick={handleLogout} className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-sm font-bold transition-colors w-full sm:w-auto border border-red-100">
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        {/* Storage Section */}
        <section>
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Cloud className="w-5 h-5 text-blue-500" /> Storage Usage
          </h3>
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
            <div className="flex justify-between items-end mb-3">
              <div>
                <span className="text-3xl font-bold text-slate-900">{usedMB} MB</span>
                <span className="text-slate-500 font-medium ml-1">used of 500 MB</span>
              </div>
              <span className="text-sm font-bold text-slate-400">{percentage.toFixed(0)}%</span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-full rounded-full ${percentage > 90 ? 'bg-red-500' : 'bg-blue-500'}`}
              />
            </div>
            {percentage > 80 && (
              <p className="mt-4 text-sm text-amber-600 font-medium flex items-center gap-2 bg-amber-50 p-3 rounded-xl border border-amber-100">
                <AlertTriangle className="w-5 h-5 shrink-0" /> You are nearing your free storage limit. Upgrade to continue uploading documents seamlessly.
              </p>
            )}
          </div>
        </section>

        {/* Pro Plans Section */}
        <section>
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">Upgrade your Curio Experience</h3>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {plans.map((plan, i) => (
              <motion.div 
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`relative flex flex-col p-6 rounded-3xl bg-white border-2 transition-all duration-300 hover:shadow-lg ${plan.popular ? 'border-indigo-400 shadow-md sm:scale-105 z-10' : 'border-slate-100 hover:border-slate-200'}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
                    Most Popular
                  </div>
                )}
                
                <h4 className="text-lg font-bold text-slate-700 mb-1">{plan.name}</h4>
                <div className="mb-6">
                  <span className="text-3xl font-bold text-slate-900">{plan.price}</span>
                  <span className="text-slate-500 text-sm">/month</span>
                </div>
                
                <ul className="flex-1 space-y-3 mb-6">
                  <li className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                    <CheckCircle className={`w-4 h-4 ${plan.color.replace('bg-', 'text-')}`} />
                    {plan.limit}
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                    <CheckCircle className={`w-4 h-4 ${plan.color.replace('bg-', 'text-')}`} />
                    Priority AI processing
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                    <CheckCircle className={`w-4 h-4 ${plan.color.replace('bg-', 'text-')}`} />
                    Premium support
                  </li>
                </ul>
                
                <button className={`w-full py-3 rounded-xl font-bold text-white transition-transform active:scale-95 shadow-sm ${plan.color} hover:brightness-110`}>
                  Choose {plan.name.split(' ')[0]}
                </button>
              </motion.div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}
