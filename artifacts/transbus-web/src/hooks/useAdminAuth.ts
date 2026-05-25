import { useState, useEffect, useCallback } from "react";

export type AuthState = "loading" | "authenticated" | "unauthenticated";

export function useAdminAuth() {
  const [state, setState] = useState<AuthState>("loading");
  const [username, setUsername] = useState<string | null>(null);

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (res.ok) {
        const data = await res.json() as { ok: boolean; username: string };
        setState("authenticated");
        setUsername(data.username);
      } else {
        setState("unauthenticated");
        setUsername(null);
      }
    } catch {
      setState("unauthenticated");
      setUsername(null);
    }
  }, []);

  useEffect(() => {
    void checkAuth();
  }, [checkAuth]);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setState("unauthenticated");
    setUsername(null);
  }, []);

  const markAuthenticated = useCallback(() => {
    setState("authenticated");
  }, []);

  return { state, username, logout, refetch: checkAuth, markAuthenticated };
}
