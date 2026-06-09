'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#030712] p-4 font-sans selection:bg-sky-500/30 overflow-hidden relative">
      {/* Dynamic Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Sky orb */}
        <div className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-sky-500/5 blur-[120px] animate-[pulse_8s_ease-in-out_infinite]" />
        {/* Indigo orb */}
        <div className="absolute bottom-[0%] right-[0%] w-[60vw] h-[60vw] rounded-full bg-indigo-500/5 blur-[120px] animate-[pulse_10s_ease-in-out_infinite_alternate]" />
        {/* Subtle grid / noise overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]" />
      </div>

      <div className="w-full max-w-[420px] relative z-10 animate-in fade-in zoom-in-95 duration-1000 ease-out fill-mode-both">
        <div className="text-center mb-10">
          {/* Logo container with float animation */}
          <div className="h-28 w-28 mx-auto rounded-3xl bg-white flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(14,165,233,0.15)] p-1 border border-white/10 group animate-[bounce_4s_ease-in-out_infinite]">
            <img 
              src="/logo.jpg" 
              alt="Uzury Logo" 
              className="h-full w-full object-contain rounded-2xl group-hover:scale-105 transition-transform duration-700 ease-out" 
            />
          </div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-200 to-slate-500 tracking-tight mb-2 animate-in slide-in-from-bottom-4 fade-in duration-1000 delay-200 fill-mode-both">
            Uzury Hub
          </h1>
          <p className="text-xs text-sky-400 font-bold tracking-[0.2em] uppercase animate-in slide-in-from-bottom-4 fade-in duration-1000 delay-300 fill-mode-both">
            Admin Portal
          </p>
        </div>

        <div className="relative group">
          {/* Glowing border effect on hover */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-sky-500/20 to-indigo-500/20 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition duration-1000 group-hover:duration-300"></div>
          
          {/* Main Card */}
          <div className="relative rounded-[2rem] border border-white/5 p-8 shadow-2xl backdrop-blur-xl bg-white/[0.02] animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-500 fill-mode-both">
            <form onSubmit={handleLogin} className="space-y-6">
              
              <div className="space-y-2 relative group/input">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-2 transition-colors group-focus-within/input:text-sky-400">
                  Email Address
                </label>
                <input
                  type="email"
                  className="w-full px-5 py-4 bg-black/20 border border-white/5 rounded-2xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-sky-500/50 focus:border-sky-500/50 transition-all duration-300"
                  placeholder="admin@uzury.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2 relative group/input">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-2 transition-colors group-focus-within/input:text-sky-400">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="w-full pl-5 pr-20 py-4 bg-black/20 border border-white/5 rounded-2xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-sky-500/50 focus:border-sky-500/50 transition-all duration-300"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  {/* Text-based Show/Hide instead of Icon to prevent overlap and look premium */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-4 flex items-center justify-center text-[10px] font-bold tracking-widest text-slate-500 hover:text-sky-400 transition-colors duration-200"
                  >
                    {showPassword ? 'HIDE' : 'SHOW'}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-sm font-medium text-red-400 text-center animate-in zoom-in-95 duration-200">
                  {error}
                </div>
              )}

              <div className="pt-2">
                <button 
                  type="submit" 
                  className="relative w-full overflow-hidden rounded-2xl bg-white text-black font-extrabold text-sm py-4 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all duration-300 transform hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 disabled:opacity-70 disabled:hover:translate-y-0 disabled:active:scale-100 group/btn"
                  disabled={loading}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    {loading ? 'Authenticating...' : 'Sign In to Portal'}
                  </span>
                  {/* Button shine sweep effect */}
                  <div className="absolute top-0 -left-[100%] w-[120%] h-full bg-gradient-to-r from-transparent via-black/10 to-transparent skew-x-[30deg] group-hover/btn:left-[100%] transition-all duration-700 ease-out"></div>
                </button>
              </div>

            </form>
          </div>
        </div>
        
        <div className="text-center mt-12 animate-in fade-in duration-1000 delay-700 fill-mode-both">
          <p className="text-[11px] text-slate-500 uppercase tracking-[0.15em] font-bold">
            © {new Date().getFullYear()} Meru Tech & Innovation Hub
          </p>
          <p className="text-[9px] text-slate-600 mt-2 uppercase tracking-widest">
            All Rights Reserved
          </p>
        </div>
      </div>
    </div>
  );
}
