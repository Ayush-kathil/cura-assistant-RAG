import type { Metadata, Viewport } from "next";
import { Geist_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import QueryProvider from "@/components/providers/QueryProvider";
import { WorkspaceProvider } from "@/contexts/WorkspaceContext";
import { Toaster } from "sonner";
import LoadingScreen from "@/components/LoadingScreen";
import CookieBanner from "@/components/CookieBanner";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CURA | Professional AI Knowledge Engine",
  description: "The enterprise-grade RAG and document intelligence platform.",
  manifest: "/manifest.json",
  icons: {
    icon: "/bot.jpg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Prevents iOS zooming which causes the shrink effect
  viewportFit: "cover", // Handles notches
  themeColor: "#05050A",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.getItem('theme') === 'light') {
                  document.documentElement.classList.remove('dark');
                } else {
                  document.documentElement.classList.add('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body
        className={`${spaceGrotesk.variable} ${geistMono.variable} antialiased font-sans overscroll-y-none selection:bg-blue-100 selection:text-blue-900`}
        style={{ fontFamily: 'var(--font-space-grotesk), -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}
      >
        <ThemeProvider>
          <QueryProvider>
            <WorkspaceProvider>
              <LoadingScreen />
              {children}
              <CookieBanner />
              <Toaster position="top-right" />
            </WorkspaceProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
