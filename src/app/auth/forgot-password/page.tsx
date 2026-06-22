"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import { Mail, ArrowRight, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || isLoading) return;
    setIsLoading(true);
    setError(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/update-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setIsSent(true);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-[100dvh] w-full bg-[#05050A] flex items-center justify-center overflow-hidden relative selection:bg-blue-500/30 px-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-[#05050A] to-[#05050A] pointer-events-none" />
      <div className="absolute w-[800px] max-w-[100vw] h-[800px] bg-blue-500/10 blur-[120px] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-50" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-[0_0_80px_-20px_rgba(59,130,246,0.3)] flex flex-col gap-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-white">Reset Password</h1>
            <p className="text-sm text-gray-400">
              {isSent ? "Check your email for a reset link" : "Enter your email to receive a reset link"}
            </p>
          </div>

          {!isSent ? (
            <form onSubmit={handleResetSubmit} className="flex flex-col gap-4">
              <div className="relative flex items-center">
                <Mail className="absolute left-4 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  disabled={isLoading}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-14 text-white placeholder:text-gray-500 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all disabled:opacity-50"
                />
                <button type="submit" disabled={!email || isLoading} className="absolute right-2 p-2 rounded-lg bg-[var(--color-accent)] hover:bg-blue-400 text-white disabled:opacity-50 transition-colors">
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                </button>
              </div>
              {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            </form>
          ) : (
            <div className="text-center">
              <p className="text-white text-sm mb-6">We have sent a password reset link to {email}</p>
            </div>
          )}

          <div className="flex justify-center">
            <Link href="/auth" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Sign In
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
