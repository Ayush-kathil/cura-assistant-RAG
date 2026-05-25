import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center text-center p-4">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-blue-900/20 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-cyan-900/10 rounded-full blur-[80px]"></div>
      </div>
      
      <div className="relative z-10 glass-card bg-white/5 border border-white/10 rounded-3xl p-12 max-w-lg shadow-2xl backdrop-blur-xl">
        <span className="material-symbols-outlined text-[80px] text-blue-400 mb-6 block">explore_off</span>
        <h1 className="font-display-lg text-6xl text-white font-bold mb-4 font-sans tracking-tight">404</h1>
        <h2 className="text-2xl text-blue-100 font-semibold mb-4 font-sans">Page Not Found</h2>
        <p className="text-blue-200/60 mb-8 font-sans">
          The page you are looking for doesn't exist or has been moved. Let's get you back to your workspace.
        </p>
        
        <Link href="/workspace" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)]">
          <span className="material-symbols-outlined text-sm">home</span>
          Back to Workspace
        </Link>
      </div>
    </div>
  );
}
