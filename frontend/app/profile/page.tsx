"use client";

import React, { useEffect, useState } from 'react';
import { userApi } from '@/lib/api';
import { GlassCard } from '@/components/GlassCard';
import { User, Mail, Phone, Save, CheckCircle, Upload } from 'lucide-react';

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', phone_number: '', telegram_username: '', photo_url: '', contact_info: '' });
  const [workingHours, setWorkingHours] = useState<{days: string[], start: string, end: string}>({ days: ['Mon','Tue','Wed','Thu','Fri'], start: '09:00', end: '18:00' });
  const [fileName, setFileName] = useState('');
  const [types, setTypes] = useState<any[]>([]);
  const [newType, setNewType] = useState({ name: 'Individual', duration_minutes: 60, cost: 500 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm(prev => ({ ...prev, photo_url: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchProfileAndTypes = async () => {
    try {
      const res = await userApi.me();
      setProfile(res.data);
      setForm({
        first_name: res.data.first_name || '',
        last_name: res.data.last_name || '',
        email: res.data.email || '',
        phone_number: res.data.phone_number || '',
        telegram_username: res.data.telegram_username || '',
        photo_url: res.data.photo_url || '',
        contact_info: res.data.contact_info || '',
      });

      try {
        if (res.data.contact_info && res.data.contact_info.includes('days')) {
          setWorkingHours(JSON.parse(res.data.contact_info));
        }
      } catch(e) {}
      
      // Fetch training types
      try {
          const tRes = await import('@/lib/api').then(m => m.trainingTypesApi.list());
          setTypes(tRes.data);
      } catch {}
      
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileAndTypes();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      // Assuming api endpoints for update support these fields.
      // If backend update route hasn't been updated, we must be careful. Let's just pass what we can.
      const res = await userApi.updateMe(form as any);
      setProfile((prev: any) => ({ ...prev, ...form }));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleAddType = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        const tApi = (await import('@/lib/api')).trainingTypesApi;
        await tApi.create(newType);
        fetchProfileAndTypes();
        setNewType({ name: '', duration_minutes: 60, cost: 0 });
    } catch (e: any) {
        setError(e.response?.data?.detail || 'Failed to add training type');
    }
  };
  
  const handleDeleteType = async (id: number) => {
    try {
        const tApi = (await import('@/lib/api')).trainingTypesApi;
        await tApi.delete(id);
        fetchProfileAndTypes();
    } catch (e) {}
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading profile...</div>;

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '100px' }}>
      <header style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '8px' }}>Settings</h1>
        <p style={{ color: 'rgba(255, 255, 255, 0.5)' }}>Manage your profile and services.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 1fr) 2fr', gap: '24px', alignItems: 'start' }}>
        {/* Avatar card */}
        <GlassCard style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 700, overflow: 'hidden' }}>
            {profile?.photo_url ? (
              <img src={profile.photo_url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              (profile?.first_name || profile?.full_name || 'U').charAt(0).toUpperCase()
            )}
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontWeight: 700, fontSize: '1.2rem' }}>{[profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || profile?.full_name || 'Unknown'}</p>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>{profile?.email}</p>
          </div>
          <span style={{ padding: '4px 16px', borderRadius: '20px', fontSize: '0.8rem', background: 'rgba(59,130,246,0.1)', color: 'var(--primary)', border: '1px solid rgba(59,130,246,0.2)', textTransform: 'capitalize' }}>
            {profile?.role === 'coach' ? 'Trainer' : 'Client'}
          </span>
        </GlassCard>

        {/* Edit form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <GlassCard>
            <h3 style={{ fontWeight: 600, marginBottom: '24px' }}>Edit Profile</h3>
            {error && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', padding: '10px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem' }}>
                {error}
              </div>
            )}
            {saved && (
              <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#10b981', padding: '10px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={16} /> Profile updated successfully
              </div>
            )}
            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>First Name</label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
                    <input type="text" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                      style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', borderRadius: '10px', padding: '10px 14px 10px 40px', color: 'white', outline: 'none' }} />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>Last Name</label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
                    <input type="text" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                      style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', borderRadius: '10px', padding: '10px 14px 10px 40px', color: 'white', outline: 'none' }} />
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>Email Address</label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
                      <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                        style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', borderRadius: '10px', padding: '10px 14px 10px 40px', color: 'white', outline: 'none' }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>Phone Number</label>
                    <div style={{ position: 'relative' }}>
                      <Phone size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
                      <input type="text" value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
                        style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', borderRadius: '10px', padding: '10px 14px 10px 40px', color: 'white', outline: 'none' }} />
                    </div>
                  </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>Telegram Username</label>
                <input type="text" placeholder="@username" value={form.telegram_username} onChange={(e) => setForm({ ...form, telegram_username: e.target.value })}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', borderRadius: '10px', padding: '10px 14px', color: 'white', outline: 'none' }} />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>Profile Photo</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {form.photo_url ? (
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '1px solid var(--card-border)' }}>
                           <img src={form.photo_url} alt="Profile preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                    ) : (
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--card-border)' }}>
                           <User size={20} opacity={0.4} />
                        </div>
                    )}
                    <label style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(59,130,246,0.1)', color: 'var(--primary)', padding: '10px 16px', borderRadius: '12px', fontWeight: 600, fontSize: '0.85rem', border: '1px solid rgba(59,130,246,0.2)', transition: 'var(--transition)' }}>
                        <Upload size={16} />
                        {fileName ? 'Change Photo' : 'Upload File'}
                        <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                    </label>
                    <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', maxWidth: '120px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {fileName || 'No file selected'}
                    </span>
                </div>
              </div>

              {profile?.role === 'coach' && (
                <div style={{ background: 'rgba(0,0,0,0.1)', padding: '16px', borderRadius: '16px', border: '1px solid var(--card-border)' }}>
                  <label style={{ display: 'block', marginBottom: '16px', fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>Working Hours / Schedule</label>
                  
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
                        const isActive = workingHours.days.includes(day);
                        return (
                            <button type="button" key={day} onClick={() => toggleDay(day)}
                               style={{ padding: '8px 12px', borderRadius: '8px', border: isActive ? '1px solid var(--primary)' : '1px solid var(--card-border)', background: isActive ? 'var(--primary)' : 'transparent', color: isActive ? 'white' : 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: isActive ? 600 : 400, transition: 'var(--transition)' }}>
                                {day}
                            </button>
                        )
                    })}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', maxWidth: '300px' }}>
                     <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Start Time</label>
                        <input type="time" value={workingHours.start} onChange={(e) => setWorkingHours({...workingHours, start: e.target.value})}
                          style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', borderRadius: '10px', padding: '10px 14px', color: 'white', outline: 'none', colorScheme: 'dark' }} />
                     </div>
                     <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>End Time</label>
                        <input type="time" value={workingHours.end} onChange={(e) => setWorkingHours({...workingHours, end: e.target.value})}
                          style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', borderRadius: '10px', padding: '10px 14px', color: 'white', outline: 'none', colorScheme: 'dark' }} />
                     </div>
                  </div>
                </div>
              )}

              <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }} disabled={saving}>
                <Save size={18} />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </GlassCard>

          {profile?.role === 'coach' && (
              <GlassCard>
                  <h3 style={{ fontWeight: 600, marginBottom: '8px' }}>Training Types & Costs</h3>
                  <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', marginBottom: '24px' }}>Define your service offerings to easily select them during scheduling and have income auto-calculated.</p>
                  
                  {types.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                          {types.map(t => (
                              <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--card-border)' }}>
                                  <div>
                                      <p style={{ fontWeight: 600 }}>{t.name}</p>
                                      <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>{t.duration_minutes} min</p>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                      <span style={{ fontWeight: 700, color: '#10b981' }}>{t.cost} UAH</span>
                                      <button onClick={() => handleDeleteType(t.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.9rem' }}>Delete</button>
                                  </div>
                              </div>
                          ))}
                      </div>
                  )}

                  <form onSubmit={handleAddType} style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '16px' }}>Add New Type</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(120px, 2fr) 1fr 1fr auto', gap: '12px', alignItems: 'end' }}>
                          <div>
                              <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '6px', opacity: 0.6 }}>Title</label>
                              <input type="text" required value={newType.name} onChange={e => setNewType({...newType, name: e.target.value})} placeholder="e.g. Individual" style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', borderRadius: '8px', padding: '8px 12px', color: 'white', outline: 'none' }} />
                          </div>
                          <div>
                              <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '6px', opacity: 0.6 }}>Time (min)</label>
                              <input type="number" required min={1} value={newType.duration_minutes} onChange={e => setNewType({...newType, duration_minutes: parseInt(e.target.value)})} style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', borderRadius: '8px', padding: '8px 12px', color: 'white', outline: 'none' }} />
                          </div>
                          <div>
                              <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '6px', opacity: 0.6 }}>Cost (UAH)</label>
                              <input type="number" required min={0} value={newType.cost} onChange={e => setNewType({...newType, cost: parseFloat(e.target.value)})} style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', borderRadius: '8px', padding: '8px 12px', color: 'white', outline: 'none' }} />
                          </div>
                          <button type="submit" className="btn btn-secondary" style={{ height: '37px' }}>Add</button>
                      </div>
                  </form>
              </GlassCard>
          )}

        </div>
      </div>
    </div>
  );
}
