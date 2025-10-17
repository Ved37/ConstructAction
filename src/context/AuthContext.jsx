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
      // POST /auth/register expects JSON body
      const body = { name, email, password };
      if (company) body.company = company;
      if (job_title) body.job_title = job_title;
      if (phone) body.phone = phone;
      const data = await apiFetch("/api/auth/register", {
        method: "POST",
        auth: false,
        body,
      });
      // FastAPI returns { access_token, token_type, user }
      if (data?.access_token) setToken(data.access_token);
      if (data?.user) {
        saveUser(data.user);
        setUser(data.user);
      }
      return data?.user || null;
    },
    []
  );

  const login = useCallback(async ({ email, password }) => {
    // Use JSON login endpoint exposed by backend
    const data = await apiFetch("/api/auth/login-json", {
      method: "POST",
      auth: false,
      body: { email, password },
    });
    if (data?.access_token) setToken(data.access_token);
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
