// Simple QA client for POST /qa/ask
// Uses a base URL that defaults to http://localhost:8000 but can be overridden via VITE_QA_BASE or VITE_API_URL

const DEFAULT_QA_BASE = "http://localhost:8000";
const QA_BASE =
  import.meta.env.VITE_QA_BASE ||
  import.meta.env.VITE_API_URL ||
  DEFAULT_QA_BASE;

/**
 * Build absolute URL for a static source path returned by the backend
 * e.g. "/constructionpdfs/423-467.pdf" -> "http://host/constructionpdfs/423-467.pdf"
 */
export function buildSourceUrl(path) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  // ensure single slash join
  const base = QA_BASE.replace(/\/$/, "");
  const rel = String(path).startsWith("/") ? path : `/${path}`;
  return `${base}${rel}`;
}

/**
 * Ask a question to the QA endpoint
 * @param {{ question: string, top_k?: number }} payload
 * @returns {Promise<{ answer: string, score?: number, source?: string, page_number?: number, retrieved?: Array<{ source: string, page_number: number, snippet: string }> }>}
 */
export async function ask(payload) {
  const url = `${QA_BASE}/qa/ask`;
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      question: payload.question,
      top_k: payload.top_k ?? 5,
    }),
  });
  const isJson = resp.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await resp.json().catch(() => ({})) : await resp.text();
  if (!resp.ok) {
    const message =
      (isJson && (data?.detail || data?.message)) ||
      resp.statusText ||
      "Request failed";
    const err = new Error(`${message} (HTTP ${resp.status})`);
    err.status = resp.status;
    err.data = data;
    throw err;
  }
  return data;
}
