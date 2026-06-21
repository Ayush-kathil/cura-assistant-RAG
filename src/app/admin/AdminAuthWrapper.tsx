"use client";

import { useState } from "react";
import { ShieldAlert } from "lucide-react";

export function AdminAuthWrapper({ children, expectedPasscode = "1234" }: { children: React.ReactNode, expectedPasscode?: string }) {
  const [passcode, setPasscode] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === expectedPasscode) {
      setIsAuthenticated(true);
    } else {
      setError("Invalid passcode.");
      setPasscode("");
    }
  };

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 selection:bg-blue-100 selection:text-blue-900">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-slate-200">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-blue-100">
            <ShieldAlert className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-light text-slate-900 tracking-tight mb-2">Admin Authentication</h1>
          <p className="text-slate-500 font-light text-sm">Enter the master passcode to access the admin panel.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="password"
              placeholder="Enter Passcode"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="w-full text-center text-2xl tracking-widest font-medium bg-slate-50 border border-slate-200 rounded-xl py-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-all shadow-md shadow-blue-600/20"
          >
            Authenticate
          </button>
        </form>
      </div>
    </div>
  );
}
