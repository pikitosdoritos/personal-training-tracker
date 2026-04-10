"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Calendar, Users, WalletCards, Settings, LogOut, Dumbbell, X
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
