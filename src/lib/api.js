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

  const isFormData =
    typeof FormData !== "undefined" && body instanceof FormData;
  const isUrlEncoded =
    typeof URLSearchParams !== "undefined" && body instanceof URLSearchParams;
  const finalHeaders = {
    // Let the browser set appropriate Content-Type for FormData or URLSearchParams
    ...(isFormData || isUrlEncoded
      ? {}
      : { "Content-Type": "application/json" }),
    ...headers,
  };
  if (auth && token) {
    finalHeaders["Authorization"] = `Bearer ${token}`;
  }
  const resp = await fetch(url, {
    method,
    headers: finalHeaders,
    body: body
      ? isFormData || isUrlEncoded
        ? body
        : JSON.stringify(body)
      : undefined,
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

// NEW: Profile picture API functions
export const uploadProfilePicture = async (formData) => {
  // /api/users/me/picture expects multipart form-data { file }
  return await apiFetch("/api/users/me/picture", {
    method: "POST",
    body: formData,
    headers: {}, // Let browser set Content-Type for FormData
  });
};

export const deleteProfilePicture = async () => {
  return await apiFetch("/api/users/me/picture", {
    method: "DELETE",
  });
};

export const updateUserProfile = async (profileData) => {
  // Returns { message, user }
  return await apiFetch("/api/users/me", {
    method: "PUT",
    body: profileData,
  });
};

export const getProfile = async () => {
  // Returns UserResponse
  return await apiFetch("/api/users/me");
};

// -----------------------------
// Users collection/admin endpoints
// -----------------------------
export const createUserAdmin = async ({
  name,
  email,
  password_hash,
  company,
  job_title,
  phone,
}) => {
  return await apiFetch("/api/users/", {
    method: "POST",
    auth: false, // currently open per spec
    body: { name, email, password_hash, company, job_title, phone },
  });
};

export const listUsers = async ({ skip = 0, limit = 100 } = {}) => {
  const qs = new URLSearchParams({ skip: String(skip), limit: String(limit) });
  return await apiFetch(`/api/users/?${qs.toString()}`, { auth: false });
};

export const getUserById = async (userId) => {
  return await apiFetch(`/api/users/${userId}`, { auth: false });
};

export const getUserByEmail = async (email) => {
  const encoded = encodeURIComponent(email);
  return await apiFetch(`/api/users/email/${encoded}`, { auth: false });
};

export const updateUserById = async (userId, payload) => {
  return await apiFetch(`/api/users/${userId}`, {
    method: "PUT",
    auth: false, // currently open per spec
    body: payload,
  });
};

export const deleteUserById = async (userId) => {
  return await apiFetch(`/api/users/${userId}`, {
    method: "DELETE",
    auth: false,
  });
};

export const storageKeys = { TOKEN_KEY, USER_KEY };

// Chat session APIs
// Create a new chat session. Optionally pass a projectId for project-aware context.
export const createChatSession = async (projectId) => {
  const body = projectId ? { project_id: projectId } : {};
  return await apiFetch("/api/chat/sessions", {
    method: "POST",
    body,
  });
};

// Ask a question within an existing chat session.
// Returns ChatAskResponse with fields: answer, references[], confidence, ai_model, chunks_used
export const askChat = async (sessionId, question) => {
  if (!sessionId) throw new Error("Missing chat sessionId for askChat");
  return await apiFetch(`/api/chat/sessions/${sessionId}/ask`, {
    method: "POST",
    body: { question },
  });
};

// Optional helpers: list sessions and fetch history (not yet used by UI)
export const listChatSessions = async () => {
  // Expected response: { sessions: [...] }
  return await apiFetch("/api/chat/sessions", { method: "GET" });
};

export const getChatHistory = async (sessionId) => {
  if (!sessionId) throw new Error("Missing sessionId for getChatHistory");
  // Expected response: { history: [...] }
  return await apiFetch(`/api/chat/sessions/${sessionId}/history`, {
    method: "GET",
  });
};

// -----------------------------
// New QA endpoints integration
// -----------------------------
// Resolve QA base path. Supports env override and backward compatibility.
function getQaBasePath() {
  const fromEnv = import.meta?.env?.VITE_QA_BASE;
  // Ensure leading slash if set
  if (fromEnv && typeof fromEnv === "string") {
    return fromEnv.startsWith("/") ? fromEnv : `/${fromEnv}`;
  }
  return "/qa"; // default per spec
}

// Health / readiness check
export const readyQa = async () => {
  const base = getQaBasePath();
  return await apiFetch(`${base}/ready`, { method: "GET", auth: true });
};

// Force initialization (optional – backend may lazy init on ask)
export const initQa = async () => {
  const base = getQaBasePath();
  return await apiFetch(`${base}/init`, { method: "POST", auth: true });
};

// Ask the RAG/QA engine for an answer.
// question: string (required)
// topK: optional number 1-20 (defaults backend side to 5)
// Returns shape:
// { answer, score, source, page_number, retrieved: [{source,page_number,snippet}, ...] }
export const askQa = async (question, topK) => {
  if (!question || !question.trim()) {
    const err = new Error("Please enter a question.");
    err.status = 400;
    throw err;
  }
  try {
    const base = getQaBasePath();
    return await apiFetch(`${base}/ask`, {
      method: "POST",
      body: { question, ...(topK ? { top_k: topK } : {}) },
      auth: true,
    });
  } catch (e) {
    // Provide cleaner high-level messages based on status codes
    if (e.status === 400) {
      e.userMessage = "Please enter a question.";
    } else if (e.status === 404) {
      // Smart fallback: if default /qa path 404s, retry /api/qa automatically once
      try {
        const base = getQaBasePath();
        const triedDefault = base === "/qa";
        const altBase = triedDefault
          ? "/api/qa"
          : base === "/api/qa"
          ? "/qa"
          : null;
        if (altBase) {
          const res = await apiFetch(`${altBase}/ask`, {
            method: "POST",
            body: { question, ...(topK ? { top_k: topK } : {}) },
            auth: true,
          });
          return res;
        }
      } catch (_retryErr) {
        // reference to satisfy linter; we intentionally ignore retry error
        _retryErr;
        // fall through to message assignment below
      }
      e.userMessage = "Service unavailable. Try again later.";
    } else if (e.status === 503) {
      e.userMessage = "Knowledge base not ready. Try again later.";
    } else if (e.status === 500) {
      e.userMessage = "Unexpected error. Try again.";
    }
    throw e;
  }
};
