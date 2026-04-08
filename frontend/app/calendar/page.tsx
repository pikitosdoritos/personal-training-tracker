"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { trainingApi } from '@/lib/api';
import { GlassCard } from '@/components/GlassCard';
import { ChevronLeft, ChevronRight, Plus, Clock, X } from 'lucide-react';

const HOURS = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00'];

function getWeekDates(baseDate: Date) {
  const day = baseDate.getDay(); // 0=Sun
  const monday = new Date(baseDate);
  monday.setDate(baseDate.getDate() - ((day + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function toDateStr(d: Date) {
  return d.toISOString().split('T')[0];
}

export default function CalendarPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekBase, setWeekBase] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', date: '', start_time: '', end_time: '', capacity: 1 });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const weekDates = getWeekDates(weekBase);

  const fetchSessions = useCallback(async () => {
    try {
      const response = await trainingApi.list();
      setSessions(response.data);
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  const prevWeek = () => { const d = new Date(weekBase); d.setDate(d.getDate() - 7); setWeekBase(d); };
  const nextWeek = () => { const d = new Date(weekBase); d.setDate(d.getDate() + 7); setWeekBase(d); };

  const getEventForDayHour = (date: Date, hour: string) => {
    const dateStr = toDateStr(date);
    return sessions.filter(s => s.date === dateStr && s.start_time.substring(0, 5) === hour);
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      await trainingApi.create(form);
      setShowModal(false);
      setForm({ title: '', date: '', start_time: '', end_time: '', capacity: 1 });
      fetchSessions();
    } catch (err: any) {
      setFormError(err.response?.data?.detail || 'Failed to create session');
    } finally {
      setSubmitting(false);
    }
  };

  const formatWeekRange = () => {
    const start = weekDates[0];
    const end = weekDates[6];
    const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return `${start.toLocaleDateString('en-US', opts)} – ${end.toLocaleDateString('en-US', { ...opts, year: 'numeric' })}`;
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading calendar...</div>;

  return (
    <div className="animate-fade-in">
      <header className="page-header">
        <div>
          <h1>Calendar</h1>
          <p>Schedule and manage your training sessions.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', background: 'var(--glass-bg)', borderRadius: '12px', padding: '4px', border: '1px solid var(--card-border)', alignItems: 'center' }}>
            <button onClick={prevWeek} style={{ padding: '8px 12px', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}><ChevronLeft size={18} /></button>
            <div style={{ padding: '8px 16px', fontWeight: 600, fontSize: '0.9rem' }}>{formatWeekRange()}</div>
            <button onClick={nextWeek} style={{ padding: '8px 12px', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}><ChevronRight size={18} /></button>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={20} />
            <span>Schedule</span>
          </button>
        </div>
      </header>

      <GlassCard style={{ padding: '0', overflow: 'hidden' }}>
        <div className="calendar-grid-wrapper">
          <div style={{ padding: '16px', borderRight: '1px solid var(--card-border)' }} />
          {weekDates.map((d, i) => {
            const isToday = toDateStr(d) === toDateStr(new Date());
            return (
              <div key={i} style={{ padding: '16px', textAlign: 'center', fontWeight: 600, borderRight: '1px solid var(--card-border)', color: isToday ? 'var(--primary)' : 'white' }}>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>
                  {d.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: isToday ? 700 : 500 }}>{d.getDate()}</div>
              </div>
            );
          })}
        </div>

        {/* Time grid */}
        <div style={{ height: '600px', overflowY: 'auto' }}>
          {HOURS.map(hour => (
            <div key={hour} style={{ display: 'grid', gridTemplateColumns: '80px repeat(7, 1fr)', minHeight: '80px', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
              <div style={{ padding: '12px', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', textAlign: 'center', borderRight: '1px solid var(--card-border)' }}>
                {hour}
              </div>
              {weekDates.map((d, i) => {
                const events = getEventForDayHour(d, hour);
                return (
                  <div key={i} style={{ borderRight: '1px solid rgba(255,255,255,0.03)', padding: '4px', position: 'relative' }}>
                    {events.map(event => (
                      <div key={event.id} style={{
                        background: 'var(--primary)',
                        borderRadius: '8px',
                        padding: '8px',
                        fontSize: '0.8rem',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                        cursor: 'pointer',
                        marginBottom: '2px'
                      }}>
                        <p style={{ fontWeight: 700 }}>{event.title}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', opacity: 0.8 }}>
                          <Clock size={12} /> {event.start_time?.substring(0, 5)}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Schedule Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <GlassCard style={{ width: '100%', maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontWeight: 700, fontSize: '1.25rem' }}>Schedule Session</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}><X size={20} /></button>
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
                    type={type} required placeholder={placeholder}
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
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center' }} disabled={submitting}>
                {submitting ? 'Scheduling...' : 'Schedule Session'}
              </button>
            </form>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
