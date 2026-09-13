import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { googleLogin, getProfile, updateProfile as apiUpdateProfile } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("auth_token") || null);
  const [loading, setLoading] = useState(true);

  // Load profile on mount if token exists
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    getProfile()
      .then((profile) => {
        if (!cancelled) setUser(profile);
      })
      .catch(() => {
        // Token expired or invalid — clear state
        if (!cancelled) {
          localStorage.removeItem("auth_token");
          setToken(null);
          setUser(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const signInWithGoogle = useCallback(async (credential) => {
    const result = await googleLogin(credential);
    localStorage.setItem("auth_token", result.token);
    setToken(result.token);
    setUser(result.user);
    return result;
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem("auth_token");
    setToken(null);
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (updates) => {
    const updated = await apiUpdateProfile(updates);
    setUser(updated);
    return updated;
  }, []);

  const isAuthenticated = Boolean(token && user);

  const profileComplete = Boolean(
    user?.name && user?.phone && user?.location
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        profileComplete,
        signInWithGoogle,
        signOut,
        updateProfile,
        refreshProfile: async () => {
          const profile = await getProfile();
          setUser(profile);
          return profile;
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
