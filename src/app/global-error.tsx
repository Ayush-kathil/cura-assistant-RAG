"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Error Caught:", error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans text-slate-800">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-slate-200 p-8 text-center">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-light tracking-tight text-slate-900 mb-4">A fatal error occurred</h1>
            <p className="text-slate-500 mb-8 leading-relaxed">
              Something went wrong in the application. We've logged the error and are looking into it.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => reset()}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-lg shadow-blue-500/30"
              >
                Try to recover
              </button>
              <Link href="/" className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors">
                Return Home
              </Link>
            </div>
            {error.message && (
              <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-100 text-left overflow-hidden">
                <p className="text-xs text-slate-400 font-mono break-words">{error.message}</p>
              </div>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
