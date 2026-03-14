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

    const checkProfile = async (user) => {
      if (!user) return;

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
            // If the user object returned has necessary details, count as complete
            const complete = !!data && !!data.name;
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
      setSession(data.session);
      if (data.session?.user) {
        checkProfile(data.session.user).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        setLoading(true);
        checkProfile(session.user).finally(() => setLoading(false));
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
    const isLoginPage = window.location.pathname === "/login";
    return <Landing initialLoginOpen={isLoginPage} />;
  }

  if (session && !profileComplete) {
    return <Profile onComplete={() => setProfileComplete(true)} />;
  }

  return <Dashboard />;
}
