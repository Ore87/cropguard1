import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: "farmer" | "agronomist" | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  userRole: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<"farmer" | "agronomist" | null>(null);
  const [loading, setLoading] = useState(true);

  // Session timeout configuration (1 hour of inactivity)
  const INACTIVITY_TIMEOUT = 60 * 60 * 1000; // 1 hour in milliseconds
  const LAST_ACTIVITY_KEY = 'cropguard_last_activity';

  // Check if session has expired due to inactivity
  const checkSessionTimeout = () => {
    const lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY);
    if (lastActivity) {
      const timeSinceActivity = Date.now() - parseInt(lastActivity);
      if (timeSinceActivity > INACTIVITY_TIMEOUT) {
        toast.error("Session expired due to inactivity. Please log in again.");
        signOut();
        return true;
      }
    }
    return false;
  };

  // Update last activity timestamp
  const updateActivity = () => {
    localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Check for session timeout on auth state change
          if (!checkSessionTimeout()) {
            updateActivity();
            setTimeout(() => {
              fetchUserRole(session.user.id);
            }, 0);
          }
        } else {
          setUserRole(null);
          setLoading(false);
          localStorage.removeItem(LAST_ACTIVITY_KEY);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        // Check for session timeout on mount
        if (!checkSessionTimeout()) {
          updateActivity();
          fetchUserRole(session.user.id);
        }
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Set up activity tracking listeners
  useEffect(() => {
    if (!user) return;

    const activityEvents = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    
    const handleActivity = () => {
      updateActivity();
    };

    // Attach listeners
    activityEvents.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    // Check for inactivity every minute
    const inactivityCheckInterval = setInterval(() => {
      checkSessionTimeout();
    }, 60 * 1000); // Check every minute

    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      clearInterval(inactivityCheckInterval);
    };
  }, [user]);

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .single();

      if (error) throw error;
      setUserRole(data.role as "farmer" | "agronomist");
    } catch (error) {
      console.error("Error fetching user role:", error);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setUserRole(null);
    localStorage.removeItem(LAST_ACTIVITY_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, session, userRole, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};