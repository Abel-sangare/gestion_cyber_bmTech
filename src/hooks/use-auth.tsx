import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';

// Définir le type pour notre profil utilisateur de la table 'utilisateurs'
interface UserProfile {
  nom: string;
  prenom: string;
  role: string;
  [key: string]: any; // Pour d'autres champs éventuels
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null; // Profil de la table 'utilisateurs'
  loading: boolean;
  signOut: () => Promise<void>;
  refetchProfile: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fonction pour récupérer le profil de la table 'utilisateurs'
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('utilisateurs')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error("Erreur de chargement du profil utilisateur:", error);
        setProfile(null);
      } else {
        setProfile(data);
      }
    } catch (e) {
      console.error(e);
      setProfile(null);
    }
  };

  useEffect(() => {
    const fetchSessionAndProfile = async () => {
      const { data: { session: initialSession }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Erreur de session:", error)
        setLoading(false);
        return;
      }

      setSession(initialSession);
      const currentUser = initialSession?.user;
      setUser(currentUser ?? null);

      if (currentUser) {
        await fetchUserProfile(currentUser.id);
      }
      setLoading(false);
    };
    
    fetchSessionAndProfile();

    // Écouter les changements d'auth (login, logout, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      const currentUser = session?.user;
      setUser(currentUser ?? null);

      if (_event === 'SIGNED_IN' && currentUser) {
        await fetchUserProfile(currentUser.id);
      }
      
      if (_event === 'SIGNED_OUT') {
        setProfile(null);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  // Fonction pour rafraîchir manuellement le profil après une mise à jour
  const refetchProfile = () => {
    if (user) {
      fetchUserProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, profile, loading, signOut, refetchProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
