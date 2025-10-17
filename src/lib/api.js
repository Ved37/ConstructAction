const TOKEN_KEY = "ca_token";
const USER_KEY = "ca_current_user";

export function getBaseUrl() {
  // During dev, prefer proxy by leaving base '' when VITE_API_PROXY is set
  if (import.meta.env.VITE_API_PROXY) return "";
  // Otherwise use configured API URL (prod or non-proxy dev)
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
    const detail = isJson ? data?.detail || data?.message : undefined;
    const textMsg = !isJson && typeof data === "string" ? data : undefined;
    const message = detail || textMsg || resp.statusText || "Request failed";
    const error = new Error(`${message} (HTTP ${resp.status})`);
    error.status = resp.status;
    error.data = data;
    throw error;
  }
  return data;
}

export const storageKeys = { TOKEN_KEY, USER_KEY };
