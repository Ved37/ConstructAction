/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { apiFetch, loadUser, saveUser, setToken, clearToken } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const existing = loadUser();
      if (existing) setUser(existing);
    } catch (e) {
      console.error("Failed to read current user", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(
    async ({ name, email, password, company, job_title, phone }) => {
      // Call backend to create a user per your schema
      const data = await apiFetch("/api/auth/register", {
        method: "POST",
        auth: false,
        body: { name, email, password, company, job_title, phone },
      });
      // Expect { token, user }
      if (data?.token) setToken(data.token);
      if (data?.user) {
        saveUser(data.user);
        setUser(data.user);
      }
      return data?.user || null;
    },
    []
  );

  const login = useCallback(async ({ email, password }) => {
    const data = await apiFetch("/api/auth/login", {
      method: "POST",
      auth: false,
      body: { email, password },
    });
    if (data?.token) setToken(data.token);
    if (data?.user) {
      saveUser(data.user);
      setUser(data.user);
      return data.user;
    }
    return null;
  }, []);

  const logout = useCallback(async () => {
    clearToken();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, register, login, logout }),
    [user, loading, register, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
