import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from './lib/supabaseClient';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar_url: string;
  plan: string | null;
}

interface UserContextType {
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  refreshUser: () => Promise<void>;
  loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, name, avatar_url, plan')
        .eq('id', session.user.id)
        .single();
      if (profileData) {
        setUser({
          id: profileData.id,
          name: profileData.name || '',
          email: session.user.email || '',
          avatar_url: profileData.avatar_url || '/lovable-uploads/7cb844ab-a7c0-4a3a-a3df-ff34e31930e1.png',
          plan: profileData.plan || null,
        });
      } else {
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUser();
    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) fetchUser();
      else setUser(null);
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, refreshUser: fetchUser, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}; 