"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { userApi, authApi } from '@/lib/api';
import { GlassCard } from '@/components/GlassCard';
import { Search, UserPlus, Mail, Phone, Edit, Trash, FileText, X } from 'lucide-react';

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [clientToDelete, setClientToDelete] = useState<any>(null);
  const [form, setForm] = useState<any>({ first_name: '', last_name: '', email: '', password: '', age: '', phone_number: '', telegram_username: '', notes: '' });
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

  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      if (editingClient) {
        await userApi.updateClient(editingClient.id, form);
      } else {
        const randomString = Math.random().toString(36).substring(2, 10);
        const generatedEmail = `client_${randomString}@trackfit.com`;
        const dummyPassword = Math.random().toString(36).slice(-8) + 'A1!'; // Securely generated default fallback password
        await authApi.register({ ...form, email: generatedEmail, password: dummyPassword, role: 'client' });
      }
      setShowModal(false);
      setEditingClient(null);
      setForm({ first_name: '', last_name: '', password: '', age: '', phone_number: '', telegram_username: '', notes: '' });
      fetchClients();
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setFormError(detail.map((d: any) => `${d.loc?.[d.loc.length - 1]}: ${d.msg}`).join(', '));
      } else if (typeof detail === 'string') {
        setFormError(detail);
      } else if (detail) {
        setFormError(JSON.stringify(detail));
      } else {
        setFormError(editingClient ? 'Failed to update client' : 'Failed to add client');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (client: any) => {
    setEditingClient(client);
    setForm({
      first_name: client.first_name || '',
      last_name: client.last_name || '',
      age: client.age || '',
      phone_number: client.phone_number || '',
      telegram_username: client.telegram_username || '',
      notes: client.notes || ''
    });
    setShowModal(true);
  };

  const confirmDeleteClient = async () => {
    if (!clientToDelete) return;
    try {
      await userApi.deleteClient(clientToDelete.id);
      setClientToDelete(null);
      fetchClients();
    } catch (err) {
      alert('Failed to delete client');
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
        <button className="btn btn-primary" onClick={() => {
          setEditingClient(null);
          setForm({ first_name: '', last_name: '', password: '', age: '', phone_number: '', telegram_username: '', notes: '' });
          setShowModal(true);
        }}>
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
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button onClick={() => handleEditClick(client)} style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', color: '#3b82f6', cursor: 'pointer', padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Edit Client">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => setClientToDelete(client)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', cursor: 'pointer', padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Delete Client">
                        <Trash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </GlassCard>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, padding: '16px', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <GlassCard style={{ width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontWeight: 700, fontSize: '1.25rem', marginBottom: '24px' }}>{editingClient ? 'Edit Client' : 'Add New Client'}</h3>
            {formError && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', padding: '10px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem' }}>
                {formError}
              </div>
            )}
            <form onSubmit={handleSaveClient} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                <input type="text" required={!editingClient} value={form.telegram_username || ''} onChange={(e) => setForm({ ...form, telegram_username: e.target.value })}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', borderRadius: '10px', padding: '10px 14px', color: 'white', outline: 'none' }} placeholder="@username" />
              </div>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
                  <FileText size={14} /> Notes
                </label>
                <textarea rows={3} value={form.notes || ''} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', borderRadius: '10px', padding: '10px 14px', color: 'white', outline: 'none', resize: 'vertical' }} placeholder="Add client notes here..." />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submitting}>
                  {submitting ? 'Saving...' : (editingClient ? 'Save Changes' : 'Add Client')}
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {clientToDelete && (
        <div style={{ position: 'fixed', inset: 0, padding: '16px', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <GlassCard style={{ width: '100%', maxWidth: '400px' }}>
            <h3 style={{ fontWeight: 700, fontSize: '1.25rem', marginBottom: '16px', color: '#ef4444' }}>Delete Client</h3>
            <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '24px', lineHeight: 1.5 }}>
              Are you sure you want to delete <strong>{clientToDelete.first_name} {clientToDelete.last_name}</strong>? This action cannot be undone and will permanently remove their profile.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setClientToDelete(null)}>
                Cancel
              </button>
              <button className="btn btn-primary" style={{ flex: 1, background: '#ef4444', borderColor: '#ef4444' }} onClick={confirmDeleteClient}>
                Yes, Delete
              </button>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
