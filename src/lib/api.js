const TOKEN_KEY = "ca_token";
const USER_KEY = "ca_current_user";

export function getBaseUrl() {
  // Prefer VITE_API_URL; fallback to '' for same-origin proxy
  return import.meta.env.VITE_API_URL || "";
}

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || null;
  } catch {
    return null;
  }
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function saveUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function loadUser() {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function apiFetch(
  path,
  { method = "GET", headers = {}, body, auth = true } = {}
) {
  const base = getBaseUrl();
  const url = `${base}${path}`;
  const token = getToken();

  const finalHeaders = {
    "Content-Type": "application/json",
    ...headers,
  };
  if (auth && token) {
    finalHeaders["Authorization"] = `Bearer ${token}`;
  }
  const resp = await fetch(url, {
    method,
    headers: finalHeaders,
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
  });
  const isJson = resp.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await resp.json().catch(() => ({})) : await resp.text();
  if (!resp.ok) {
    const message =
      (data && data.message) || resp.statusText || "Request failed";
    const error = new Error(message);
    error.status = resp.status;
    error.data = data;
    throw error;
  }
  return data;
}

export const storageKeys = { TOKEN_KEY, USER_KEY };
