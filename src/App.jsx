import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";

import Landing from "./pages/Landing";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileComplete, setProfileComplete] = useState(false);

  useEffect(() => {
    const getLocalProfileComplete = (userId) => {
      if (!userId) return false;
      return localStorage.getItem(`profile_complete:${userId}`) === "true";
    };

    const setLocalProfileComplete = (userId, complete) => {
      if (!userId) return;
      localStorage.setItem(`profile_complete:${userId}`, complete ? "true" : "false");
    };

    const resetAuthState = () => {
      setSession(null);
      setProfileComplete(false);
      setLoading(false);
    };

    const checkProfile = async (user) => {
      if (!user) {
        setProfileComplete(false);
        return;
      }

      if (getLocalProfileComplete(user.id)) {
        setProfileComplete(true);
        return;
      }

      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        if (apiUrl) {
          const res = await fetch(`${apiUrl}/api/users/${user.id}`);
          if (res.ok) {
            const data = await res.json();
            const complete = !!data && !!data.name && !!data.phone;
            setProfileComplete(complete);
            setLocalProfileComplete(user.id, complete);
          } else {
            setProfileComplete(false);
          }
        } else {
          setProfileComplete(false);
        }
      } catch (err) {
        console.warn("Profile API unavailable. Using local profile state:", err.message);
        setProfileComplete(false);
      }
    };

    supabase.auth.getSession().then(({ data }) => {
      const currentSession = data.session;
      setSession(currentSession);
      if (currentSession?.user) {
        checkProfile(currentSession.user).finally(() => setLoading(false));
      } else {
        resetAuthState();
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        setLoading(true);
        checkProfile(session.user).finally(() => setLoading(false));
      } else {
        resetAuthState();
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0b0c] flex items-center justify-center text-white/40 text-sm font-sans tracking-widest uppercase">
        Verifying Session...
      </div>
    );
  }

  if (!session) {
    const path = window.location.pathname;
    const shouldOpenLogin = path === "/login";
    return <Landing initialLoginOpen={shouldOpenLogin} />;
  }

  if (session && !profileComplete) {
    return <Profile onComplete={() => setProfileComplete(true)} />;
  }

  return <Dashboard />;
}
