import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useCallback, useState } from "react";

const SESSION_KEY = "streamscale_user_id";

export function useAuth() {
  const [sessionId, setSessionId] = useState<string | null>(() => localStorage.getItem(SESSION_KEY));
  const user = useQuery(api.auth.getUserById, sessionId ? { userId: sessionId as any } : "skip");
  const signIn = useCallback((userId: string) => {
    localStorage.setItem(SESSION_KEY, userId);
    setSessionId(userId);
  }, []);
  const signOut = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setSessionId(null);
    window.location.href = "/";
  }, []);
  return { isLoading: sessionId !== null && user === undefined, isAuthenticated: Boolean(sessionId && user), user, userId: sessionId, signIn, signOut };
}
