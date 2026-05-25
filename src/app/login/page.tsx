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
    <div className="bg-background text-on-surface min-h-screen flex flex-col font-body-md overflow-hidden dark">
      <header className="bg-surface/80 dark:bg-surface-dim/80 backdrop-blur-md text-primary dark:text-primary-fixed-dim docked full-width top-0 sticky z-50 border-b border-outline-variant/30 flat no shadows">
        <div className="flex justify-between items-center w-full px-lg py-md max-w-container-max mx-auto">
          <div className="flex items-center gap-sm">
            <span className="material-symbols-outlined text-primary">hub</span>
            <h1 className="font-headline-md text-headline-md font-bold tracking-tight text-on-surface dark:text-on-surface">Nexus RAG</h1>
          </div>
          <button onClick={() => router.push('/')} className="bg-primary text-on-primary font-label-md text-label-md px-lg py-sm rounded-lg hover:text-secondary transition-colors duration-200 scale-95 active:scale-90 transition-transform">
            Go to Home
          </button>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center relative p-md">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[128px]"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-[128px]"></div>
        </div>

        <div className="auth-container w-full max-w-[440px] relative z-10">
          <div className="glass-panel glow-effect rounded-xl p-xl shadow-2xl flex flex-col gap-lg bg-surface-dim/70 backdrop-blur-xl border border-outline-variant/20">
            
            <div className="flex flex-col gap-xs text-center mb-sm">
              <h2 className="font-headline-md text-headline-md text-on-surface">
                Enterprise Login
              </h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Secure, passwordless authentication.
              </p>
            </div>

            {error && (
              <div className="bg-error-container/20 border border-error-container text-error px-sm py-xs rounded font-body-sm text-center">
                {error}
              </div>
            )}
            
            {successMsg && (
              <div className="bg-primary-container/20 border border-primary-container text-primary-fixed px-sm py-xs rounded font-body-sm text-center">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="flex flex-col gap-md">
              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-label-md text-on-surface-variant px-xs">Email Address</label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-md text-outline text-[20px] pointer-events-none">mail</span>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={otpSent}
                    className="w-full pl-[48px] pr-[100px] py-md bg-surface-container-low border border-outline-variant/30 rounded-lg text-on-surface placeholder:text-outline/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-body-md text-body-md disabled:opacity-50" 
                    placeholder="name@enterprise.com" 
                  />
                  {!otpSent && (
                    <button 
                      type="button"
                      onClick={handleSendOtp}
                      disabled={loading || !email}
                      className="absolute right-sm bg-primary text-on-primary px-sm py-xs rounded-md font-label-md text-label-md hover:bg-primary-container transition-colors disabled:opacity-50 shadow-sm"
                    >
                      {loading ? "Sending..." : "Verify"}
                    </button>
                  )}
                  {otpSent && (
                    <button 
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="absolute right-sm text-secondary px-sm py-xs rounded-md font-label-md text-label-md hover:bg-secondary/10 transition-colors text-xs"
                    >
                      Change
                    </button>
                  )}
                </div>
              </div>

              {otpSent && (
                <div className="flex flex-col gap-xs animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="font-label-md text-label-md text-on-surface-variant px-xs">One-Time Password</label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-md text-outline text-[20px] pointer-events-none">password</span>
                    <input 
                      type="text" 
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                      className="w-full pl-[48px] pr-[110px] py-md bg-surface-container-low border border-outline-variant/30 rounded-lg text-on-surface placeholder:text-outline/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-mono-code text-headline-sm tracking-[0.5em]" 
                      placeholder="••••••••" 
                      maxLength={8}
                    />
                    <button 
                      type="submit"
                      disabled={loading || otp.length < 6}
                      className="absolute right-sm bg-secondary text-on-secondary px-sm py-xs rounded-md font-label-md text-label-md hover:brightness-110 transition-colors disabled:opacity-50 shadow-sm"
                    >
                      {loading ? "Checking..." : "Submit"}
                    </button>
                  </div>
                </div>
              )}

              {/* Turnstile Captcha Widget */}
              <div className="flex justify-center mt-xs">
                <Turnstile 
                  siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'} 
                  onSuccess={(token) => setCaptchaToken(token)}
                  options={{ theme: 'dark' }}
                />
              </div>
            </form>

            <div className="flex items-center gap-md mt-sm">
              <div className="h-px flex-grow bg-outline-variant/20"></div>
              <span className="font-label-md text-label-md text-outline">OR CONTINUE WITH</span>
              <div className="h-px flex-grow bg-outline-variant/20"></div>
            </div>

            <div className="grid grid-cols-2 gap-md">
              <button onClick={() => handleOAuth('google')} className="flex items-center justify-center gap-sm py-sm px-md bg-surface-container-high border border-outline-variant/30 rounded-lg font-label-md text-label-md text-on-surface hover:bg-surface-container-highest transition-all active:scale-95">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="currentColor"></path>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="currentColor"></path>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="currentColor"></path>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="currentColor"></path>
                </svg>
                Google
              </button>
              <button onClick={() => handleOAuth('github')} className="flex items-center justify-center gap-sm py-sm px-md bg-surface-container-high border border-outline-variant/30 rounded-lg font-label-md text-label-md text-on-surface hover:bg-surface-container-highest transition-all active:scale-95">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" fill="currentColor"></path>
                </svg>
                GitHub
              </button>
            </div>

            <div className="flex justify-center text-body-sm text-on-surface-variant mt-md">
              <p>Protected by Enterprise Grade AES-256 Encryption.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
