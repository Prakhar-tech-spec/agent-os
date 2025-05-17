import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import TaskPage from "./pages/TaskPage";
import SchedulePage from "./pages/SchedulePage";
import HiringPage from "./pages/HiringPage";
import MyToolsPage from "@/pages/MyToolsPage";
import AIAssistantPage from "@/pages/AIAssistantPage";
import SmartFinancesPage from "./pages/SmartFinancesPage";
import LoginPage from "./pages/LoginPage";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import ConfirmEmailPage from "./pages/ConfirmEmailPage";
import { Button } from "@/components/ui/button";
import SettingsPage from "./pages/SettingsPage";
import Loader from "@/components/ui/Loader";

const queryClient = new QueryClient();

function TrialEndedOverlay() {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: 9999,
      backdropFilter: 'blur(8px)',
      background: 'rgba(255,255,255,0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.95)',
        borderRadius: '1.5rem',
        boxShadow: '0 4px 32px rgba(0,0,0,0.10)',
        padding: '3rem 2.5rem',
        textAlign: 'center',
        maxWidth: 400,
      }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem', color: '#111' }}>Free Trial Ended</h2>
        <p style={{ color: '#444', fontSize: '1.1rem', marginBottom: '2rem' }}>
          Your 7-day free trial has ended.<br />Please upgrade your plan to continue using AgentOS.
        </p>
        <a href="/pricing" style={{
          display: 'inline-block',
          background: '#111',
          color: '#fff',
          borderRadius: '0.75rem',
          padding: '0.75rem 2rem',
          fontWeight: 700,
          fontSize: '1rem',
          textDecoration: 'none',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}>Go to Pricing</a>
      </div>
    </div>
  );
}

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [plan, setPlan] = useState<string | null>(null);
  const [freeTrialEndsAt, setFreeTrialEndsAt] = useState<string | null>(null);
  const location = useLocation();
  const [trialExpired, setTrialExpired] = useState(false);
  const [paidExpired, setPaidExpired] = useState(false);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const justLoggedIn = typeof window !== 'undefined' && sessionStorage.getItem('justLoggedIn') === 'true';

  useEffect(() => {
    const timer = setTimeout(() => setMinTimeElapsed(true), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let ignore = false;
    async function checkAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setAuthenticated(false);
          setLoading(false);
          return;
        }
        setAuthenticated(true);
        // Fetch profile
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('plan, free_trial_ends_at')
          .eq('id', session.user.id)
          .single();
        if (!ignore) {
          if (!profile) {
            await supabase.auth.signOut();
            setPlan('deleted');
            setFreeTrialEndsAt(null);
            setLoading(false);
            return;
          } else {
            setPlan(profile.plan ?? 'no');
            setFreeTrialEndsAt(profile.free_trial_ends_at ?? null);
            setLoading(false);
            // Check for expired trial or plan
            if (profile.plan === 'free' && profile.free_trial_ends_at && new Date() > new Date(profile.free_trial_ends_at)) {
              setTrialExpired(true);
              setPaidExpired(false);
            } else if ((profile.plan === 'starter' || profile.plan === 'pro') && profile.free_trial_ends_at) {
              // Paid plan: block after 30 days from free_trial_ends_at
              const paidEnd = new Date(profile.free_trial_ends_at);
              paidEnd.setDate(paidEnd.getDate() + 23); // 7+23=30 days
              if (new Date() > paidEnd) {
                setPaidExpired(true);
                setTrialExpired(false);
              } else {
                setPaidExpired(false);
                setTrialExpired(false);
              }
            } else {
              setTrialExpired(false);
              setPaidExpired(false);
            }
          }
        }
      } catch (err) {
        setAuthenticated(false);
        setLoading(false);
      }
    }
    checkAuth();
    return () => { ignore = true; };
  }, []);

  if ((loading || !minTimeElapsed) && !justLoggedIn) return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-neutral-100 to-blue-50">
      <Loader />
    </div>
  );
  if (!authenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  if (plan === 'deleted') return <Navigate to="/login" replace />;
  if (plan === 'no') return <Navigate to="/pricing" replace />;
  // If trial expired, show overlay
  if (plan === 'free' && trialExpired) {
    return <>
      {children}
      <TrialEndedOverlay />
    </>;
  }
  // If paid plan expired, show overlay
  if ((plan === 'starter' || plan === 'pro') && paidExpired) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9999,
        backdropFilter: 'blur(8px)',
        background: 'rgba(255,255,255,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          borderRadius: '1.5rem',
          boxShadow: '0 4px 32px rgba(0,0,0,0.10)',
          padding: '3rem 2.5rem',
          textAlign: 'center',
          maxWidth: 400,
        }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem', color: '#111' }}>Plan Expired</h2>
          <p style={{ color: '#444', fontSize: '1.1rem', marginBottom: '2rem' }}>
            Your {plan} plan has expired after 30 days.<br />Please renew your subscription to continue using AgentOS.
          </p>
          <a href="/pricing" style={{
            display: 'inline-block',
            background: '#111',
            color: '#fff',
            borderRadius: '0.75rem',
            padding: '0.75rem 2rem',
            fontWeight: 700,
            fontSize: '1rem',
            textDecoration: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          }}>Go to Pricing</a>
        </div>
      </div>
    );
  }
  if (justLoggedIn) {
    sessionStorage.removeItem('justLoggedIn');
  }
  return <>{children}</>;
}

