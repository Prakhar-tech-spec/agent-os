import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

const PLAN_CACHE_KEY = 'user_plan';

export function usePlan() {
  const [plan, setPlan] = useState<string | null>(() => {
    // Try to get plan from localStorage for instant access
    if (typeof window !== 'undefined') {
      return localStorage.getItem(PLAN_CACHE_KEY) || null;
    }
    return null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlan() {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('plan')
          .eq('id', session.user.id)
          .single();
        setPlan(profile?.plan || null);
        if (typeof window !== 'undefined') {
          if (profile?.plan) {
            localStorage.setItem(PLAN_CACHE_KEY, profile.plan);
          } else {
            localStorage.removeItem(PLAN_CACHE_KEY);
          }
        }
      } else {
        setPlan(null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem(PLAN_CACHE_KEY);
        }
      }
      setLoading(false);
    }
    fetchPlan();
  }, []);

  return { plan, loading };
} 