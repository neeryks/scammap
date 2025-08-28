import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { Button } from "@/components/ui/button";
import AccountMenu from '@/components/AccountMenu'
import { AuthProvider } from '@/contexts/AuthContext'
import MobileNav from '@/components/MobileNav'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ScamMapper — Dating, Venue & Restaurant Overcharge Watch",
  description:
    "User-powered map to report and research scams and overcharging in India with evidence-backed Scam Meter.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50 text-slate-900`}>
        <AuthProvider>
          <header className="sticky top-0 z-[9999] w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="mx-auto w-full max-w-7xl px-4">
              <div className="flex h-16 items-center justify-between">
                {/* Logo - responsive image */}
                <Link href="/" className="flex items-center h-10 w-10">
                  <img
                    src="/logo.png"
                    alt="ScamMapper Logo"
                    className="h-8 w-8 sm:h-10 sm:w-10 object-contain"
                  />
                </Link>
                
                {/* Desktop Navigation */}
                <nav className="hidden gap-6 text-sm font-medium md:flex">
                  <Link href="/map" className="text-slate-600 hover:text-slate-900 transition-colors">Map</Link>
                  <Link href="/incidents" className="text-slate-600 hover:text-slate-900 transition-colors">Incidents</Link>
                </nav>
                
                {/* Desktop Actions */}
                <div className="hidden md:flex items-center gap-3">
                  <Link href="/report">
                    <Button size="sm">
                      Report Incident
                    </Button>
                  </Link>
                  <AccountMenu />
                </div>
                
                {/* Mobile Actions */}
                <div className="flex md:hidden items-center gap-2">
                  <AccountMenu />
                  <MobileNav />
                </div>
              </div>
            </div>
          </header>
          <main className="mx-auto w-full max-w-7xl px-4 py-8">
            {children}
          </main>
          <footer className="border-t border-slate-200 bg-white py-8 text-sm text-slate-600">
            <div className="mx-auto w-full max-w-7xl px-4 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <img
                  src="/logo.png"
                  alt="ScamMapper Logo"
                  className="h-6 w-6 object-contain inline-block align-middle"
                />
                <span className="sr-only">ScamMapper</span>
                © {new Date().getFullYear()}
              </span>
              <div className="flex gap-6">
                <Link href="/incidents" className="hover:text-slate-900 transition-colors">Browse</Link>
                <Link href="/legal" className="hover:text-slate-900 transition-colors">Legal</Link>
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
