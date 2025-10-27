import { apiFetch } from "./api";

export async function listProjects(params = {}) {
  const qs = new URLSearchParams();
  // default to showing all projects for now
  qs.set("visibility", params.visibility || "all");
  if (params.status) qs.set("status", params.status);
  if (params.q) qs.set("q", params.q);
  qs.set("limit", String(params.limit ?? 20));
  qs.set("offset", String(params.offset ?? 0));
  const suffix = `?${qs.toString()}`;
  // Use /api prefix so Vite proxy (VITE_API_PROXY) rewrites to backend during dev
  return apiFetch(`/api/projects${suffix}`, { method: "GET" });
}

export async function getProject(projectId, { allow_all = true } = {}) {
  // Always include visibility=all; include allow_all=true by default
  const parts = [];
  if (allow_all) parts.push("allow_all=true");
  parts.push("visibility=all");
  const qs = parts.length ? `?${parts.join("&")}` : "";
  return apiFetch(`/api/projects/${projectId}${qs}`, { method: "GET" });
}

export async function createProject(payload) {
  return apiFetch("/api/projects", { method: "POST", body: payload });
}

export async function listProjectDocuments(projectId) {
  return apiFetch(`/api/projects/${projectId}/documents?visibility=all`, {
    method: "GET",
  });
}

export async function uploadProjectFiles(projectId, formData) {
  // Use proxy-friendly path; do not include base so dev proxy can rewrite
  const url = `/api/projects/${projectId}/upload?visibility=all`;
  // Use fetch directly because apiFetch defaults to JSON
  const token = localStorage.getItem("ca_token");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const resp = await fetch(url, {
    method: "POST",
    headers,
    body: formData,
    credentials: "include",
  });
  const isJson = resp.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await resp.json().catch(() => ({})) : await resp.text();
  if (!resp.ok) {
    const message = isJson
      ? data?.detail || data?.message || resp.statusText
      : data;
    const err = new Error(message || `Upload failed (HTTP ${resp.status})`);
    err.status = resp.status;
    err.data = data;
    throw err;
  }
  return data;
}

export async function createChatSession(payload) {
  return apiFetch("/chat/sessions", { method: "POST", body: payload });
}
