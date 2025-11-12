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

  const register = useCallback(async ({ name, email, password }) => {
    // FastAPI /api/register expects { email, password, full_name }
    const body = { email, password, full_name: name };
    const data = await apiFetch("/api/register", {
      method: "POST",
      auth: false,
      body,
    });
    // Spec returns Token: { access_token, token_type, user_id, email, full_name }
    if (data?.access_token) setToken(data.access_token);
    const userFromToken = data
      ? {
          user_id: data.user_id,
          email: data.email,
          name: data.full_name,
        }
      : null;
    if (userFromToken) {
      saveUser(userFromToken);
      setUser(userFromToken);
    }
    return userFromToken;
  }, []);

  const login = useCallback(async ({ email, password }) => {
  // FastAPI /api/login expects { email, password } and returns Token
  const data = await apiFetch("/api/login", {
    method: "POST",
    auth: false,
    body: { email, password },
  });
  if (data?.access_token) setToken(data.access_token);
  const userFromToken = data
    ? {
        user_id: data.user_id,
        email: data.email,
        name: data.full_name,
        last_login: data.last_login, // Use the last_login from backend
      }
    : null;
  if (userFromToken) {
    saveUser(userFromToken);
    setUser(userFromToken);
    return userFromToken;
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