function PricingPage() {
  const [billing, setBilling] = React.useState<'monthly' | 'annual'>('monthly');
  const [plan, setPlan] = React.useState<string | null>(null);
  const [freeTrialEndsAt, setFreeTrialEndsAt] = React.useState<string | null>(null);
  const [trialError, setTrialError] = React.useState<string | null>(null);
  const [trialExpired, setTrialExpired] = React.useState(false);

  React.useEffect(() => {
    async function checkPlan() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('plan, free_trial_ends_at')
          .eq('id', session.user.id)
          .single();
        if (profile) {
          setPlan(profile.plan);
          setFreeTrialEndsAt(profile.free_trial_ends_at);
          if (['pro', 'starter', 'free'].includes(profile.plan)) {
            window.location.replace('/');
          }
        } else {
          setPlan('no');
        }
      }
    }
    checkPlan();
  }, []);

  React.useEffect(() => {
    if (sessionStorage.getItem('trialExpired')) {
      setTrialExpired(true);
      sessionStorage.removeItem('trialExpired');
    }
  }, []);

  // Robust "Get started for free" logic
  const handleFreeTrial = async () => {
    setTrialError(null);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      window.location.replace('/login');
      return;
    }
    // Check if profile exists
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('plan, free_trial_ends_at')
      .eq('id', session.user.id)
      .single();
    if (!profile) {
      // Create profile if missing
      const trialEnd = new Date();
      trialEnd.setDate(trialEnd.getDate() + 7);
      const { error: insertError } = await supabase.from('profiles').insert([
        { id: session.user.id, plan: 'free', free_trial_ends_at: trialEnd.toISOString() }
      ]);
      if (insertError) {
        setTrialError('Could not start free trial. Please try again.');
        return;
      }
      window.location.replace('/');
      return;
    }
    if (profile.plan !== 'no') {
      setTrialError('You have already used your free trial or have an active plan.');
      return;
    }
    // Set plan = 'free' and set free_trial_ends_at
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 7);
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ plan: 'free', free_trial_ends_at: trialEnd.toISOString() })
      .eq('id', session.user.id);
    if (updateError) {
      setTrialError('Could not start free trial. Please try again.');
      return;
    }
    window.location.replace('/');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-300 py-12 px-2">
      <div className="w-full max-w-3xl mx-auto text-center mb-10">
        <h1 className="text-4xl font-extrabold mb-2 tracking-tight text-neutral-900">Plans and Pricing</h1>
        <p className="text-neutral-500 mb-6">Choose the plan that fits your needs. Save more with annual billing!</p>
        <div className="inline-flex items-center bg-neutral-200 rounded-lg p-1 mb-2">
          <button
            className={`px-4 py-1 rounded-lg font-semibold transition-all ${billing === 'monthly' ? 'bg-white shadow text-neutral-900' : 'text-neutral-500'}`}
            onClick={() => setBilling('monthly')}
          >
            Monthly
          </button>
          <button
            className={`px-4 py-1 rounded-lg font-semibold transition-all ${billing === 'annual' ? 'bg-white shadow text-neutral-900' : 'text-neutral-500'}`}
            onClick={() => setBilling('annual')}
          >
            Annual <span className="ml-1 text-xs bg-neutral-300 text-neutral-700 px-2 py-0.5 rounded-full font-bold">Save 20%</span>
          </button>
        </div>
      </div>
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Free Plan */}
        <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 flex flex-col items-center p-8 transition-all">
          <h3 className="text-lg font-bold mb-2 text-neutral-800">Free</h3>
          <div className="text-4xl font-extrabold mb-1 text-neutral-900">$0</div>
          <div className="text-xs text-neutral-400 mb-4">Per user/month</div>
          <ul className="mb-8 text-neutral-700 text-sm space-y-2 w-full text-left">
            <li className="flex items-center gap-2"><span className="inline-block w-4 h-4 rounded-full bg-neutral-900 text-white flex items-center justify-center text-xs">✓</span> Full access for 7 days</li>
            <li className="flex items-center gap-2"><span className="inline-block w-4 h-4 rounded-full bg-neutral-900 text-white flex items-center justify-center text-xs">✓</span> No credit card required</li>
            <li className="flex items-center gap-2"><span className="inline-block w-4 h-4 rounded-full bg-neutral-900 text-white flex items-center justify-center text-xs">✓</span> Cancel anytime</li>
          </ul>
          <Button onClick={handleFreeTrial}>
            Get started for free
          </Button>
          {trialError && (
            <div className="text-neutral-900 bg-neutral-200 border border-neutral-400 rounded px-3 py-2 text-sm text-center font-semibold mt-2">
              {trialError}
            </div>
          )}
        </div>
        {/* Starter Plan */}
        <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 flex flex-col items-center p-8 transition-all">
          <h3 className="text-lg font-bold mb-2 text-neutral-800">Starter</h3>
          <div className="text-4xl font-extrabold mb-1 text-neutral-900">${billing === 'annual' ? 32 : 39}<span className="text-base font-medium">/mo</span></div>
          <div className="text-xs text-neutral-400 mb-4">Billed {billing === 'annual' ? 'annually' : 'monthly'}</div>
          <ul className="mb-8 text-neutral-700 text-sm space-y-2 w-full text-left">
            <li className="flex items-center gap-2"><span className="inline-block w-4 h-4 rounded-full bg-neutral-900 text-white flex items-center justify-center text-xs">✓</span> Access to core features</li>
            <li className="flex items-center gap-2"><span className="inline-block w-4 h-4 rounded-full bg-neutral-900 text-white flex items-center justify-center text-xs">✓</span> Email support</li>
            <li className="flex items-center gap-2"><span className="inline-block w-4 h-4 rounded-full bg-neutral-900 text-white flex items-center justify-center text-xs">✓</span> Basic analytics</li>
          </ul>
          <button className="w-full border border-neutral-900 text-neutral-900 font-bold py-2 rounded-lg hover:bg-neutral-900 hover:text-white transition">Get Started</button>
        </div>
        {/* Pro Plan */}
        <div className="relative bg-neutral-900 rounded-2xl shadow-2xl border-2 border-neutral-900 flex flex-col items-center p-8 transition-all scale-105 z-10">
          <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white text-neutral-900 text-xs font-bold px-4 py-1 rounded-full shadow uppercase tracking-widest">Popular</span>
          <h3 className="text-lg font-bold mb-2 text-white">Pro</h3>
          <div className="text-4xl font-extrabold mb-1 text-white">${billing === 'annual' ? 49 : 59}<span className="text-base font-medium">/mo</span></div>
          <div className="text-xs text-neutral-300 mb-4">Billed {billing === 'annual' ? 'annually' : 'monthly'}</div>
          <ul className="mb-8 text-neutral-200 text-sm space-y-2 w-full text-left">
            <li className="flex items-center gap-2"><span className="inline-block w-4 h-4 rounded-full bg-white text-neutral-900 flex items-center justify-center text-xs">✓</span> Unlimited access to all features</li>
            <li className="flex items-center gap-2"><span className="inline-block w-4 h-4 rounded-full bg-white text-neutral-900 flex items-center justify-center text-xs">✓</span> Priority support</li>
            <li className="flex items-center gap-2"><span className="inline-block w-4 h-4 rounded-full bg-white text-neutral-900 flex items-center justify-center text-xs">✓</span> Advanced analytics</li>
            <li className="flex items-center gap-2"><span className="inline-block w-4 h-4 rounded-full bg-white text-neutral-900 flex items-center justify-center text-xs">✓</span> Team collaboration</li>
          </ul>
          <button className="w-full bg-white text-neutral-900 font-bold py-2 rounded-lg hover:bg-neutral-800 hover:text-white border border-white transition">Get Started with Pro</button>
        </div>
      </div>
      {trialExpired && (
        <div className="text-neutral-900 bg-neutral-200 border border-neutral-400 rounded px-3 py-2 text-sm text-center font-semibold mb-4">
          Your free trial has expired. Please subscribe to continue using the system.
        </div>
      )}
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Index />
              </PrivateRoute>
            }
          />
          <Route
            path="/employees"
            element={
              <PrivateRoute>
                <MyToolsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/schedule"
            element={
              <PrivateRoute>
                <SchedulePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/tasks"
            element={
              <PrivateRoute>
                <TaskPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/ai-assistant"
            element={
              <PrivateRoute>
                <AIAssistantPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/payroll"
            element={<NotFound />}
          />
          <Route
            path="/hiring"
            element={
              <PrivateRoute>
                <HiringPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/smart-finances"
            element={
              <PrivateRoute>
                <SmartFinancesPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <PrivateRoute>
                <SettingsPage />
              </PrivateRoute>
            }
          />
          <Route path="/confirm-email" element={<ConfirmEmailPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
