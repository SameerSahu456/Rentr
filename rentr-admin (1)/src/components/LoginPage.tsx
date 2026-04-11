import React, { useState } from "react";
import { motion } from "motion/react";
import { Logo } from "./Logo";
import { ArrowRight, User, Lock, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

export function LoginPage({ onLogin }: { onLogin: (user: string) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate luxury loading
    setTimeout(() => {
      onLogin(username);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 grid-lines relative overflow-hidden">
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
            Secure Admin Access
          </motion.h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20 group-focus-within:text-rentr-primary transition-colors" />
              <input 
                type="text" 
                placeholder="USERNAME" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full bg-foreground/[0.02] border border-foreground/[0.05] rounded-2xl py-4 pl-12 pr-4 text-[10px] font-bold tracking-[0.2em] focus:outline-none focus:border-rentr-primary/50 focus:ring-4 focus:ring-rentr-primary/5 transition-all placeholder:text-foreground/10"
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20 group-focus-within:text-rentr-primary transition-colors" />
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="PASSWORD" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-foreground/[0.02] border border-foreground/[0.05] rounded-2xl py-4 pl-12 pr-12 text-[10px] font-bold tracking-[0.2em] focus:outline-none focus:border-rentr-primary/50 focus:ring-4 focus:ring-rentr-primary/5 transition-all placeholder:text-foreground/10"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/20 hover:text-foreground/40 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between px-2">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" className="w-4 h-4 rounded border-foreground/10 bg-transparent text-rentr-primary focus:ring-rentr-primary/20" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 group-hover:text-foreground/60 transition-colors">Remember me</span>
            </label>
            <button type="button" className="text-[10px] font-bold uppercase tracking-widest text-rentr-primary hover:text-rentr-primary-light transition-colors">Forgot Password?</button>
          </div>

          <button 
            disabled={isLoading}
            className="w-full group flex items-center justify-center gap-3 py-4 rounded-2xl bg-foreground text-background text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-rentr-primary hover:text-white transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden relative"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-12 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/20"
        >
          © 2026 RENTR ENTERPRISE. ALL RIGHTS RESERVED.
        </motion.p>
      </motion.div>
    </div>
  );
}
