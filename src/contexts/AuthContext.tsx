import { createContext, useContext, useEffect, useState } from "react";
import { supabase, onAuthStateChange, profileHelpers } from "../lib/supabase";
import type { User, Session } from "@supabase/supabase-js";
import type { Profile, UserPreferences } from "../types/profile";

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  profileLoading: boolean;

  // Auth methods
  signOut: () => Promise<void>;

  // Profile methods
  updateProfile: (
    updates: Partial<Profile>
  ) => Promise<{ data: Profile | null; error: any }>;
  refreshProfile: () => Promise<void>;
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  session: null,
  loading: true,
  profileLoading: false,
  signOut: async () => {},
  updateProfile: async () => ({ data: null, error: null }),
  refreshProfile: async () => {},
  updatePreferences: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    // Set a timeout to ensure we don't hang indefinitely
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        console.log("Auth initialization timeout, setting loading to false");
        setLoading(false);
      }
    }, 5000); // 5 second timeout

    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log("Getting initial session...");
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Error getting session:", error);
        }

        if (isMounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
          clearTimeout(timeoutId);

          // Fetch profile if user exists
          if (session?.user) {
            fetchUserProfile(session.user.id);
          }
        }
      } catch (error) {
        console.error("Failed to get initial session:", error);
        if (isMounted) {
          setLoading(false);
          clearTimeout(timeoutId);
        }
      }
    };

    getInitialSession();

    // Listen for auth changes
    let subscription: any = null;
    try {
      const { data } = onAuthStateChange((event, session) => {
        console.log("Auth state changed:", event, session);
        if (isMounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
          clearTimeout(timeoutId);

          // Handle profile based on auth events
          if (session?.user) {
            fetchUserProfile(session.user.id);
          } else {
            setProfile(null);
          }
        }

        // Handle specific auth events
        if (event === "SIGNED_IN") {
          console.log("User successfully signed in:", session?.user);
        } else if (event === "SIGNED_UP") {
          console.log("User successfully signed up:", session?.user);
        } else if (event === "SIGNED_OUT") {
          console.log("User signed out");
          setProfile(null);
        }
      });
      subscription = data.subscription;
    } catch (error) {
      console.error("Failed to set up auth listener:", error);
      if (isMounted) {
        setLoading(false);
        clearTimeout(timeoutId);
      }
    }

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  // Profile management functions
  const fetchUserProfile = async (userId: string) => {
    setProfileLoading(true);
    try {
      const { data, error } = await profileHelpers.getProfile(userId);
      if (data && !error) {
        setProfile(data);
      } else {
        console.error("Error fetching profile:", error);
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setProfileLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) {
      return { data: null, error: { message: "No user logged in" } };
    }

    setProfileLoading(true);
    try {
      const result = await profileHelpers.updateProfile(user.id, updates);
      if (result.data && !result.error) {
        setProfile(result.data);
      }
      return result;
    } catch (error) {
      console.error("Failed to update profile:", error);
      return { data: null, error: { message: "Failed to update profile" } };
    } finally {
      setProfileLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchUserProfile(user.id);
    }
  };

  const updatePreferences = async (preferences: Partial<UserPreferences>) => {
    if (!user) {
      console.error("No user logged in");
      return;
    }

    try {
      const { error } = await profileHelpers.updatePreferences(
        user.id,
        preferences
      );
      if (error) {
        console.error("Error updating preferences:", error);
      }
    } catch (error) {
      console.error("Failed to update preferences:", error);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error signing out:", error);
      }
    } catch (error) {
      console.error("Failed to sign out:", error);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    profile,
    session,
    loading,
    profileLoading,
    signOut,
    updateProfile,
    refreshProfile,
    updatePreferences,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
