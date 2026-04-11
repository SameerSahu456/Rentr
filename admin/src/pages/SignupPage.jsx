import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { Logo } from '../components/Logo';
import { ArrowRight, UserPlus, User, Lock, Mail } from 'lucide-react';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await signup({ name, email, password });
      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 grid-lines relative overflow-hidden bg-background text-foreground">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-rentr-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rentr-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <div className="flex flex-col items-center mb-12">
          <Logo size="lg" showTagline className="mb-8" />
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-[10px] font-bold uppercase tracking-[0.4em] text-foreground/40"
          >
            Create Your Account
          </motion.h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-widest rounded-2xl px-4 py-3 text-center">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20 group-focus-within:text-rentr-primary transition-colors" />
              <input
                type="text"
                placeholder="FULL NAME"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-foreground/[0.02] border border-foreground/[0.05] rounded-2xl py-4 pl-12 pr-4 text-[10px] font-bold tracking-[0.2em] focus:outline-none focus:border-rentr-primary/50 focus:ring-4 focus:ring-rentr-primary/5 transition-all placeholder:text-foreground/10"
              />
            </div>

            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20 group-focus-within:text-rentr-primary transition-colors" />
              <input
                type="email"
                placeholder="EMAIL"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-foreground/[0.02] border border-foreground/[0.05] rounded-2xl py-4 pl-12 pr-4 text-[10px] font-bold tracking-[0.2em] focus:outline-none focus:border-rentr-primary/50 focus:ring-4 focus:ring-rentr-primary/5 transition-all placeholder:text-foreground/10"
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20 group-focus-within:text-rentr-primary transition-colors" />
              <input
                type="password"
                placeholder="PASSWORD"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-foreground/[0.02] border border-foreground/[0.05] rounded-2xl py-4 pl-12 pr-4 text-[10px] font-bold tracking-[0.2em] focus:outline-none focus:border-rentr-primary/50 focus:ring-4 focus:ring-rentr-primary/5 transition-all placeholder:text-foreground/10"
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20 group-focus-within:text-rentr-primary transition-colors" />
              <input
                type="password"
                placeholder="CONFIRM PASSWORD"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full bg-foreground/[0.02] border border-foreground/[0.05] rounded-2xl py-4 pl-12 pr-4 text-[10px] font-bold tracking-[0.2em] focus:outline-none focus:border-rentr-primary/50 focus:ring-4 focus:ring-rentr-primary/5 transition-all placeholder:text-foreground/10"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full group flex items-center justify-center gap-3 py-4 rounded-2xl bg-foreground text-background text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-rentr-primary hover:text-white transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden relative"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          <p className="text-center text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/20">
            Already have an account?{' '}
            <Link to="/login" className="text-rentr-primary hover:text-rentr-primary-light transition-colors">
              Sign In
            </Link>
          </p>
        </form>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-12 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/20"
        >
          &copy; 2026 RENTR ENTERPRISE. ALL RIGHTS RESERVED.
        </motion.p>
      </motion.div>
    </div>
  );
}
