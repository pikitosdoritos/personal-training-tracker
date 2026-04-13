"use client";

import "./globals.css";
import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { usePathname } from "next/navigation";
import { Menu, Dumbbell } from "lucide-react";
import { ModalProvider, useModal } from "@/lib/modalContext";

function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isModalOpen } = useModal();

  return (
    <>
      {isLoginPage ? (
        <>{children}</>
      ) : (
        <div className="app-container">
          <header className="mobile-topbar" style={{
            position: 'fixed', top: 0, left: 0, right: 0, height: '60px',
            background: 'rgba(10,10,12,0.95)', backdropFilter: 'blur(12px)',
            borderBottom: '1px solid var(--card-border)',
            alignItems: 'center', justifyContent: 'space-between',
            padding: '0 16px', zIndex: 98
          }}>
            <button
              onClick={() => setSidebarOpen(true)}
              style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: '8px', display: 'flex' }}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', overflow: 'hidden' }}>
                <img src="/logo.png" alt="TrackFit Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <span style={{ fontWeight: 700, fontSize: '1rem' }}>TrackFit</span>
            </div>
            <div style={{ width: '38px' }} />
          </header>

          <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

          <main className="main-content">
            <div className={isModalOpen ? 'blurred' : ''}>
              {children}
            </div>
          </main>
        </div>
      )}
    </>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>TrackFit | Coach Management</title>
        <meta name="description" content="Advanced training tracker for coaches and clients" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <script dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('trackfit_theme');
                  if (saved === 'light') { document.documentElement.setAttribute('data-theme', 'light'); }
                  else if (saved !== 'dark' && window.matchMedia('(prefers-color-scheme: light)').matches) {
                    document.documentElement.setAttribute('data-theme', 'light');
                  }
                } catch (e) {}
              })();
            `
        }} />
      </head>
      <body>
        <ModalProvider>
          <AppShell>{children}</AppShell>
        </ModalProvider>
      </body>
    </html>
  );
}
