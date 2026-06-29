"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Turnstile } from '@marsidev/react-turnstile';
import Link from "next/link";
import { Scene3D } from "@/components/animations/Scene3D";

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<'login' | 'signup' | 'forgot_password' | 'update_password'>('login');
  
  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('mode') === 'update_password') {
        setActiveTab('update_password');
      }
    }
  }, []);

  useEffect(() => {
    // Background floating bubbles animation
    const createAtmosphericBubble = () => {
      const bubble = document.createElement('div');
      const size = Math.random() * 150 + 50;
      bubble.style.width = `${size}px`;
      bubble.style.height = `${size}px`;
      bubble.style.left = `${Math.random() * 100}%`;
      bubble.style.top = `${Math.random() * 100}%`;
      bubble.style.background = 'radial-gradient(circle, rgba(135,206,235,0.15) 0%, rgba(135,206,235,0) 70%)';
      bubble.style.borderRadius = '50%';
      bubble.style.position = 'absolute';
      bubble.style.zIndex = '0';
      bubble.style.filter = 'blur(30px)';
      bubble.className = 'animate-pulse pointer-events-none';
      
      const container = document.getElementById('bg-container');
      if (container) container.appendChild(bubble);

      let posX = parseFloat(bubble.style.left);
      let posY = parseFloat(bubble.style.top);
      let velX = (Math.random() - 0.5) * 0.02;
      let velY = (Math.random() - 0.5) * 0.02;

      const animate = () => {
        posX += velX;
        posY += velY;
        if(posX < 0 || posX > 100) velX *= -1;
        if(posY < 0 || posY > 100) velY *= -1;
        bubble.style.left = `${posX}%`;
        bubble.style.top = `${posY}%`;
        requestAnimationFrame(animate);
      };
      animate();
    };

    for(let i=0; i<6; i++) {
      createAtmosphericBubble();
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: { captchaToken: captchaToken || undefined }
      });
      if (error) throw error;
      router.push("/workspace");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName
          },
          captchaToken: captchaToken || undefined,
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });
      if (error) throw error;
      setSuccessMsg("Account created! You can now log in.");
      setActiveTab('login');
      setPassword('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/login?mode=update_password`,
        captchaToken: captchaToken || undefined
      });
      if (error) throw error;
      setSuccessMsg("Check your email for the password reset link.");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccessMsg("Password updated successfully! You can now log in.");
      setActiveTab('login');
      setPassword('');
      window.history.replaceState({}, '', '/login');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'github') => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
  };

  return (
    <div className="bg-slate-50 text-slate-800 font-sans min-h-[100dvh] flex items-center justify-center p-4 md:p-10 relative overflow-hidden"
         style={{
           backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(59, 130, 246, 0.05) 1px, transparent 0)',
           backgroundSize: '40px 40px'
         }}>
      
      {/* Atmospheric Animated Background */}
      <div id="bg-container" className="absolute inset-0 z-0 opacity-20 pointer-events-none"></div>

      {/* Main Container */}
      <main className="relative z-10 w-full max-w-[1100px] grid md:grid-cols-2 gap-8 items-stretch min-h-[auto] md:min-h-[680px]">
        
        {/* Left Side: Illustrative & Branding */}
        <div className="hidden md:flex flex-col justify-between p-12 bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200 shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.4)]">
                <span className="material-symbols-outlined text-white" style={{fontVariationSettings: "'FILL' 1"}}>psychology</span>
              </div>
              <span className="text-2xl font-medium tracking-tight text-slate-900">Cura</span>
            </div>
            
            {/* 3D Bot replacing the text */}
            <div className="w-full h-[320px] relative -ml-4 pointer-events-none">
              <Scene3D isSplashActive={false} />
            </div>
          </div>
          
          <div className="relative z-10 mt-auto bg-slate-50/80 backdrop-blur-sm p-8 rounded-2xl border border-slate-200 shadow-sm">
            <h1 className="text-2xl md:text-3xl font-light tracking-tight text-slate-900 mb-4 leading-tight">
                Meet your new <br/><span className="text-blue-600 font-normal">AI companion</span>.
            </h1>
            <p className="text-base text-slate-500 font-light leading-relaxed">
                Chat, learn, and explore ideas with an intelligent assistant designed to help you accomplish more every day.
            </p>
          </div>

          <div className="absolute bottom-[-10%] right-[-10%] w-[80vw] max-w-[300px] h-[80vw] max-h-[300px] bg-blue-600/10 rounded-full blur-[80px]"></div>
          <div className="absolute top-[20%] right-[-5%] w-[40vw] max-w-[150px] h-[40vw] max-h-[150px] bg-indigo-500/10 rounded-full blur-[40px]"></div>
        </div>

        {/* Right Side: Interaction (Forms) */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-12 flex flex-col justify-center border border-slate-200 relative z-10">
          
          {/* Mobile Brand Logo */}
          <div className="md:hidden flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[20px]" style={{fontVariationSettings: "'FILL' 1"}}>psychology</span>
            </div>
            <span className="text-xl font-medium tracking-tight text-slate-900">Cura</span>
          </div>

          {/* Tab Switcher */}
          {activeTab !== 'forgot_password' && activeTab !== 'update_password' && (
            <div className="flex bg-slate-100 p-1 rounded-full mb-8 w-fit mx-auto md:mx-0">
            <button 
              className={`px-8 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${activeTab === 'login' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-800'}`}
              onClick={() => { setActiveTab('login'); setError(null); setSuccessMsg(null); }}
            >
                Login
            </button>
            <button 
              className={`px-8 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${activeTab === 'signup' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-800'}`}
              onClick={() => { setActiveTab('signup'); setError(null); setSuccessMsg(null); }}
            >
                Sign Up
            </button>
          </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium text-center mb-4">
              {error}
            </div>
          )}
          {successMsg && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm font-medium text-center mb-4">
              {successMsg}
            </div>
          )}

          {/* Login Form */}
          {activeTab === 'login' && (
            <div className="animate-in fade-in duration-300">
              <header className="mb-6">
                <h2 className="text-2xl font-light text-slate-900 tracking-tight mb-2">Welcome Back</h2>
                <p className="text-slate-500 font-light">Please enter your details to continue your session.</p>
              </header>
              <form className="space-y-4" onSubmit={handleLogin}>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-500 ml-4 uppercase tracking-wider">Email Address</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-6 py-4 rounded-full bg-slate-50 border border-slate-200 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-slate-400" 
                    placeholder="hello@cura.ai" 
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center px-4">
                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Password</label>
                    <button type="button" onClick={() => { setActiveTab('forgot_password'); setError(null); setSuccessMsg(null); }} className="text-xs font-medium text-blue-600 hover:text-blue-500">Forgot?</button>
                  </div>
                  <input 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-6 py-4 rounded-full bg-slate-50 border border-slate-200 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-slate-400" 
                    placeholder="••••••••" 
                  />
                </div>
                
                {/* Cloudflare Turnstile */}
                <div className="flex justify-center mt-2 min-h-[65px]">
                  <Turnstile
                    siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"}
                    onSuccess={(token) => setCaptchaToken(token)}
                  />
                </div>

                <div className="flex items-start gap-3 mt-4 mb-4">
                  <input 
                    type="checkbox" 
                    id="terms-login" 
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-slate-300 bg-white text-blue-600 focus:ring-blue-500 focus:ring-offset-white"
                  />
                  <label htmlFor="terms-login" className="text-sm text-slate-500 leading-tight">
                    I agree to the <Link href="/terms" className="text-slate-800 font-medium hover:text-blue-600">Terms & Conditions</Link> and <Link href="/terms" className="text-slate-800 font-medium hover:text-blue-600">Privacy Policy</Link>.
                  </label>
                </div>
                <button 
                  type="submit"
                  disabled={loading || !termsAccepted}
                  className="w-full py-4 rounded-full bg-blue-600 text-white font-medium shadow-lg shadow-blue-500/20 hover:bg-blue-500 hover:scale-[1.02] active:scale-95 transition-all mt-4 disabled:opacity-50"
                >
                    {loading ? "..." : "Login to Account"}
                </button>
              </form>
            </div>
          )}

          {/* Signup Form */}
          {activeTab === 'signup' && (
            <div className="animate-in fade-in duration-300">
              <header className="mb-6">
                <h2 className="text-2xl font-light text-slate-900 tracking-tight mb-2">Create Account</h2>
                <p className="text-slate-500 font-light">Start your personal wellness journey today.</p>
              </header>
              <form className="space-y-3" onSubmit={handleSignup}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-500 ml-4 uppercase tracking-wider">First Name</label>
                    <input 
                      type="text" 
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      className="w-full px-6 py-3 rounded-full bg-slate-50 border border-slate-200 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-slate-400" 
                      placeholder="Sarah" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-500 ml-4 uppercase tracking-wider">Last Name</label>
                    <input 
                      type="text" 
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      className="w-full px-6 py-3 rounded-full bg-slate-50 border border-slate-200 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-slate-400" 
                      placeholder="Jones" 
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-500 ml-4 uppercase tracking-wider">Email Address</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-6 py-3 rounded-full bg-slate-50 border border-slate-200 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-slate-400" 
                    placeholder="sarah@example.com" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-500 ml-4 uppercase tracking-wider">Choose Password</label>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-6 py-3 rounded-full bg-slate-50 border border-slate-200 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-slate-400" 
                    placeholder="Min. 8 characters" 
                  />
                </div>
                
                {/* Cloudflare Turnstile */}
                <div className="flex justify-center mt-2 min-h-[65px]">
                  <Turnstile
                    siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"}
                    onSuccess={(token) => setCaptchaToken(token)}
                  />
                </div>

                <p className="text-xs text-slate-500 px-4 leading-relaxed hidden">
                    By clicking sign up, you agree to our <Link className="text-blue-600 hover:text-blue-700" href="/privacy">Privacy Policy</Link> and <Link className="text-blue-600 hover:text-blue-700" href="/terms">Terms of Service</Link>.
                </p>
                <div className="flex items-start gap-3 mt-4 mb-4">
                  <input 
                    type="checkbox" 
                    id="terms-signup" 
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-slate-300 bg-white text-blue-600 focus:ring-blue-500 focus:ring-offset-white"
                  />
                  <label htmlFor="terms-signup" className="text-sm text-slate-500 leading-tight">
                    I agree to the <Link href="/terms" className="text-slate-800 font-medium hover:text-blue-600">Terms & Conditions</Link> and <Link href="/terms" className="text-slate-800 font-medium hover:text-blue-600">Privacy Policy</Link>.
                  </label>
                </div>
                <button 
                  type="submit"
                  disabled={loading || !termsAccepted}
                  className="w-full py-4 rounded-full bg-blue-600 text-white font-medium shadow-lg shadow-blue-500/20 hover:bg-blue-500 hover:scale-[1.02] active:scale-95 transition-all mt-4 disabled:opacity-50"
                >
                    {loading ? "..." : "Get Started Free"}
                </button>
              </form>
            </div>
          )}

          {/* Forgot Password Form */}
          {activeTab === 'forgot_password' && (
            <div className="animate-in fade-in duration-300">
              <header className="mb-8">
                <button type="button" onClick={() => { setActiveTab('login'); setError(null); setSuccessMsg(null); }} className="text-xs font-medium text-blue-600 hover:underline mb-4 inline-block">&larr; Back to Login</button>
                <h2 className="text-2xl font-light text-slate-900 tracking-tight mb-2">Reset Password</h2>
                <p className="text-slate-500 font-light">Enter your email and we'll send you a link to reset your password.</p>
              </header>
              <form className="space-y-5" onSubmit={handleResetPassword}>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-500 ml-4 uppercase tracking-wider">Email Address</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-6 py-4 rounded-full bg-slate-50 border border-slate-200 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-slate-400" 
                    placeholder="hello@cura.ai" 
                  />
                </div>
                
                {/* Cloudflare Turnstile */}
                <div className="flex justify-center mt-2">
                  <Turnstile
                    siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"}
                    onSuccess={(token) => setCaptchaToken(token)}
                  />
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-full bg-primary text-white font-label-md shadow-lg shadow-primary/20 hover:bg-on-primary-container hover:scale-[1.01] active:scale-95 transition-all mt-4 disabled:opacity-50"
                >
                    {loading ? "..." : "Send Reset Link"}
                </button>
              </form>
            </div>
          )}

          {/* Update Password Form */}
          {activeTab === 'update_password' && (
            <div className="animate-in fade-in duration-300">
              <header className="mb-8">
                <h2 className="text-2xl font-light text-slate-900 tracking-tight mb-2">Set New Password</h2>
                <p className="text-slate-500 font-light">Please enter your new password.</p>
              </header>
              <form className="space-y-5" onSubmit={handleUpdatePassword}>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-500 ml-4 uppercase tracking-wider">New Password</label>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-6 py-4 rounded-full bg-slate-50 border border-slate-200 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-slate-400" 
                    placeholder="Min. 6 characters" 
                  />
                </div>
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-full bg-primary text-white font-label-md shadow-lg shadow-primary/20 hover:bg-on-primary-container hover:scale-[1.01] active:scale-95 transition-all mt-4 disabled:opacity-50"
                >
                    {loading ? "..." : "Update Password"}
                </button>
              </form>
            </div>
          )}

          {activeTab !== 'forgot_password' && activeTab !== 'update_password' && (
            <>
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                <div className="relative flex justify-center text-xs uppercase tracking-wider"><span className="bg-white px-4 text-slate-400">Or continue with</span></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => handleOAuth('google')}
              className="flex items-center justify-center gap-3 py-3 px-4 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors"
            >
              <img alt="Google" className="w-4 h-4" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDlhLQDXd8w65k6DcdG8b8ZJJieVQKUQT1LSGAkTDu9JArZZmlye3AOIu62GcEtsOu_g42OP93baM9XJ5gb7NaqChIZKcBhGLiRIqLE9FGSyhjHG2sZ-yOFLQSbB27-8BrBuXsGOZkbkQowZoE7tQzcYHAWVZuCoN0gLRkWo-QV77KKBINWNVnD10FuJEOWrfIBHFiOYyGb2vfrbz0iWBgpVz8tMGzS2Ugckax7vdIduLY2SE2-6rjOsDt_7USzOxU3xUKgeEsEIMCD"/>
              <span className="text-sm font-medium text-slate-700">Google</span>
            </button>
            <button 
              onClick={() => handleOAuth('github')}
              className="flex items-center justify-center gap-3 py-3 px-4 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors"
            >
              <img alt="GitHub" className="w-4 h-4" src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" />
              <span className="text-sm font-medium text-slate-700">GitHub</span>
            </button>
          </div>
          </>
          )}

        </div>
      </main>
    </div>
  );
}
