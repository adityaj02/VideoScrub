import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import { getUserProfile } from "./lib/profile";

import Landing from "./pages/Landing";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";

export default function App() {
  const [session, setSession] = useState(null);
  const [profileComplete, setProfileComplete] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);

  useEffect(() => {
    const checkProfile = async (user) => {
      if (!user) {
        setProfileComplete(false);
        setCheckingProfile(false);
        return;
      }

      setCheckingProfile(true);

      try {
        const profile = await getUserProfile({ userId: user.id, email: user.email });
        const profile = await getUserProfile(user.id);
        const hasProfile = Boolean(profile?.name);
        setProfileComplete(hasProfile);

        if (hasProfile) {
          localStorage.setItem(`profile_complete:${user.id}`, "true");
          localStorage.setItem(`profile_name:${user.id}`, profile.name);
        }
      } catch (error) {
        const fallbackComplete = localStorage.getItem(`profile_complete:${user.id}`) === "true";
        setProfileComplete(fallbackComplete);
        console.warn("Could not read profile from Supabase, using local fallback.", error);
      } finally {
        setCheckingProfile(false);
      }
    };

    supabase.auth.getSession().then(({ data }) => {
      const currentSession = data.session;
      setSession(currentSession);
      checkProfile(currentSession?.user ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      checkProfile(nextSession?.user ?? null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (!session) {
    const shouldOpenLogin = window.location.pathname === "/login";
    return <Landing initialLoginOpen={shouldOpenLogin} />;
  }

  if (checkingProfile) return null;

  if (!profileComplete) {
    return <Profile onComplete={() => setProfileComplete(true)} />;
  }

  return <Dashboard />;
}
