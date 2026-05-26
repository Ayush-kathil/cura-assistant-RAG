"use client";

import React, { useState } from 'react';
import Link from 'next/link';

const ms = "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24";

export default function MobileSignIn() {
  const [isDark, setIsDark] = useState(true);

  return (
    <div className={`${isDark ? 'dark' : ''} flex flex-col h-full bg-[#0e131e] text-[#dee2f2]`}>

      {/* Ambient glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-10 w-64 h-64 bg-[#c0c1ff]/8 blur-[100px] rounded-full"></div>
        <div className="absolute -bottom-20 -right-10 w-64 h-64 bg-[#4cd7f6]/8 blur-[100px] rounded-full"></div>
      </div>

      {/* Header */}
      <header className="shrink-0 bg-[rgba(14,19,30,0.95)] backdrop-blur-md border-b border-[#464554]/30 px-4 py-3 flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#c0c1ff] text-[24px]" style={{ fontVariationSettings: ms }}>hub</span>
          <span className="font-bold text-[17px] text-[#dee2f2] tracking-tight" style={{ fontFamily: 'Geist, sans-serif' }}>Nexus RAG</span>
        </div>
        <button onClick={() => setIsDark(!isDark)} className="p-2 rounded-full hover:bg-[#252a35] transition-colors text-[#c7c4d7]">
          <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: ms }}>
            {isDark ? 'light_mode' : 'dark_mode'}
          </span>
        </button>
      </header>

      {/* Main content — flex-1, centered */}
      <main className="flex-1 min-h-0 overflow-y-auto flex items-center justify-center px-4 py-6 z-10">
        {/* Auth Card */}
        <div className="w-full max-w-sm bg-[rgba(14,19,30,0.9)] border border-[#464554]/20 rounded-2xl shadow-2xl p-6 flex flex-col gap-5">

          {/* Header */}
          <div className="text-center">
            <div className="w-14 h-14 bg-[#c0c1ff]/10 border border-[#c0c1ff]/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <span className="material-symbols-outlined text-[#c0c1ff] text-[28px]" style={{ fontVariationSettings: ms }}>hub</span>
            </div>
            <h1 className="text-[22px] font-bold text-[#dee2f2] tracking-tight" style={{ fontFamily: 'Geist, sans-serif' }}>Welcome Back</h1>
            <p className="text-[13px] text-[#c7c4d7] mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>Access your intelligence engine</p>
          </div>

          {/* Form */}
          <form className="flex flex-col gap-4" onSubmit={e => e.preventDefault()}>
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] text-[#c7c4d7] px-1" style={{ fontFamily: 'Geist, sans-serif' }}>Email Address</label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-[#908fa0] text-[18px]" style={{ fontVariationSettings: ms }}>mail</span>
                <input
                  className="w-full bg-[#171c27] border border-[#464554]/30 rounded-xl py-3 pl-10 pr-4 text-base text-[#dee2f2] focus:outline-none focus:border-[#c0c1ff] transition-all placeholder:text-[#908fa0]/50"
                  placeholder="name@company.com"
                  type="email"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center px-1">
                <label className="text-[12px] text-[#c7c4d7]" style={{ fontFamily: 'Geist, sans-serif' }}>Password</label>
                <a className="text-[12px] text-[#c0c1ff] active:text-[#4cd7f6] transition-colors" href="#" style={{ fontFamily: 'Geist, sans-serif' }}>Forgot Password?</a>
              </div>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-[#908fa0] text-[18px]" style={{ fontVariationSettings: ms }}>lock</span>
                <input
                  className="w-full bg-[#171c27] border border-[#464554]/30 rounded-xl py-3 pl-10 pr-4 text-base text-[#dee2f2] focus:outline-none focus:border-[#c0c1ff] transition-all placeholder:text-[#908fa0]/50"
                  placeholder="••••••••"
                  type="password"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
              </div>
            </div>

            <Link href="/mobile/home">
              <button type="button" className="w-full bg-[#c0c1ff] text-[#1000a9] text-[14px] font-bold py-3.5 rounded-xl active:scale-[0.98] transition-transform mt-1 shadow-lg shadow-[#c0c1ff]/20" style={{ fontFamily: 'Geist, sans-serif' }}>
                Sign In
              </button>
            </Link>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-[#464554]/30"></div>
            <span className="text-[11px] text-[#908fa0]" style={{ fontFamily: 'Geist, sans-serif' }}>or continue with</span>
            <div className="h-px flex-1 bg-[#464554]/30"></div>
          </div>

          {/* Social */}
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 border border-[#464554]/30 rounded-xl py-3 active:bg-[#252a35] active:scale-95 transition-all text-[#dee2f2] text-[13px]" style={{ fontFamily: 'Geist, sans-serif' }}>
              <img alt="Google" className="w-4 h-4" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAqr7kdHQJwTdHSOuVtd1jCevCWjkR_aI2FVMjDkTxGrrSbEfcgfy7BSPj6zAXOtWc2wvYqyHnojwD3pDRMl7Muo2e9yMtq2JLXxUhvex3196M8NCo7ay4gsBbgyBzMb_GcKYxLAZjy3HYUvpch0oMXA50ptV5MbITz74ohxIGmyKrVt0fAG9q-GrxSqLjnGqnvqhmGpNuFJnev7tTTcglcjhQiqiiD8Pn6YO4MzoeAH45VxoECUqiFJDMAiOwYpIXXkTxZQ4euiiw" />
              Google
            </button>
            <button className="flex items-center justify-center gap-2 border border-[#464554]/30 rounded-xl py-3 active:bg-[#252a35] active:scale-95 transition-all text-[#dee2f2] text-[13px]" style={{ fontFamily: 'Geist, sans-serif' }}>
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
              GitHub
            </button>
          </div>

          {/* Footer */}
          <p className="text-center text-[12px] text-[#c7c4d7]" style={{ fontFamily: 'Inter, sans-serif' }}>
            Don't have an account?{' '}
            <a className="text-[#c0c1ff] font-bold active:underline" href="#">Request Access</a>
          </p>
        </div>
      </main>

      {/* Copyright */}
      <footer className="shrink-0 py-3 flex justify-center z-10">
        <p className="text-[11px] text-[#908fa0]/50" style={{ fontFamily: 'Inter, sans-serif' }}>© 2024 Nexus RAG Platforms Inc.</p>
      </footer>
    </div>
  );
}
