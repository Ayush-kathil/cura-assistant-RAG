"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import { KeyRound, ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim() || isLoading) return;
    setIsLoading(true);
    setError(null);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setIsLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#05050A] flex items-center justify-center overflow-hidden relative selection:bg-blue-500/30 px-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-[#05050A] to-[#05050A] pointer-events-none" />
      <div className="absolute w-[800px] h-[800px] bg-blue-500/10 blur-[120px] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-50" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-[0_0_80px_-20px_rgba(59,130,246,0.3)] flex flex-col gap-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-white">Set New Password</h1>
            <p className="text-sm text-gray-400">Please enter your new password</p>
          </div>

          <form onSubmit={handleUpdateSubmit} className="flex flex-col gap-4">
            <div className="relative flex items-center">
              <KeyRound className="absolute left-4 w-5 h-5 text-gray-400" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New password"
                disabled={isLoading}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-14 text-white placeholder:text-gray-500 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all disabled:opacity-50"
              />
              <button type="submit" disabled={!password || isLoading} className="absolute right-2 p-2 rounded-lg bg-[var(--color-accent)] hover:bg-blue-400 text-white disabled:opacity-50 transition-colors">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          </form>
        </div>
      </motion.div>
    </div>
  );
}
