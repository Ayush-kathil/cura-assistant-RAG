"use client";

import { useState } from "react";
import { Lock } from "lucide-react";

export function AdminAuthWrapper({ 
  expectedPasscode, 
  children 
}: { 
  expectedPasscode: string; 
  children: React.ReactNode; 
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === expectedPasscode) {
      setIsAuthenticated(true);
    } else {
      setError("Incorrect passcode");
      setPasscode("");
    }
  };

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
            <Lock className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <h2 className="text-2xl font-light text-center text-slate-900 mb-2">Admin Authentication</h2>
        <p className="text-sm text-center text-slate-500 mb-8">Please enter the 4-digit master passcode to continue.</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input 
              type="password"
              maxLength={4}
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="w-full text-center tracking-[1em] text-3xl font-light py-4 border-b-2 border-slate-200 focus:border-blue-600 outline-none transition-colors"
              placeholder="••••"
              autoFocus
            />
            {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}
          </div>
          
          <button 
            type="submit" 
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-600/20"
          >
            Unlock Command Center
          </button>
        </form>
      </div>
    </div>
  );
}
