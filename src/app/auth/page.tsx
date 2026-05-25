"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import { Mail, ArrowRight, Loader2, KeyRound } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const handleOAuth = async (provider: 'google' | 'azure') => {
    setIsLoading(true);
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || isLoading) return;
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
    });
    if (!error) {
      setIsOtpSent(true);
    }
    setIsLoading(false);
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim() || isLoading) return;
    setIsLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: otp.trim(),
      type: "email",
    });
    if (!error) {
      router.push("/workspace");
    } else {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#05050A] flex items-center justify-center overflow-hidden relative selection:bg-blue-500/30">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-[#05050A] to-[#05050A] pointer-events-none" />
      <div className="absolute w-[800px] h-[800px] bg-blue-500/10 blur-[120px] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-50" />

      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-[0_0_80px_-20px_rgba(59,130,246,0.3)] flex flex-col gap-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-white">Welcome to Cura</h1>
            <p className="text-sm text-gray-400">Intelligent Document Workspace</p>
          </div>

          <div className="flex flex-col gap-4">
            <button
              onClick={() => handleOAuth('google')}
              disabled={isLoading}
              className="w-full relative flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-black px-4 py-3 rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            <button
              onClick={() => handleOAuth('azure')}
              disabled={isLoading}
              className="w-full relative flex items-center justify-center gap-3 bg-[#2F2F2F] hover:bg-[#3F3F3F] text-white px-4 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 border border-white/5"
            >
              <svg className="w-5 h-5" viewBox="0 0 21 21">
                <path fill="#f25022" d="M0 0h10v10H0z"/>
                <path fill="#7fba00" d="M11 0h10v10H11z"/>
                <path fill="#00a4ef" d="M0 11h10v10H0z"/>
                <path fill="#ffb900" d="M11 11h10v10H11z"/>
              </svg>
              Continue with Microsoft
            </button>
          </div>

          <div className="relative flex items-center">
            <div className="flex-grow border-t border-white/10" />
            <span className="flex-shrink-0 mx-4 text-xs font-medium text-gray-500 uppercase tracking-widest">Or</span>
            <div className="flex-grow border-t border-white/10" />
          </div>

          <div className="relative h-[60px]">
            <AnimatePresence mode="wait">
              {!isOtpSent ? (
                <motion.form
                  key="email-form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleEmailSubmit}
                  className="absolute inset-0 w-full"
                >
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
                </motion.form>
              ) : (
                <motion.form
                  key="otp-form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleOtpSubmit}
                  className="absolute inset-0 w-full"
                >
                  <div className="relative flex items-center">
                    <KeyRound className="absolute left-4 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000"
                      disabled={isLoading}
                      className="w-full bg-black/40 border border-[var(--color-accent)] rounded-xl py-3 pl-12 pr-14 text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all tracking-[0.5em] font-mono disabled:opacity-50"
                    />
                    <button type="submit" disabled={otp.length !== 6 || isLoading} className="absolute right-2 p-2 rounded-lg bg-[var(--color-accent)] hover:bg-blue-400 text-white disabled:opacity-50 transition-colors">
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
