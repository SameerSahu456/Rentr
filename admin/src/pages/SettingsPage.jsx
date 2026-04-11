import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'motion/react';
import { User, Shield, Bell, Palette, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../services/api';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.23, 1, 0.32, 1] } },
};

export default function SettingsPage() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [notifications, setNotifications] = useState({
    new_ticket: true,
    invoice_overdue: true,
    payment_received: true,
    contract_expiring: true,
  });

  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success'|'error', message }

  const showFeedback = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      await api.put('/auth/profile', profileForm);
      showFeedback('success', 'Profile updated successfully');
    } catch (err) {
      showFeedback('error', err.message || 'Failed to update profile');
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      showFeedback('error', 'Passwords do not match');
      return;
    }
    if (passwordForm.new_password.length < 6) {
      showFeedback('error', 'Password must be at least 6 characters');
      return;
    }
    setPasswordSaving(true);
    try {
      await api.put('/auth/password', {
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      });
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
      showFeedback('success', 'Password updated successfully');
    } catch (err) {
      showFeedback('error', err.message || 'Failed to update password');
    } finally {
      setPasswordSaving(false);
    }
  };

  const inputClass = "w-full bg-foreground/[0.02] border border-foreground/[0.06] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rentr-primary/30 focus:ring-4 focus:ring-rentr-primary/5 transition-all placeholder:text-foreground/15 text-foreground";

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8 max-w-2xl">
      <motion.div variants={item}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-2 h-2 rounded-full bg-rentr-primary" />
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-foreground/40">Account Settings</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-brand font-black tracking-tighter text-foreground uppercase">Settings</h1>
      </motion.div>

      {/* Feedback Banner */}
      {feedback && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
              : 'bg-red-500/10 border border-red-500/20 text-red-400'
          }`}
        >
          {feedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {feedback.message}
        </motion.div>
      )}

      {/* Profile */}
      <motion.div variants={item} className="bg-card/50 rounded-2xl border border-foreground/[0.06] backdrop-blur-sm p-6">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-foreground/[0.04]">
          <div className="w-10 h-10 rounded-lg bg-rentr-primary/10 flex items-center justify-center">
            <User size={20} className="text-rentr-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Profile</h2>
            <p className="text-xs text-foreground/40">Manage your account details</p>
          </div>
        </div>

        <form onSubmit={handleProfileSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/30 mb-2">Name</label>
              <input
                type="text"
                value={profileForm.name}
                onChange={(e) => setProfileForm((f) => ({ ...f, name: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/30 mb-2">Email</label>
              <input
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm((f) => ({ ...f, email: e.target.value }))}
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/30 mb-2">Role</label>
            <input
              type="text"
              value={user?.role || 'admin'}
              disabled
              className="w-full border border-foreground/[0.06] rounded-xl px-4 py-3 text-sm bg-foreground/[0.02] text-foreground/40 cursor-not-allowed"
            />
          </div>
          <button
            type="submit"
            disabled={profileSaving}
            className="group flex items-center gap-2 px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.15em] bg-foreground text-background rounded-xl border border-foreground/10 hover:bg-rentr-primary hover:text-white hover:border-rentr-primary/30 transition-all duration-500 disabled:opacity-50"
          >
            {profileSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </motion.div>

      {/* Security */}
      <motion.div variants={item} className="bg-card/50 rounded-2xl border border-foreground/[0.06] backdrop-blur-sm p-6">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-foreground/[0.04]">
          <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
            <Shield size={20} className="text-orange-500" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Security</h2>
            <p className="text-xs text-foreground/40">Update your password</p>
          </div>
        </div>

        <form onSubmit={handlePasswordSave} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/30 mb-2">Current Password</label>
            <input
              type="password"
              required
              value={passwordForm.current_password}
              onChange={(e) => setPasswordForm((f) => ({ ...f, current_password: e.target.value }))}
              className={inputClass}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/30 mb-2">New Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={passwordForm.new_password}
                onChange={(e) => setPasswordForm((f) => ({ ...f, new_password: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/30 mb-2">Confirm Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={passwordForm.confirm_password}
                onChange={(e) => setPasswordForm((f) => ({ ...f, confirm_password: e.target.value }))}
                className={inputClass}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={passwordSaving}
            className="group flex items-center gap-2 px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.15em] bg-foreground text-background rounded-xl border border-foreground/10 hover:bg-rentr-primary hover:text-white hover:border-rentr-primary/30 transition-all duration-500 disabled:opacity-50"
          >
            {passwordSaving ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </motion.div>

      {/* Appearance */}
      <motion.div variants={item} className="bg-card/50 rounded-2xl border border-foreground/[0.06] backdrop-blur-sm p-6">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-foreground/[0.04]">
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
            <Palette size={20} className="text-purple-500" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Appearance</h2>
            <p className="text-xs text-foreground/40">Customize the admin panel look</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-foreground">Theme</p>
            <p className="text-xs text-foreground/40 mt-0.5">Toggle between light and dark mode</p>
          </div>
          <button
            onClick={toggleTheme}
            className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${
              theme === 'dark' ? 'bg-rentr-primary' : 'bg-foreground/10'
            }`}
          >
            <div
              className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-transform duration-300 ${
                theme === 'dark' ? 'translate-x-7' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
      </motion.div>

      {/* Notifications */}
      <motion.div variants={item} className="bg-card/50 rounded-2xl border border-foreground/[0.06] backdrop-blur-sm p-6">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-foreground/[0.04]">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <Bell size={20} className="text-blue-500" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Notifications</h2>
            <p className="text-xs text-foreground/40">Configure email alerts</p>
          </div>
        </div>

        <div className="space-y-4">
          {[
            { key: 'new_ticket', label: 'New support ticket', desc: 'Get notified when a new ticket is created' },
            { key: 'invoice_overdue', label: 'Invoice overdue', desc: 'Alert when an invoice passes its due date' },
            { key: 'payment_received', label: 'Payment received', desc: 'Notify on successful payment collection' },
            { key: 'contract_expiring', label: 'Contract expiring', desc: 'Alert before contract renewal date' },
          ].map((opt) => (
            <label key={opt.key} className="flex items-center justify-between cursor-pointer group py-1">
              <div>
                <span className="text-sm text-foreground group-hover:text-foreground/80 transition-colors">{opt.label}</span>
                <p className="text-[10px] text-foreground/25 mt-0.5">{opt.desc}</p>
              </div>
              <button
                type="button"
                onClick={() => setNotifications((n) => ({ ...n, [opt.key]: !n[opt.key] }))}
                className={`relative w-11 h-6 rounded-full transition-colors duration-300 shrink-0 ${
                  notifications[opt.key] ? 'bg-rentr-primary' : 'bg-foreground/10'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${
                    notifications[opt.key] ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </label>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
