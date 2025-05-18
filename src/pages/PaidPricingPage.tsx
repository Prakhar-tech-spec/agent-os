import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const PaidPricingPage: React.FC = () => {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly');
  const [plan, setPlan] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function checkPlan() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('plan')
          .eq('id', session.user.id)
          .single();
        if (profile) {
          setPlan(profile.plan);
        }
      }
    }
    checkPlan();
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-300 py-12 px-2">
      <div className="absolute left-8 top-8">
        <button
          onClick={() => navigate('/')}
          className="text-neutral-600 hover:text-neutral-900 font-semibold text-base bg-white border border-neutral-200 rounded-full px-5 py-2 shadow-sm transition"
        >
          ← Back to Dashboard
        </button>
      </div>
      <div className="w-full max-w-3xl mx-auto text-center mb-10">
        <h1 className="text-4xl font-extrabold mb-2 tracking-tight text-neutral-900">Upgrade Your Plan</h1>
        <p className="text-neutral-500 mb-6">Choose a paid plan to unlock more features. Save more with annual billing!</p>
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
      <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Starter Plan */}
        <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 flex flex-col items-center p-8 transition-all min-h-[520px]">
          <h3 className="text-lg font-bold mb-2 text-neutral-800">Starter</h3>
          <div className="text-4xl font-extrabold mb-1 text-neutral-900">${billing === 'annual' ? 32 : 39}<span className="text-base font-medium">/mo</span></div>
          <div className="text-xs text-neutral-400 mb-4">Billed {billing === 'annual' ? 'annually' : 'monthly'}</div>
          <ul className="mb-8 text-neutral-700 text-sm space-y-2 w-full text-left list-disc pl-5 flex-1">
            <li>Up to 50 Schedules & 50 Tasks per month</li>
            <li>Pin 5 Favorite Tools for quick access</li>
            <li>1,000 AI Assistant chats monthly</li>
            <li>Includes Smart Finances & Closing Tracker</li>
            <li>Get Basic Reports & Email Support</li>
            <li>Easy upgrade to Pro anytime</li>
          </ul>
          <div className="flex-1" />
          <Button className="w-full bg-neutral-900 text-white font-bold py-2 rounded-lg hover:bg-neutral-800 border border-neutral-900 transition mt-auto">Get Started</Button>
        </div>
        {/* Pro Plan */}
        <div className="relative bg-neutral-900 rounded-2xl shadow-2xl border-2 border-neutral-900 flex flex-col items-center p-8 transition-all scale-105 z-10 min-h-[520px]">
          <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white text-neutral-900 text-xs font-bold px-4 py-1 rounded-full shadow uppercase tracking-widest">Popular</span>
          <h3 className="text-lg font-bold mb-2 text-white">Pro</h3>
          <div className="text-4xl font-extrabold mb-1 text-white">${billing === 'annual' ? 49 : 59}<span className="text-base font-medium">/mo</span></div>
          <div className="text-xs text-neutral-300 mb-4">Billed {billing === 'annual' ? 'annually' : 'monthly'}</div>
          <ul className="mb-8 text-neutral-200 text-sm space-y-2 w-full text-left list-disc pl-5 flex-1">
            <li>Unlimited Schedules & Tasks</li>
            <li>Pin unlimited Tools</li>
            <li>15,000 AI Assistant chats monthly</li>
            <li>Advanced Smart Finances & Closings Tracker</li>
            <li>Full Reports, Priority Support, & Team Collaboration</li>
            <li>Custom Branding & Automation</li>
            <li>Downgrade or cancel anytime</li>
          </ul>
          <div className="flex-1" />
          <Button className="w-full bg-white text-neutral-900 font-bold py-2 rounded-lg hover:bg-neutral-800 hover:text-white border border-white transition mt-auto">Get Started with Pro</Button>
        </div>
      </div>
    </div>
  );
};

export default PaidPricingPage; 