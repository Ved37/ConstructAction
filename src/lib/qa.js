const DEFAULT_QA_BASE = "http://localhost:8000";

function getQaBase() {
  // Prefer explicit QA host, then API URL, then local default
  return (
    import.meta.env.VITE_QA_BASE ||
    import.meta.env.VITE_API_URL ||
    DEFAULT_QA_BASE
  );
}

export function buildSourceUrl(path) {
  // Ensure absolute URL for source links
  const base = getQaBase().replace(/\/$/, "");
  if (!path) return base;
  if (/^https?:\/\//i.test(path)) return path;
  const joined = path.startsWith("/") ? path : `/${path}`;
  return `${base}${joined}`;
}

export async function ask({
  question,
  top_k,
  mode,
  max_tokens,
  polish,
  return_raw,
} = {}) {
  const base = getQaBase().replace(/\/$/, "");
  const url = `${base}/qa/ask`;
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      question,
      top_k,
      mode,
      max_tokens,
      polish,
      return_raw,
    }),
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`QA request failed (${resp.status}): ${text}`);
  }
  return resp.json();
}
