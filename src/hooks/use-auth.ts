import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useCallback, useEffect, useState } from "react";

const SESSION_KEY = "streamscale_user_id";
const ROLE_KEY = "streamscale_user_role";

export function useAuth() {
  const [sessionId, setSessionId] = useState<string | null>(() => localStorage.getItem(SESSION_KEY));
  const [role, setRole] = useState<string | null>(() => localStorage.getItem(ROLE_KEY));
  const user = useQuery(api.auth.getUserById, sessionId ? { userId: sessionId as any } : "skip");

  useEffect(() => {
    if (!sessionId || user !== null) return;
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(ROLE_KEY);
    setSessionId(null);
    setRole(null);
  }, [sessionId, user]);

  const signIn = useCallback((userId: string, nextRole?: string) => {
    localStorage.setItem(SESSION_KEY, userId);
    if (nextRole) localStorage.setItem(ROLE_KEY, nextRole);
    setSessionId(userId);
    setRole(nextRole ?? localStorage.getItem(ROLE_KEY));
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(ROLE_KEY);
    setSessionId(null);
    setRole(null);
    window.location.replace("/");
  }, []);

  return {
    // A valid local session is enough to render the route. The profile query
    // is supplemental and must not leave the entire app on a spinner.
    isLoading: false,
    isAuthenticated: Boolean(sessionId && user),
    user,
    userId: sessionId,
    role: user && "role" in user ? user.role : role,
    signIn,
    signOut,
  };
}
