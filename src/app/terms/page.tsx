import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white text-black font-sans">
      <nav className="fixed top-0 w-full z-50 flex items-center px-8 md:px-16 bg-black py-4">
        <Link href="/" className="flex items-center gap-3">
          <img src="/bot.jpg" alt="Cura Logo" className="w-8 h-8 rounded-full object-cover border-2 border-white/20" />
          <span className="font-bold text-xl tracking-tighter text-white uppercase">Cura</span>
        </Link>
      </nav>

      <main className="pt-32 pb-24 px-8 md:px-16 max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter uppercase mb-12">Terms & Conditions</h1>
        
        <div className="space-y-12 text-lg text-gray-800 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold uppercase tracking-wider mb-4 border-b border-black pb-2">1. Acceptance of Terms</h2>
            <p>
              By accessing and using Cura ("the Application"), you accept and agree to be bound by the terms and provision of this agreement. 
              If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold uppercase tracking-wider mb-4 border-b border-black pb-2">2. Medical Disclaimer</h2>
            <p className="font-bold text-red-600 mb-2">CRITICAL NOTICE: CURA IS NOT A MEDICAL PROFESSIONAL.</p>
            <p>
              The AI companion provided by Cura is designed for emotional support, mood tracking, and cognitive reflection. 
              It does not constitute medical advice, psychiatric diagnosis, or professional clinical treatment. 
              In the event of a medical emergency or immediate threat of self-harm, please contact your local emergency services immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold uppercase tracking-wider mb-4 border-b border-black pb-2">3. Data Privacy & Security</h2>
            <p>
              Your privacy is our utmost priority. All chat sessions, physiological data logs, and profile information are 
              processed securely. By using Cura, you consent to the collection and use of this information strictly for the 
              purpose of providing and improving the personalized AI experience. We do not sell your personal chat logs to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold uppercase tracking-wider mb-4 border-b border-black pb-2">4. User Conduct</h2>
            <p>
              Users agree to use the Application responsibly. Any attempt to reverse engineer the underlying Language Models, 
              inject malicious prompts, or utilize the service for illegal activities will result in immediate termination of your account.
            </p>
          </section>
        </div>

        <div className="mt-16">
          <Link href="/login" className="px-8 py-4 bg-black text-white font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors rounded-full">
            Return to Login
          </Link>
        </div>
      </main>
    </div>
  );
}
