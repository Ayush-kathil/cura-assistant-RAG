"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Turnstile } from '@marsidev/react-turnstile';
import Link from "next/link";

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<'login' | 'signup' | 'forgot_password'>('login');
  
  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  
  const router = useRouter();
  const supabase = createClient();

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
          captchaToken: captchaToken || undefined
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
        redirectTo: `${window.location.origin}/auth/update-password`,
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

  const handleOAuth = async (provider: 'google' | 'github') => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
  };

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex items-center justify-center p-4 md:p-10 relative overflow-hidden"
         style={{
           backgroundColor: '#f9f9ff',
           backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(135, 206, 235, 0.15) 1px, transparent 0)',
           backgroundSize: '40px 40px'
         }}>
      
      {/* Atmospheric Animated Background */}
      <div id="bg-container" className="absolute inset-0 z-0 opacity-40 pointer-events-none"></div>

      {/* Main Container */}
      <main className="relative z-10 w-full max-w-[1100px] grid md:grid-cols-2 gap-8 items-stretch min-h-[680px]">
        
        {/* Left Side: Illustrative & Branding */}
        <div className="hidden md:flex flex-col justify-between p-12 bg-primary-container/20 rounded-lg border border-white/40 glass-card relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <span className="material-symbols-outlined text-white" style={{fontVariationSettings: "'FILL' 1"}}>psychology</span>
              </div>
              <span className="font-headline-md text-headline-md text-primary tracking-tight">Cura</span>
            </div>
            
            <h1 className="font-headline-lg text-headline-lg text-primary mb-6 leading-tight">
                Your journey to <br/><span className="text-secondary">mental clarity</span> starts here.
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-[320px]">
                Experience a companion that listens, understands, and grows with you through every mood.
            </p>
          </div>
          
          <div className="relative z-10 mt-12 bg-white/40 p-6 rounded-lg border border-white/60">
            <div className="flex gap-2 mb-4">
              <span className="material-symbols-outlined text-secondary" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
              <span className="material-symbols-outlined text-secondary" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
              <span className="material-symbols-outlined text-secondary" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
              <span className="material-symbols-outlined text-secondary" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
              <span className="material-symbols-outlined text-secondary" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
            </div>
            <p className="italic text-on-surface-variant font-body-md mb-2">"Cura has helped me navigate through my most stressful weeks with grace and empathy."</p>
            <span className="text-label-md font-label-md text-primary">— Sarah J., Member since 2023</span>
          </div>

          <div className="absolute bottom-[-10%] right-[-10%] w-[300px] h-[300px] bg-secondary-container/30 rounded-full blur-[80px]"></div>
          <div className="absolute top-[20%] right-[-5%] w-[150px] h-[150px] bg-primary/10 rounded-full blur-[40px]"></div>
        </div>

        {/* Right Side: Interaction (Forms) */}
        <div className="bg-surface-container-lowest rounded-lg shadow-[0_20px_40px_rgba(12,103,128,0.08)] p-8 md:p-12 flex flex-col justify-center border border-white/60 relative z-10 bg-white">
          
          {/* Mobile Brand Logo */}
          <div className="md:hidden flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[20px]" style={{fontVariationSettings: "'FILL' 1"}}>psychology</span>
            </div>
            <span className="font-headline-md text-headline-md text-primary">Cura</span>
          </div>

          {/* Tab Switcher */}
          {activeTab !== 'forgot_password' && (
            <div className="flex bg-surface-container-low p-1 rounded-full mb-8 w-fit mx-auto md:mx-0 bg-gray-100">
            <button 
              className={`px-8 py-2.5 rounded-full text-label-md transition-all duration-300 ${activeTab === 'login' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-primary text-gray-500'}`}
              onClick={() => { setActiveTab('login'); setError(null); setSuccessMsg(null); }}
            >
                Login
            </button>
            <button 
              className={`px-8 py-2.5 rounded-full text-label-md transition-all duration-300 ${activeTab === 'signup' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-primary text-gray-500'}`}
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
              <header className="mb-8">
                <h2 className="font-headline-md text-headline-md text-on-background mb-2">Welcome Back</h2>
                <p className="text-on-surface-variant text-gray-500">Please enter your details to continue your session.</p>
              </header>
              <form className="space-y-5" onSubmit={handleLogin}>
                <div className="space-y-2">
                  <label className="text-label-sm font-label-sm text-on-surface-variant ml-4 text-gray-600">Email Address</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-6 py-4 rounded-full bg-surface border-none ring-1 ring-outline-variant/30 focus:ring-2 focus:ring-primary-container outline-none transition-all shadow-[inset_0_2px_4px_rgba(12,103,128,0.03)] bg-gray-50" 
                    placeholder="hello@cura.ai" 
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center px-4">
                    <label className="text-label-sm font-label-sm text-on-surface-variant text-gray-600">Password</label>
                    <button type="button" onClick={() => { setActiveTab('forgot_password'); setError(null); setSuccessMsg(null); }} className="text-label-sm font-label-sm text-primary hover:underline">Forgot?</button>
                  </div>
                  <input 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-6 py-4 rounded-full bg-surface border-none ring-1 ring-outline-variant/30 focus:ring-2 focus:ring-primary-container outline-none transition-all shadow-[inset_0_2px_4px_rgba(12,103,128,0.03)] bg-gray-50" 
                    placeholder="••••••••" 
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
                    {loading ? "..." : "Login to Account"}
                </button>
              </form>
            </div>
          )}

          {/* Signup Form */}
          {activeTab === 'signup' && (
            <div className="animate-in fade-in duration-300">
              <header className="mb-8">
                <h2 className="font-headline-md text-headline-md text-on-background mb-2">Create Account</h2>
                <p className="text-on-surface-variant text-gray-500">Start your personal wellness journey today.</p>
              </header>
              <form className="space-y-4" onSubmit={handleSignup}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-label-sm font-label-sm text-on-surface-variant ml-4 text-gray-600">First Name</label>
                    <input 
                      type="text" 
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      className="w-full px-6 py-3 rounded-full bg-surface border-none ring-1 ring-outline-variant/30 focus:ring-2 focus:ring-primary-container outline-none transition-all shadow-[inset_0_2px_4px_rgba(12,103,128,0.03)] bg-gray-50" 
                      placeholder="Sarah" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-label-sm font-label-sm text-on-surface-variant ml-4 text-gray-600">Last Name</label>
                    <input 
                      type="text" 
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      className="w-full px-6 py-3 rounded-full bg-surface border-none ring-1 ring-outline-variant/30 focus:ring-2 focus:ring-primary-container outline-none transition-all shadow-[inset_0_2px_4px_rgba(12,103,128,0.03)] bg-gray-50" 
                      placeholder="Jones" 
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-label-sm font-label-sm text-on-surface-variant ml-4 text-gray-600">Email Address</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-6 py-3 rounded-full bg-surface border-none ring-1 ring-outline-variant/30 focus:ring-2 focus:ring-primary-container outline-none transition-all shadow-[inset_0_2px_4px_rgba(12,103,128,0.03)] bg-gray-50" 
                    placeholder="sarah@example.com" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-label-sm font-label-sm text-on-surface-variant ml-4 text-gray-600">Choose Password</label>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-6 py-3 rounded-full bg-surface border-none ring-1 ring-outline-variant/30 focus:ring-2 focus:ring-primary-container outline-none transition-all shadow-[inset_0_2px_4px_rgba(12,103,128,0.03)] bg-gray-50" 
                    placeholder="Min. 8 characters" 
                  />
                </div>
                
                {/* Cloudflare Turnstile */}
                <div className="flex justify-center mt-2">
                  <Turnstile
                    siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"}
                    onSuccess={(token) => setCaptchaToken(token)}
                  />
                </div>

                <p className="text-[12px] text-on-tertiary-fixed-variant px-4 leading-relaxed text-gray-500">
                    By clicking sign up, you agree to our <a className="text-primary underline" href="#">Privacy Policy</a> and <a className="text-primary underline" href="#">Terms of Service</a>.
                </p>
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-full bg-primary text-white font-label-md shadow-lg shadow-primary/20 hover:bg-on-primary-container hover:scale-[1.01] active:scale-95 transition-all mt-4 disabled:opacity-50"
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
                <button type="button" onClick={() => { setActiveTab('login'); setError(null); setSuccessMsg(null); }} className="text-label-sm font-label-sm text-primary hover:underline mb-4 inline-block">&larr; Back to Login</button>
                <h2 className="font-headline-md text-headline-md text-on-background mb-2">Reset Password</h2>
                <p className="text-on-surface-variant text-gray-500">Enter your email and we'll send you a link to reset your password.</p>
              </header>
              <form className="space-y-5" onSubmit={handleResetPassword}>
                <div className="space-y-2">
                  <label className="text-label-sm font-label-sm text-on-surface-variant ml-4 text-gray-600">Email Address</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-6 py-4 rounded-full bg-surface border-none ring-1 ring-outline-variant/30 focus:ring-2 focus:ring-primary-container outline-none transition-all shadow-[inset_0_2px_4px_rgba(12,103,128,0.03)] bg-gray-50" 
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

          {activeTab !== 'forgot_password' && (
            <>
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                <div className="relative flex justify-center text-label-sm uppercase"><span className="bg-white px-4 text-gray-400">Or continue with</span></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => handleOAuth('google')}
              className="flex items-center justify-center gap-3 py-3 px-4 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <img alt="Google" className="w-4 h-4" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDlhLQDXd8w65k6DcdG8b8ZJJieVQKUQT1LSGAkTDu9JArZZmlye3AOIu62GcEtsOu_g42OP93baM9XJ5gb7NaqChIZKcBhGLiRIqLE9FGSyhjHG2sZ-yOFLQSbB27-8BrBuXsGOZkbkQowZoE7tQzcYHAWVZuCoN0gLRkWo-QV77KKBINWNVnD10FuJEOWrfIBHFiOYyGb2vfrbz0iWBgpVz8tMGzS2Ugckax7vdIduLY2SE2-6rjOsDt_7USzOxU3xUKgeEsEIMCD"/>
              <span className="text-label-sm font-bold text-gray-600">Google</span>
            </button>
            <button 
              onClick={() => handleOAuth('github')}
              className="flex items-center justify-center gap-3 py-3 px-4 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <img alt="GitHub" className="w-4 h-4" src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" />
              <span className="text-label-sm font-bold text-gray-600">GitHub</span>
            </button>
          </div>
          </>
          )}

        </div>
      </main>
    </div>
  );
}
