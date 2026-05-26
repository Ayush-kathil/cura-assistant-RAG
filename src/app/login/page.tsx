"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Turnstile } from '@marsidev/react-turnstile';

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const router = useRouter();

  const supabase = createClient();

  const handleSendOtp = async () => {
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    
    if (!captchaToken) {
      setError("Please complete the security check.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({ 
        email,
        options: {
          shouldCreateUser: true,
          captchaToken,
        }
      });
      
      if (error) throw error;
      
      setOtpSent(true);
      setSuccessMsg("Verification code sent! Please check your email.");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;
    
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email'
      });
      
      if (error) throw error;
      
      router.push("/workspace");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'github') => {
    if (!captchaToken) {
      setError("Please complete the security check before logging in with " + provider + ".");
      return;
    }
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        captchaToken,
      }
    });
  };

  return (
    <div className="bg-[#FAFCFF] min-h-screen flex flex-col font-sans overflow-hidden text-slate-900">
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100 shadow-sm">
        <div className="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <img src="/mobile-assets/curio.png" alt="Curio AI" className="w-8 h-8 object-cover rounded-full" />
            <h1 className="font-bold text-xl tracking-tight text-slate-900">Curio AI</h1>
          </div>
          <button onClick={() => router.push('/')} className="bg-slate-100 text-slate-700 font-bold text-sm px-6 py-2 rounded-full hover:bg-slate-200 transition-colors duration-200 active:scale-95">
            Go Home
          </button>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center relative p-6">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-100 rounded-full blur-[100px] animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-50 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="w-full max-w-[440px] relative z-10 px-4 sm:px-0">
          <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-[0_10px_40px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col gap-6">
            
            <div className="flex flex-col gap-2 text-center mb-4">
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                Welcome back
              </h2>
              <p className="text-sm text-slate-500 font-medium">
                Log in or sign up to continue to Curio.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium text-center">
                {error}
              </div>
            )}
            
            {successMsg && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm font-medium text-center">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-700 px-1">Email Address</label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-4 text-slate-400 text-[20px] pointer-events-none">mail</span>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={otpSent}
                    className="w-full pl-12 pr-24 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium disabled:opacity-50" 
                    placeholder="name@example.com" 
                  />
                  {!otpSent && (
                    <button 
                      type="button"
                      onClick={handleSendOtp}
                      disabled={loading || !email}
                      className="absolute right-1.5 bg-blue-500 text-white px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-blue-600 transition-colors disabled:opacity-50 shadow-sm"
                    >
                      {loading ? "..." : "Verify"}
                    </button>
                  )}
                  {otpSent && (
                    <button 
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="absolute right-1.5 text-blue-500 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-50 transition-colors"
                    >
                      Change
                    </button>
                  )}
                </div>
              </div>

              {otpSent && (
                <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="text-sm font-bold text-slate-700 px-1">One-Time Password</label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-4 text-slate-400 text-[20px] pointer-events-none">password</span>
                    <input 
                      type="text" 
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                      className="w-full pl-12 pr-28 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono tracking-[0.5em] font-bold" 
                      placeholder="••••••••" 
                      maxLength={8}
                    />
                    <button 
                      type="submit"
                      disabled={loading || otp.length < 6}
                      className="absolute right-1.5 bg-slate-900 text-white px-5 py-1.5 rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors disabled:opacity-50 shadow-sm"
                    >
                      {loading ? "..." : "Submit"}
                    </button>
                  </div>
                </div>
              )}

              {/* Turnstile Captcha Widget */}
              <div className="flex justify-center mt-2">
                <Turnstile 
                  siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'} 
                  onSuccess={(token) => setCaptchaToken(token)}
                  options={{ theme: 'light' }}
                />
              </div>
            </form>

            <div className="flex items-center gap-4 mt-2">
              <div className="h-px flex-grow bg-slate-100"></div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">or continue with</span>
              <div className="h-px flex-grow bg-slate-100"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button onClick={() => handleOAuth('google')} className="flex items-center justify-center gap-3 py-3 px-4 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all active:scale-95 shadow-sm">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335"></path>
                </svg>
                Google
              </button>
              <button onClick={() => handleOAuth('github')} className="flex items-center justify-center gap-3 py-3 px-4 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all active:scale-95 shadow-sm">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" fill="#111"></path>
                </svg>
                GitHub
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
