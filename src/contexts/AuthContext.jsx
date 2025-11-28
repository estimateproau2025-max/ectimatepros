import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import {
  loadSession,
  signIn,
  signOut as clearStoredSession,
  signUp,
} from "@/lib/authService";
import { apiClient } from "@/lib/apiClient";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(() => loadSession());
  const [user, setUser] = useState(() => loadSession()?.user ?? null);
  const [builder, setBuilder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hydrate = async () => {
      if (!session?.accessToken) {
        setLoading(false);
        return;
      }

      try {
        const profile = await apiClient.get("/builders/me");
        setBuilder(profile.builder);
        if (!user) {
          setUser({
            id: profile.builder?._id || profile.builder?.id,
            email: profile.builder?.email,
          });
        }
      } catch (error) {
        console.error("Failed to load builder profile", error);
        // Don't clear session on error - let ProtectedRoute handle it
        setBuilder(null);
      } finally {
        setLoading(false);
      }
    };

    hydrate();
  }, [session?.accessToken]);

  const refreshProfile = async () => {
    if (!session?.accessToken) return null;
    const profile = await apiClient.get("/builders/me");
    setBuilder(profile.builder);
    return profile.builder;
  };

  const handleSignUp = async ({ email, password, fullName }) => {
    const newSession = await signUp({ email, password, fullName });
    setSession(newSession);
    setUser(newSession.user);
    const profile = await refreshProfile();
    return { user: newSession.user, profile };
  };

  const handleSignIn = async ({ email, password }) => {
    const newSession = await signIn({ email, password });
    setSession(newSession);
    setUser(newSession.user);
    const profile = await refreshProfile();
    return { user: newSession.user, profile };
  };

  const handleSignOut = useCallback(() => {
    clearStoredSession();
    setSession(null);
    setUser(null);
    setBuilder(null);
  }, []);

  useEffect(() => {
    const handleExpiredSession = () => {
      handleSignOut();
    };
    window.addEventListener("estimatepro:session-expired", handleExpiredSession);
    return () => {
      window.removeEventListener(
        "estimatepro:session-expired",
        handleExpiredSession
      );
    };
  }, [handleSignOut]);

  const value = {
    session,
    user,
    builder,
    loading,
    signup: handleSignUp,
    login: handleSignIn,
    logout: handleSignOut,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);