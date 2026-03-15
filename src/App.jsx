import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";

import Landing from "./pages/Landing";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";

export default function App() {
  const [session, setSession] = useState(null);
  const [profileComplete, setProfileComplete] = useState(false);

  useEffect(() => {
    const getLocalProfileComplete = (userId) => {
      if (!userId) return false;
      return localStorage.getItem(`profile_complete:${userId}`) === "true";
    };

    const resetAuthState = () => {
      setSession(null);
      setProfileComplete(false);
    };

    const checkProfile = (user) => {
      if (!user) {
        setProfileComplete(false);
        return;
      }

      setProfileComplete(getLocalProfileComplete(user.id));
    };

    supabase.auth.getSession().then(({ data }) => {
      const currentSession = data.session;
      setSession(currentSession);
      if (currentSession?.user) {
        checkProfile(currentSession.user);
      } else {
        resetAuthState();
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        checkProfile(session.user);
      } else {
        resetAuthState();
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

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
