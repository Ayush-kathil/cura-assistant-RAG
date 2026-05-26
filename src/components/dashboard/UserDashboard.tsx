"use client";

import { motion, AnimatePresence } from "framer-motion";

interface UserDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  totalStorageBytes: number;
}

const plans = [
  { id: "1gb", name: "1 GB Starter", price: "₹50", limit: "1 GB Storage", color: "bg-blue-500", highlight: "border-blue-200" },
  { id: "2gb", name: "2 GB Pro", price: "₹100", limit: "2 GB Storage", color: "bg-indigo-500", highlight: "border-indigo-200", popular: true },
  { id: "5gb", name: "5 GB Ultra", price: "₹200", limit: "5 GB Storage", color: "bg-purple-500", highlight: "border-purple-200" }
];

export function UserDashboard({ isOpen, onClose, userEmail, totalStorageBytes }: UserDashboardProps) {
  const freeLimit = 500 * 1024 * 1024; // 500 MB
  const percentage = Math.min((totalStorageBytes / freeLimit) * 100, 100);
  const usedMB = (totalStorageBytes / (1024 * 1024)).toFixed(1);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-2xl shadow-sm border-2 border-blue-200">
                  {userEmail?.[0]?.toUpperCase() || "U"}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{userEmail?.split('@')[0] || "User"}</h2>
                  <p className="text-sm text-slate-500 mb-1">{userEmail}</p>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-200 text-slate-600">
                    Free Plan
                  </span>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-10 custom-scrollbar">
              
              {/* Storage Section */}
              <section>
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-500">cloud</span> Storage Usage
                </h3>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <span className="text-2xl font-bold text-slate-900">{usedMB} MB</span>
                      <span className="text-slate-500 font-medium ml-1">used of 500 MB (Free)</span>
                    </div>
                    <span className="text-sm font-bold text-slate-400">{percentage.toFixed(0)}%</span>
                  </div>
                  <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`h-full rounded-full ${percentage > 90 ? 'bg-red-500' : 'bg-blue-500'}`}
                    />
                  </div>
                  {percentage > 80 && (
                    <p className="mt-3 text-sm text-amber-600 font-medium flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">warning</span> You are nearing your free storage limit. Upgrade to continue uploading documents seamlessly.
                    </p>
                  )}
                </div>
              </section>

              {/* Pro Plans Section */}
              <section>
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">Upgrade your Curio Experience</h3>
                </div>

                <div className="grid md:grid-cols-3 gap-6 px-2">
                  {plans.map((plan, i) => (
                    <motion.div 
                      key={plan.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                      className={`relative flex flex-col p-6 rounded-3xl bg-white border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${plan.popular ? 'border-indigo-400 shadow-md scale-105 md:scale-110 z-10' : 'border-slate-100 hover:border-slate-300'}`}
                    >
                      {plan.popular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
                          Most Popular
                        </div>
                      )}
                      
                      <h4 className="text-lg font-bold text-slate-700 mb-1">{plan.name}</h4>
                      <div className="mb-4">
                        <span className="text-3xl font-bold text-slate-900">{plan.price}</span>
                        <span className="text-slate-500 text-sm">/month</span>
                      </div>
                      
                      <ul className="flex-1 space-y-3 mb-6">
                        <li className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                          <span className={`material-symbols-outlined text-[16px] ${plan.color.replace('bg-', 'text-')}`}>check_circle</span>
                          {plan.limit}
                        </li>
                        <li className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                          <span className={`material-symbols-outlined text-[16px] ${plan.color.replace('bg-', 'text-')}`}>check_circle</span>
                          Priority AI processing
                        </li>
                        <li className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                          <span className={`material-symbols-outlined text-[16px] ${plan.color.replace('bg-', 'text-')}`}>check_circle</span>
                          Premium support
                        </li>
                      </ul>
                      
                      <button className={`w-full py-3 rounded-xl font-bold text-white transition-transform active:scale-95 shadow-md ${plan.color} hover:brightness-110`}>
                        Choose {plan.name.split(' ')[0]}
                      </button>
                    </motion.div>
                  ))}
                </div>
              </section>
              
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
