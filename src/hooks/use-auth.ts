import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useCallback, useEffect, useState } from "react";

const SESSION_KEY = "streamscale_user_id";
const ROLE_KEY = "streamscale_user_role";

/**
 * Convex document ids are alphanumeric strings. If localStorage holds anything
 * else ("null", "undefined", a truncated value, a value from an old database),
 * sending it to the server would error. Checking the shape locally lets us
 * treat it as "no session" instead of crashing the profile lookup.
 */
function isPlausibleUserId(value: string | null): value is string {
  if (!value) return false;
  if (value === "null" || value === "undefined") return false;
  return /^[a-z0-9]{16,64}$/i.test(value);
}

function readStoredSession(): { id: string | null; role: string | null } {
  try {
    const storedId = localStorage.getItem(SESSION_KEY);
    const storedRole = localStorage.getItem(ROLE_KEY);
    if (!isPlausibleUserId(storedId)) {
      // Clean up garbage values so we don't retry them on every load.
      if (storedId !== null) localStorage.removeItem(SESSION_KEY);
      return { id: null, role: null };
    }
    return { id: storedId, role: storedRole };
  } catch {
    // localStorage can be unavailable (private browsing, blocked storage).
    return { id: null, role: null };
  }
}

export function useAuth() {
  const [sessionId, setSessionId] = useState<string | null>(() => readStoredSession().id);
  const [role, setRole] = useState<string | null>(() => readStoredSession().role);

  // While the profile lookup is in flight, `user` is undefined. When it
  // finishes with no matching account (e.g. the user was deleted), it is null.
  const user = useQuery(
    api.auth.getUserById,
    sessionId ? { userId: sessionId as any } : "skip"
  );

  useEffect(() => {
    // Only clear the session once the lookup has actually completed.
    if (!sessionId || user !== null) return;
    try {
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(ROLE_KEY);
    } catch {
      // ignore storage failures
    }
    setSessionId(null);
    setRole(null);
  }, [sessionId, user]);

  const signIn = useCallback((userId: string, nextRole?: string) => {
    try {
      localStorage.setItem(SESSION_KEY, userId);
      if (nextRole) localStorage.setItem(ROLE_KEY, nextRole);
    } catch {
      // ignore storage failures; the in-memory session still works
    }
    setSessionId(userId);
    setRole(nextRole ?? null);
  }, []);

  const signOut = useCallback(() => {
    try {
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(ROLE_KEY);
    } catch {
      // ignore storage failures
    }
    setSessionId(null);
    setRole(null);
    window.location.replace("/");
  }, []);

  // A stored session whose profile is still loading must not flash "signed
  // out" — RequireAuth waits while isLoading is true.
  const isLoading = Boolean(sessionId) && user === undefined;

  return {
    isLoading,
    isAuthenticated: Boolean(sessionId && user),
    user,
    userId: sessionId,
    role: user && "role" in user ? user.role : role,
    signIn,
    signOut,
  };
}
