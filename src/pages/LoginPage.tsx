import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { supabase } from '../lib/supabaseClient';
import Loader from '@/components/ui/Loader';
import logo from '@/assets/logo.png';

const EyeIcon = ({ open }: { open: boolean }) => (
  open ? (
    <svg
      width="16"
      height="16"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      className="transition-all duration-150"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"
      />
      <circle
        cx="12"
        cy="12"
        r="3"
        stroke="currentColor"
        strokeWidth={2}
        fill="white"
      />
    </svg>
  ) : (
    <svg
      width="16"
      height="16"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      className="transition-all duration-150"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17.94 17.94A10.97 10.97 0 0112 19c-7 0-11-7-11-7a21.77 21.77 0 014.22-5.94M9.88 9.88A3 3 0 0112 9c1.66 0 3 1.34 3 3 0 .53-.14 1.03-.38 1.46"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M1 1l22 22"
      />
    </svg>
  )
);

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [notMember, setNotMember] = useState(false);
  const [showLoginLoader, setShowLoginLoader] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setNotMember(false);
    try {
      let result;
      if (mode === 'login') {
        result = await supabase.auth.signInWithPassword({ email, password });
      } else {
        result = await supabase.auth.signUp({ email, password });
        if (result.data?.user) {
          if (!result.data.user.confirmed_at) {
            navigate('/confirm-email');
            setLoading(false);
            return;
          }
        }
      }
      if (result.error) {
        setError(result.error.message);
      } else {
        const user = result.data?.user || (await supabase.auth.getUser()).data.user;
        if (user) {
          sessionStorage.setItem('userId', user.id);
          const { data: profile } = await supabase
            .from('profiles')
            .select('plan')
            .eq('id', user.id)
            .single();
          setShowLoginLoader(true);
          setTimeout(() => {
            setFadeOut(true);
            setTimeout(() => {
              if (profile && profile.plan && profile.plan !== 'no') {
                navigate('/');
              } else {
                navigate('/pricing');
              }
            }, 600);
          }, 3000);
          return;
        } else {
          setNotMember(true);
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (showLoginLoader) {
    return (
      <div className={`fixed inset-0 z-50 flex items-center justify-center bg-white transition-opacity duration-700 ${fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-300">
      <div className="flex flex-col items-center w-full">
        <img src={logo} alt="AgentOS Logo" className="w-24 h-24 mb-1 drop-shadow-xl" style={{objectFit: 'contain'}} />
        <h1 className="text-5xl font-extrabold text-neutral-900 mb-2 tracking-tight text-center" style={{letterSpacing: '-0.04em'}}>AgentOS</h1>
        <p className="text-lg text-neutral-500 mb-8 text-center max-w-md">Your AI-powered business dashboard</p>
        <form
          onSubmit={handleSubmit}
          className="bg-white/90 shadow-2xl rounded-3xl p-10 w-full max-w-md flex flex-col gap-7 border border-neutral-200 backdrop-blur-md"
        >
          <h2 className="text-3xl font-bold text-center text-neutral-900 mb-2 tracking-tight">
            {mode === 'login' ? 'Sign In' : 'Sign Up'}
          </h2>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email" className="text-neutral-700">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
              placeholder="you@email.com"
              className="bg-white border border-neutral-300 text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900"
            />
          </div>
          <div className="flex flex-col gap-2 relative">
            <Label htmlFor="password" className="text-neutral-700">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="bg-white border border-neutral-300 text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 pr-10"
              />
              <button
                type="button"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-transparent border-none outline-none cursor-pointer flex items-center justify-center"
                style={{ height: 24, width: 24 }}
                onClick={() => setShowPassword((v) => !v)}
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>
          </div>
          {error && <div className="text-neutral-900 bg-neutral-200 border border-neutral-400 rounded px-3 py-2 text-sm text-center font-semibold">{error}</div>}
          {notMember && (
            <div className="text-neutral-900 bg-neutral-200 border border-neutral-400 rounded px-3 py-2 text-sm text-center font-semibold mb-2">
              You are not a member. Please subscribe.
            </div>
          )}
          <Button type="submit" className="w-full bg-neutral-900 text-white font-bold py-2 rounded-lg hover:bg-neutral-800 transition shadow-md" disabled={loading}>
            {loading ? (mode === 'login' ? 'Signing In...' : 'Signing Up...') : (mode === 'login' ? 'Sign In' : 'Sign Up')}
          </Button>
          <div className="text-center text-sm text-neutral-500">
            {mode === 'login' ? (
              <>
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  className="text-neutral-900 font-semibold hover:underline"
                  onClick={() => setMode('signup')}
                >
                  Sign Up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  className="text-neutral-900 font-semibold hover:underline"
                  onClick={() => setMode('login')}
                >
                  Sign In
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage; 