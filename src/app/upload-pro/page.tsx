"use client";

import React from "react";
import Link from "next/link";

export default function UploadProPage() {
  return (
    <div className="min-h-screen bg-[#0A0A15] text-white p-8 font-sans">
      <header className="flex justify-between items-center mb-16">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-400">
          Nexus Pro
        </h1>
        <Link href="/workspace" className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full font-medium transition-colors">
          Back to Workspace
        </Link>
      </header>

      <div className="max-w-5xl mx-auto text-center mb-16">
        <h2 className="text-5xl font-black mb-6">Unlock Massive PDF Power</h2>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Need to upload medical textbooks, extensive legal documents, or huge datasets? Our Pro tiers let you bypass the 50MB limit and process gigabytes of data instantly.
        </p>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {/* Tier 1 */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:shadow-[0_0_30px_rgba(245,158,11,0.2)] transition-all flex flex-col">
          <h3 className="text-2xl font-bold mb-2">1GB Capacity</h3>
          <div className="text-4xl font-black text-amber-400 mb-6">₹100 <span className="text-sm text-gray-500 font-normal">/ upload</span></div>
          <ul className="space-y-4 mb-8 flex-1 text-gray-300">
            <li className="flex items-center gap-3"><span className="text-green-400">✓</span> Bypass 50MB limits</li>
            <li className="flex items-center gap-3"><span className="text-green-400">✓</span> Lightning fast cloud processing</li>
            <li className="flex items-center gap-3"><span className="text-green-400">✓</span> High-density RAG chunking</li>
            <li className="flex items-center gap-3"><span className="text-green-400">✓</span> Permanent storage</li>
          </ul>
          <button className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-2xl font-bold transition-colors">
            Select 1GB Tier
          </button>
        </div>

        {/* Tier 2 */}
        <div className="bg-gradient-to-br from-amber-500/20 to-orange-600/20 backdrop-blur-xl border border-amber-500/50 rounded-3xl p-8 hover:shadow-[0_0_40px_rgba(245,158,11,0.4)] transition-all flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-amber-500 text-black text-xs font-bold px-4 py-1 rounded-bl-xl">BEST VALUE</div>
          <h3 className="text-2xl font-bold mb-2 text-white">2GB Capacity</h3>
          <div className="text-4xl font-black text-orange-400 mb-6">₹200 <span className="text-sm text-gray-500 font-normal">/ upload</span></div>
          <ul className="space-y-4 mb-8 flex-1 text-gray-300">
            <li className="flex items-center gap-3"><span className="text-green-400">✓</span> Massive 2GB limit</li>
            <li className="flex items-center gap-3"><span className="text-green-400">✓</span> Priority cloud GPUs for processing</li>
            <li className="flex items-center gap-3"><span className="text-green-400">✓</span> Ultra-dense RAG chunking</li>
            <li className="flex items-center gap-3"><span className="text-green-400">✓</span> Permanent storage</li>
          </ul>
          <button className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 rounded-2xl font-bold transition-colors shadow-[0_0_15px_rgba(245,158,11,0.5)]">
            Select 2GB Tier
          </button>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto bg-white/5 border border-dashed border-white/20 rounded-3xl p-12 text-center cursor-pointer hover:bg-white/10 transition-colors">
        <span className="material-symbols-outlined text-5xl text-gray-400 mb-4">cloud_upload</span>
        <h3 className="text-xl font-bold mb-2">Drag & Drop Pro Files Here</h3>
        <p className="text-gray-500">Supports PDF, DOCX, and TXT up to 2GB</p>
      </div>
    </div>
  );
}
