"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { statsApi } from '@/lib/api';
import { StatCard } from '@/components/StatCard';
import { GlassCard } from '@/components/GlassCard';
import { TrendingUp, Users, Calendar, DollarSign, Plus, X } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { trainingApi } from '@/lib/api';
import { useModal } from '@/lib/modalContext';
import { Portal } from '@/components/Portal';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', date: '', start_time: '', end_time: '', capacity: 1 });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const { setModalOpen } = useModal();

  const openModal = () => { setShowModal(true); setModalOpen(true); };
  const closeModal = () => { setShowModal(false); setModalOpen(false); };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    fetchStats();
  }, [router]);

  const fetchStats = async () => {
    try {
      const response = await statsApi.dashboard();
      setStats(response.data);
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      await trainingApi.create(form);
      closeModal();
      setForm({ title: '', date: '', start_time: '', end_time: '', capacity: 1 });
      fetchStats();
    } catch (err: any) {
      setFormError(err.response?.data?.detail || 'Failed to create session');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading dashboard...</div>;

  const chartData = stats?.monthly_sessions_chart || [
    { name: 'Mon', income: 0 }, { name: 'Tue', income: 0 }, { name: 'Wed', income: 0 },
    { name: 'Thu', income: 0 }, { name: 'Fri', income: 0 }, { name: 'Sat', income: 0 }, { name: 'Sun', income: 0 },
  ];

  return (
    <div className="animate-fade-in">
      <header className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back, Coach! Here's your overview.</p>
        </div>
        <button className="btn btn-primary" onClick={openModal}>
          <Plus size={18} />
          <span>New Session</span>
        </button>
      </header>

      <div className="dashboard-grid">
        <StatCard label="Total Income" value={`$${stats?.total_income || 0}`} icon={<DollarSign size={24} />} trend="Paid sessions" />
        <StatCard label="Active Clients" value={stats?.active_clients?.length || 0} icon={<Users size={24} />} trend="Total enrolled" />
        <StatCard label="Sessions Total" value={stats?.total_sessions || 0} icon={<Calendar size={24} />} />
        <StatCard label="Total Bookings" value={stats?.total_bookings || 0} icon={<TrendingUp size={24} />} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginTop: '24px' }} className="analytics-grid">
        <GlassCard>
          <h3 style={{ marginBottom: '24px', fontWeight: 600 }}>Income Analytics</h3>
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={12} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(10,10,12,0.8)', border: '1px solid var(--card-border)', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="income" stroke="var(--primary)" fillOpacity={1} fill="url(#colorIncome)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard>
          <h3 style={{ marginBottom: '24px', fontWeight: 600 }}>Active Clients</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {(stats?.active_clients || []).map((client: any, i: number) => (
              <div key={i} style={{ padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', borderLeft: '4px solid var(--secondary)' }}>
                <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>{client.name}</p>
                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Sessions: {client.count}</span>
              </div>
            ))}
            {(!stats?.active_clients || stats.active_clients.length === 0) && (
              <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>No active clients yet</p>
            )}
          </div>
          <button className="btn btn-secondary" style={{ width: '100%', marginTop: '16px' }} onClick={() => router.push('/clients')}>
            View All Clients
          </button>
        </GlassCard>
      </div>

      {/* New Session Modal */}
      {showModal && (
        <Portal>
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <GlassCard className="modal-card" style={{ width: '100%', maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontWeight: 700, fontSize: '1.25rem' }}>New Training Session</h3>
              <button onClick={closeModal} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            {formError && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', padding: '10px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem' }}>
                {formError}
              </div>
            )}
            <form onSubmit={handleCreateSession} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { label: 'Title', key: 'title', type: 'text', placeholder: 'e.g. Strength Workout' },
                { label: 'Date', key: 'date', type: 'date', placeholder: '' },
                { label: 'Start Time', key: 'start_time', type: 'time', placeholder: '' },
                { label: 'End Time', key: 'end_time', type: 'time', placeholder: '' },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>{label}</label>
                  <input
                    type={type}
                    required
                    placeholder={placeholder}
                    value={(form as any)[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', borderRadius: '10px', padding: '10px 14px', color: 'white', outline: 'none', colorScheme: 'dark' }}
                  />
                </div>
              ))}
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>Capacity</label>
                <input
                  type="number" min={1} max={50} required
                  value={form.capacity}
                  onChange={(e) => setForm({ ...form, capacity: parseInt(e.target.value) })}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', borderRadius: '10px', padding: '10px 14px', color: 'white', outline: 'none' }}
                />              </div>
              <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center' }} disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Session'}
              </button>
            </form>
          </GlassCard>
        </div>
        </Portal>
      )}
    </div>
  );
}
