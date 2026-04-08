"use client";

import "./globals.css";
import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { usePathname } from "next/navigation";
import { Menu, Dumbbell } from "lucide-react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <html lang="en">
      <head>
        <title>TrackFit | Coach Management</title>
        <meta name="description" content="Advanced training tracker for coaches and clients" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.png" type="image/png" />
      </head>
      <body>
        {isLoginPage ? (
          <>{children}</>
        ) : (
          <div className="app-container">
            {/* Mobile top bar */}
            <header className="mobile-topbar" style={{
              position: 'fixed', top: 0, left: 0, right: 0, height: '60px',
              background: 'rgba(10,10,12,0.95)', backdropFilter: 'blur(12px)',
              borderBottom: '1px solid var(--card-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
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
                <div style={{ width: '28px', height: '28px', background: 'var(--primary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Dumbbell size={16} color="white" />
                </div>
                <span style={{ fontWeight: 700, fontSize: '1rem' }}>TrackFit</span>
              </div>
              <div style={{ width: '38px' }} />
            </header>

            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <main className="main-content">
              {children}
            </main>
          </div>
        )}
      </body>
    </html>
  );
}
