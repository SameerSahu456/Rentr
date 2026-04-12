import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function SettingsPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    company_name: user?.company_name || '',
    gstin: user?.gstin || '',
    pan: user?.pan || '',
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      await api.put('/auth/profile', form);
      setMsg('Profile updated successfully');
    } catch (err) {
      setMsg(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-xl">
      <h1 className="text-2xl font-brand font-bold text-gradient">Settings</h1>

      <div className="glass rounded-2xl p-6">
        <h2 className="text-sm font-bold font-brand mb-4">Profile</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-foreground/30 mb-1">Email</label>
            <input type="email" value={user?.email || ''} disabled
              className="w-full bg-foreground/[0.03] border border-foreground/[0.06] rounded-xl px-4 py-2.5 text-sm text-foreground/40" />
          </div>
          {['name', 'phone', 'company_name', 'gstin', 'pan'].map(field => (
            <div key={field}>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-foreground/30 mb-1">
                {field.replace('_', ' ')}
              </label>
              <input
                type="text"
                value={form[field]}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                className="w-full bg-foreground/[0.03] border border-foreground/[0.06] rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-rentr-primary/30"
              />
            </div>
          ))}
          {msg && <p className={`text-xs ${msg.includes('success') ? 'text-emerald-500' : 'text-red-400'}`}>{msg}</p>}
          <button type="submit" disabled={saving}
            className="bg-rentr-primary hover:bg-rentr-primary-light text-white text-xs font-bold uppercase tracking-widest px-6 py-2.5 rounded-xl transition-all disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      <div className="glass rounded-2xl p-6">
        <h2 className="text-sm font-bold font-brand mb-4">Account Info</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Credit Limit</p>
            <p className="font-bold">₹{(user?.credit_limit || 0).toLocaleString('en-IN')}</p>
          </div>
          <div>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Credit Used</p>
            <p className="font-bold">₹{(user?.credit_used || 0).toLocaleString('en-IN')}</p>
          </div>
          <div>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Commission Rate</p>
            <p className="font-bold">{user?.commission_rate || 0}%</p>
          </div>
          <div>
            <p className="text-[10px] text-foreground/25 uppercase tracking-widest">Member Since</p>
            <p className="font-bold">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
