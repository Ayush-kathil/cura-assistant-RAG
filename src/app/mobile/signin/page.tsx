"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function MobileSignIn() {
  const [isDark, setIsDark] = useState(true);

  return (
    <div className={`${isDark ? 'dark' : ''} h-full overflow-y-auto overflow-x-hidden`}>
      <div className="bg-background text-on-background min-h-full flex flex-col font-body-md overflow-x-hidden transition-colors duration-200">
        {/* Top Navigation Bar */}
        <header className="bg-surface/80 dark:bg-surface-dim/80 backdrop-blur-md sticky top-0 z-50 border-b border-outline-variant/30 px-lg py-md flex justify-between items-center w-full">
          <div className="flex items-center gap-sm">
            <span className="material-symbols-outlined text-primary font-headline-md" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>hub</span>
            <span className="font-headline-md text-headline-md font-bold tracking-tight text-on-surface">Nexus RAG</span>
          </div>
          <button 
            onClick={() => setIsDark(!isDark)}
            className="p-sm rounded-full hover:bg-surface-container-high transition-colors text-on-surface-variant flex items-center justify-center"
          >
            <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>
              {isDark ? 'light_mode' : 'dark_mode'}
            </span>
          </button>
        </header>

        {/* Main Content Area */}
        <main className="flex-grow flex items-center justify-center px-md py-xl relative">
          {/* Background Ambient Glow */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full"></div>
            <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-secondary/10 blur-[120px] rounded-full"></div>
          </div>

          {/* Auth Card */}
          <div className="w-full max-w-[400px] backdrop-blur-[12px] bg-[rgba(14,19,30,0.8)] border border-outline-variant/20 rounded-xl shadow-2xl p-lg flex flex-col gap-lg z-10">
            
            {/* Header Section */}
            <div className="text-center space-y-xs">
              <h1 className="font-headline-md text-headline-md text-on-surface">Welcome Back</h1>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Access your intelligence engine</p>
            </div>

            {/* Form Section */}
            <form className="flex flex-col gap-md" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-xs group">
                <label className="font-label-md text-label-md text-on-surface-variant px-xs transition-colors group-focus-within:text-primary">Email Address</label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-md text-outline text-[20px] group-focus-within:text-primary transition-colors" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>mail</span>
                  <input className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg py-md pl-xl pr-md text-body-md text-on-surface focus:outline-none focus:border-primary transition-all placeholder:text-outline/50" placeholder="name@company.com" type="email" />
                </div>
              </div>

              <div className="space-y-xs group">
                <div className="flex justify-between items-center px-xs">
                  <label className="font-label-md text-label-md text-on-surface-variant transition-colors group-focus-within:text-primary">Password</label>
                  <a className="font-label-md text-label-md text-primary hover:text-secondary transition-colors" href="#">Forgot Password?</a>
                </div>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-md text-outline text-[20px] group-focus-within:text-primary transition-colors" style={{fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24"}}>lock</span>
                  <input className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg py-md pl-xl pr-md text-body-md text-on-surface focus:outline-none focus:border-primary transition-all placeholder:text-outline/50" placeholder="••••••••" type="password" />
                </div>
              </div>

              <Link href="/mobile/home" className="block w-full">
                <button type="button" className="w-full bg-primary text-on-primary font-label-md text-label-md py-md rounded-lg active:scale-[0.98] transition-transform font-bold mt-sm">
                    Sign In
                </button>
              </Link>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-md">
              <div className="h-[1px] flex-grow bg-outline-variant/30"></div>
              <span className="font-label-md text-label-md text-outline">or continue with</span>
              <div className="h-[1px] flex-grow bg-outline-variant/30"></div>
            </div>

            {/* Social Logins */}
            <div className="grid grid-cols-2 gap-md">
              <button className="flex items-center justify-center gap-sm border border-outline-variant/30 rounded-lg py-md hover:bg-surface-container-high transition-all text-on-surface">
                <img alt="Google" className="w-5 h-5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAqr7kdHQJwTdHSOuVtd1jCevCWjkR_aI2FVMjDkTxGrrSbEfcgfy7BSPj6zAXOtWc2wvYqyHnojwD3pDRMl7Muo2e9yMtq2JLXxUhvex3196M8NCo7ay4gsBbgyBzMb_GcKYxLAZjy3HYUvpch0oMXA50ptV5MbITz74ohxIGmyKrVt0fAG9q-GrxSqLjnGqnvqhmGpNuFJnev7tTTcglcjhQiqiiD8Pn6YO4MzoeAH45VxoECUqiFJDMAiOwYpIXXkTxZQ4euiiw" />
                <span className="font-label-md text-label-md">Google</span>
              </button>
              <button className="flex items-center justify-center gap-sm border border-outline-variant/30 rounded-lg py-md hover:bg-surface-container-high transition-all text-on-surface">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"></path></svg>
                <span className="font-label-md text-label-md">GitHub</span>
              </button>
            </div>

            {/* Footer Section */}
            <p className="text-center font-body-sm text-body-sm text-on-surface-variant">
              Don't have an account? <a className="text-primary font-bold hover:underline" href="#">Request Access</a>
            </p>
          </div>
        </main>

        {/* Footer */}
        <footer className="w-full px-lg py-md flex justify-center items-center">
          <p className="font-body-sm text-body-sm text-outline opacity-60">© 2024 Nexus RAG Platforms Inc.</p>
        </footer>
      </div>
    </div>
  );
}
