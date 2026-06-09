'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Lock, Mail } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/index';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      if (data.session) {
        router.push('/');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F172A] p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-sky-500/10 blur-[120px]" />
        <div className="absolute bottom-[0%] right-[0%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[100px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="h-32 w-32 mx-auto rounded-3xl bg-white flex items-center justify-center mb-6 shadow-xl shadow-sky-500/20 p-2 border border-white/20">
            <img src="/logo.jpg" alt="Uzury Empowerment Hub" className="h-full w-full object-contain mix-blend-multiply" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Uzury Platform</h1>
          <p className="text-slate-400 mt-2">Admin Login Portal</p>
        </div>

        <div className="glass-card rounded-2xl border border-white/10 p-8 shadow-2xl backdrop-blur-xl bg-white/[0.02]">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  type="email"
                  className="form-input pl-10 py-2.5 w-full bg-white/5 border-white/10 focus:border-sky-500/50"
                  placeholder="admin@uzury.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  type="password"
                  className="form-input pl-10 py-2.5 w-full bg-white/5 border-white/10 focus:border-sky-500/50"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400 text-center">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full py-3 mt-2 text-sm font-semibold" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {loading ? 'Authenticating…' : 'Sign In'}
            </Button>
          </form>
        </div>
        
        <p className="text-center text-xs text-slate-500 mt-8">
          © {new Date().getFullYear()} All rights reserved Meru Tech and Innovation Hub
        </p>
      </div>
    </div>
  );
}
