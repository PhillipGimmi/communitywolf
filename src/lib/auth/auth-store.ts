import { create } from 'zustand';
import { createBrowserClient } from '@supabase/ssr';

// Simple User type since we're not importing from supabase-js
interface User {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
}

type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role_id: string;
  country_id: string;
  verified: boolean;
  phone_number?: string | null;
  last_seen_at?: string | null;
  preferences: Json;
  created_at: string;
  updated_at: string;
  // Optional joined fields
  role?: {
    name?: string;
    level?: number;
    description?: string;
  };
  country?: {
    name?: string;
    code?: string;
  };
}

interface AuthState {
  isAuthenticated: boolean;
  userProfile: UserProfile | null;
  user: User | null;
  loading: boolean;
  initialized: boolean;
  subscription: { unsubscribe: () => void } | null;
  signingOut: boolean;
  setAuthState: (isAuthenticated: boolean, userProfile?: UserProfile, user?: User) => void;
  clearAuthState: () => void;
  initialize: () => Promise<void>;
  signOut: () => Promise<void>;
}

// Check if we're in the browser
const isBrowser = typeof window !== 'undefined';

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  userProfile: null,
  user: null,
  loading: true,
  initialized: false,
  subscription: null,
  signingOut: false,

  setAuthState: (isAuthenticated, userProfile, user) => {
    console.log('🔧 AuthStore: setAuthState called', { isAuthenticated, userProfile: userProfile?.full_name, user: user?.email });
    set({ isAuthenticated, userProfile, user });
  },
  
  clearAuthState: () => {
    console.log('🔧 AuthStore: clearAuthState called');
    const state = get();
    if (state.subscription) {
      console.log('🔧 AuthStore: Unsubscribing from auth listener...');
      state.subscription.unsubscribe();
    }
    set({ isAuthenticated: false, userProfile: null, user: null, subscription: null });
  },

  initialize: async () => {
    const state = get();
    console.log('🚀 AuthStore: initialize called, current state:', {
      initialized: state.initialized,
      loading: state.loading,
      isAuthenticated: state.isAuthenticated
    });
    
    if (state.initialized) {
      console.log('✅ AuthStore: Already initialized, skipping');
      return;
    }
    
    // If not in browser, just mark as initialized
    if (!isBrowser) {
      console.log('🚀 AuthStore: Server-side detected, marking as initialized');
      set({ initialized: true, loading: false });
      return;
    }
    
    console.log('🚀 AuthStore: Browser detected, starting initialization...');
    
    // Immediately set as initializing to prevent multiple calls
    set({ initialized: true });
    
    try {
      // Create Supabase client
      console.log('🔧 AuthStore: Creating Supabase client...');
      
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      
      console.log('✅ AuthStore: Supabase client created successfully');
      
      // Get initial session
      console.log('📡 AuthStore: Getting initial session...');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('❌ AuthStore: Error getting session:', sessionError);
        set({ isAuthenticated: false, user: null, userProfile: null, loading: false });
        return;
      }
      
      if (session?.user) {
        console.log('✅ AuthStore: User is authenticated:', session.user.email);
        
        // Try to fetch user profile
        try {
          const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (profileError) {
            console.warn('⚠️ AuthStore: Could not fetch profile:', profileError);
            set({ 
              isAuthenticated: true, 
              user: session.user, 
              userProfile: null,
              loading: false 
            });
          } else {
            console.log('✅ AuthStore: Profile fetched successfully:', profile.full_name);
            set({ 
              isAuthenticated: true, 
              user: session.user, 
              userProfile: profile,
              loading: false 
            });
          }
        } catch (profileError) {
          console.warn('⚠️ AuthStore: Profile fetch failed:', profileError);
          set({ 
            isAuthenticated: true, 
            user: session.user, 
            userProfile: null,
            loading: false 
          });
        }
      } else {
        console.log('❌ AuthStore: No active session found');
        set({ isAuthenticated: false, user: null, userProfile: null, loading: false });
      }
      
      // Set up auth state listener
      console.log('🔧 AuthStore: Setting up auth state listener...');
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('🔧 AuthStore: Auth state change:', event, session?.user?.email);
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('✅ AuthStore: User signed in:', session.user.email);
          
          try {
            const { data: profile, error: profileError } = await supabase
              .from('user_profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            if (profileError) {
              console.warn('⚠️ AuthStore: Could not fetch profile on sign in:', profileError);
              set({ 
                isAuthenticated: true, 
                user: session.user, 
                userProfile: null,
                loading: false 
              });
            } else {
              console.log('✅ AuthStore: Profile fetched on sign in:', profile.full_name);
              set({ 
                isAuthenticated: true, 
                user: session.user, 
                userProfile: profile,
                loading: false 
              });
            }
          } catch (profileError) {
            console.warn('⚠️ AuthStore: Profile fetch failed on sign in:', profileError);
            set({ 
              isAuthenticated: true, 
              user: session.user, 
              userProfile: null,
              loading: false 
            });
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('🔧 AuthStore: User signed out, clearing state...');
          set({ 
            isAuthenticated: false, 
            user: null, 
            userProfile: null, 
            loading: false 
          });
        }
      });
      
      // Store the subscription in the state for proper cleanup
      set(state => ({ ...state, subscription }));
      
    } catch (error) {
      console.error('❌ AuthStore: Critical error initializing auth:', error);
      // Always ensure we're not stuck in loading state
      set({ 
        isAuthenticated: false,
        user: null,
        userProfile: null,
        loading: false
      });
    }
  },

  signOut: async () => {
    if (!isBrowser) {
      console.log('🚫 AuthStore: signOut called on server, ignoring');
      return;
    }
    
    console.log('🔧 AuthStore: signOut called, clearing local state first...');
    
    // Unsubscribe from auth listener first
    const state = get();
    if (state.subscription) {
      console.log('🔧 AuthStore: Unsubscribing from auth listener...');
      state.subscription.unsubscribe();
    }
    
    // Clear local state immediately to prevent UI issues
    set({ isAuthenticated: false, user: null, userProfile: null, loading: false, subscription: null });
    
    console.log('🔧 AuthStore: Creating Supabase client...');
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    try {
      console.log('🔧 AuthStore: Calling Supabase signOut...');
      await supabase.auth.signOut();
      console.log('✅ AuthStore: Sign out successful');
      
      // Force clear state again to ensure it's cleared
      set({ isAuthenticated: false, user: null, userProfile: null, loading: false, subscription: null });
      
      // Clear any stored auth data
      if (typeof window !== 'undefined') {
        localStorage.removeItem('supabase.auth.token');
        sessionStorage.removeItem('supabase.auth.token');
        // Clear all Supabase related storage
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('sb-')) {
            localStorage.removeItem(key);
          }
        });
        Object.keys(sessionStorage).forEach(key => {
          if (key.startsWith('sb-')) {
            sessionStorage.removeItem(key);
          }
        });
      }
      
    } catch (error) {
      console.error('❌ AuthStore: Error signing out:', error);
      // Even if Supabase signOut fails, keep local state cleared
      set({ isAuthenticated: false, user: null, userProfile: null, loading: false, subscription: null });
    }
  },

  // Check if user should be redirected to dashboard (for home page)
  shouldRedirectToDashboard: () => {
    const state = get();
    const shouldRedirect = state.initialized && !state.loading && state.isAuthenticated;
    console.log('🔧 AuthStore: shouldRedirectToDashboard check:', {
      initialized: state.initialized,
      loading: state.loading,
      isAuthenticated: state.isAuthenticated,
      shouldRedirect
    });
    return shouldRedirect;
  },
}));
