"use client";

import React, { useEffect, useState } from 'react';
import { statsApi, bookingApi } from '@/lib/api';
import { GlassCard } from '@/components/GlassCard';
import { StatCard } from '@/components/StatCard';
import { DollarSign, ArrowUpRight, CreditCard, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function FinancesPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchFinances = async () => {
    try {
      const res = await statsApi.finances();
      setData(res.data);
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFinances(); }, []);

  const handleExport = async () => {
    try {
      const res = await statsApi.exportCsv();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'stats.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      alert('Export failed');
    }
  };

  const handleMarkPaid = async (bookingId: number) => {
    try {
      await bookingApi.markPaid(bookingId);
      fetchFinances();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to mark as paid');
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading finances...</div>;

  const chartData = data?.monthly_data || [];
  const transactions = data?.transactions || [];

  return (
    <div className="animate-fade-in">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '8px' }}>Finances</h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.5)' }}>Track your earnings, payments, and financial health.</p>
        </div>
        <button className="btn btn-secondary" onClick={handleExport}>
          <Download size={20} />
          <span>Export Report</span>
        </button>
      </header>

      <div className="dashboard-grid" style={{ marginBottom: '24px' }}>
        <StatCard label="This Month Revenue" value={`$${data?.this_month_revenue || 0}`} icon={<DollarSign size={24} />} />
        <StatCard label="Pending Payments" value={`$${data?.total_pending || 0}`} icon={<CreditCard size={24} />} />
        <StatCard label="Total Earned" value={`$${data?.total_paid || 0}`} icon={<ArrowUpRight size={24} />} trend="All time" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '24px' }}>
        <GlassCard>
          <h3 style={{ marginBottom: '24px', fontWeight: 600 }}>Revenue vs Target</h3>
          <div style={{ width: '100%', height: '350px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" fontSize={12} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(10,10,12,0.8)', border: '1px solid var(--card-border)', borderRadius: '8px' }} />
                <Bar dataKey="income" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="target" fill="rgba(255,255,255,0.1)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard>
          <h3 style={{ marginBottom: '24px', fontWeight: 600 }}>Recent Transactions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '380px', overflowY: 'auto' }}>
            {transactions.length === 0 && (
              <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>No transactions yet</p>
            )}
            {transactions.map((t: any) => (
              <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>{t.client}</p>
                  <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>{t.date}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontWeight: 700, color: 'white' }}>+${t.amount}</p>
                  {t.status === 'unpaid' ? (
                    <button
                      onClick={() => handleMarkPaid(t.booking_id)}
                      style={{ fontSize: '0.75rem', color: '#f59e0b', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
                    >
                      Mark Paid
                    </button>
                  ) : (
                    <p style={{ fontSize: '0.75rem', color: '#10b981' }}>Paid</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
