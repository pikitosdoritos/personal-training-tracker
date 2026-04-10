"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Calendar, Users, WalletCards, Settings, LogOut, Moon, Sun, Monitor
} from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
  { icon: Calendar,        label: 'Calendar',  href: '/calendar' },
  { icon: Users,           label: 'Clients',   href: '/clients' },
  { icon: WalletCards,     label: 'Finances',  href: '/finances' },
  { icon: Settings,        label: 'Profile',   href: '/profile' },
];

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ open = true, onClose }) => {
  const pathname = usePathname();

  const [activeTheme, setActiveTheme] = React.useState('system');

  React.useEffect(() => {
     setActiveTheme(localStorage.getItem('trackfit_theme') || 'system');
  }, []);

  const handleThemeChange = (t: string) => {
     setActiveTheme(t);
     if (t === 'system') {
        localStorage.removeItem('trackfit_theme');
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            document.documentElement.setAttribute('data-theme', 'light');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
     } else {
        localStorage.setItem('trackfit_theme', t);
        if (t === 'light') document.documentElement.setAttribute('data-theme', 'light');
        else document.documentElement.removeAttribute('data-theme');
     }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`sidebar-overlay ${open ? 'open' : ''}`}
        onClick={onClose}
      />

      <aside className={`sidebar ${open ? 'open' : ''}`}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '36px', padding: '0 8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0 }}>
              <img src="/logo.png" alt="TrackFit Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <span style={{ fontSize: '1.15rem', fontWeight: 700, letterSpacing: '-0.3px' }}>TrackFit</span>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '11px 14px',
                  borderRadius: '12px',
                  transition: 'var(--transition)',
                  background: isActive ? 'rgba(59, 130, 246, 0.12)' : 'transparent',
                  color: isActive ? 'var(--primary)' : 'rgba(255, 255, 255, 0.55)',
                  fontWeight: isActive ? 600 : 400,
                  fontSize: '0.92rem',
                  textDecoration: 'none',
                }}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
                {isActive && (
                  <div style={{ marginLeft: 'auto', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)' }} />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Theme Toggler */}
        <div style={{ marginBottom: '16px', background: 'rgba(0,0,0,0.1)', padding: '4px', borderRadius: '12px', display: 'flex', border: '1px solid var(--card-border)' }}>
            <button onClick={() => handleThemeChange('light')} style={{ flex: 1, padding: '8px', border: 'none', background: activeTheme === 'light' ? 'var(--primary)' : 'transparent', color: activeTheme === 'light' ? 'white' : 'inherit', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'center', transition: 'var(--transition)' }}>
                <Sun size={16} />
            </button>
            <button onClick={() => handleThemeChange('system')} style={{ flex: 1, padding: '8px', border: 'none', background: activeTheme === 'system' ? 'var(--primary)' : 'transparent', color: activeTheme === 'system' ? 'white' : 'inherit', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'center', transition: 'var(--transition)' }}>
                <Monitor size={16} />
            </button>
            <button onClick={() => handleThemeChange('dark')} style={{ flex: 1, padding: '8px', border: 'none', background: activeTheme === 'dark' ? 'var(--primary)' : 'transparent', color: activeTheme === 'dark' ? 'white' : 'inherit', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'center', transition: 'var(--transition)' }}>
                <Moon size={16} />
            </button>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 14px', borderRadius: '12px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.45)', cursor: 'pointer', width: '100%', fontSize: '0.92rem', fontFamily: 'inherit', transition: 'var(--transition)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'white')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </aside>
    </>
  );
};
