"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { userApi, authApi } from '@/lib/api';
import { GlassCard } from '@/components/GlassCard';
import { Search, UserPlus, Mail, Phone, MoreVertical, X } from 'lucide-react';

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<any>({ first_name: '', last_name: '', email: '', password: '', age: '', phone_number: '', telegram_username: '' });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchClients = useCallback(async () => {
    try {
      const response = await userApi.listClients();
      setClients(response.data);
      setFiltered(response.data);
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      clients.filter(c =>
        (c.first_name || '').toLowerCase().includes(q) ||
        (c.last_name || '').toLowerCase().includes(q) ||
        (c.email || '').toLowerCase().includes(q) ||
        (c.phone_number || '').toLowerCase().includes(q)
      )
    );
  }, [search, clients]);

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      const generatedEmail = `${form.first_name.toLowerCase().replace(/\s/g, '')}.${form.last_name.toLowerCase().replace(/\s/g, '')}@client.trackfit.local`;
      await authApi.register({ ...form, email: generatedEmail, role: 'client' });
      setShowModal(false);
      setForm({ first_name: '', last_name: '', password: '', age: '', phone_number: '', telegram_username: '' });
      fetchClients();
    } catch (err: any) {
      setFormError(err.response?.data?.detail || 'Failed to add client');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading clients...</div>;

  return (
    <div className="animate-fade-in">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '8px' }}>Clients</h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.5)' }}>Manage your clients and their training progress.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <UserPlus size={20} />
          <span>Add Client</span>
        </button>
      </header>

      <GlassCard style={{ padding: '0' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--card-border)', display: 'flex', gap: '16px' }}>
          <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Search size={18} color="rgba(255,255,255,0.3)" />
            <input
              type="text"
              placeholder="Search clients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', width: '100%' }}
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>
            {search ? 'No clients match your search.' : 'No clients yet. Add your first client!'}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--card-border)' }}>
                {['Client', 'Contact', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '20px 24px', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((client) => {
                const displayName = [client.first_name, client.last_name].filter(Boolean).join(' ') || 'Unknown';
                return (
                  <tr key={client.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, flexShrink: 0 }}>
                          {displayName.charAt(0).toUpperCase()}
                        </div>
                        <span>{displayName}</span>
                      </div>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>
                          <Mail size={14} /> {client.email}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>
                          <Phone size={14} /> {client.phone_number || 'N/A'}
                        </div>
                      </div>
                    </td>
                  <td style={{ padding: '20px 24px' }}>
                    <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}>
                      Active
                    </span>
                  </td>
                  <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                    <button style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </GlassCard>

      {/* Add Client Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, padding: '16px', background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <GlassCard style={{ width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontWeight: 700, fontSize: '1.25rem', marginBottom: '24px' }}>Add New Client</h3>
            {formError && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', padding: '10px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem' }}>
                {formError}
              </div>
            )}
            <form onSubmit={handleAddClient} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>First Name</label>
                  <input type="text" required value={form.first_name || ''} onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', borderRadius: '10px', padding: '10px 14px', color: 'white', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>Last Name</label>
                  <input type="text" required value={form.last_name || ''} onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', borderRadius: '10px', padding: '10px 14px', color: 'white', outline: 'none' }} />
                </div>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>Password</label>
                <input
                  type="password" placeholder="••••••••" required
                  value={form.password || ''}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', borderRadius: '10px', padding: '10px 14px', color: 'white', outline: 'none' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>Age</label>
                  <input type="number" required min={1} value={form.age || ''} onChange={(e) => setForm({ ...form, age: parseInt(e.target.value) || '' as any })}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', borderRadius: '10px', padding: '10px 14px', color: 'white', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>Phone Number</label>
                  <input type="text" required value={form.phone_number || ''} onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', borderRadius: '10px', padding: '10px 14px', color: 'white', outline: 'none' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>Telegram Username</label>
                <input type="text" required value={form.telegram_username || ''} onChange={(e) => setForm({ ...form, telegram_username: e.target.value })}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', borderRadius: '10px', padding: '10px 14px', color: 'white', outline: 'none' }} placeholder="@username" />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submitting}>
                  {submitting ? 'Adding...' : 'Add Client'}
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
