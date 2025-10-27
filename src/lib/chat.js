import { apiFetch } from "./api";

/**
 * Create a new chat session
 * @param {{ title: string, project_id?: number, session_type?: string }} payload
 * @returns {Promise<{ session_id: number }>}
 */
export async function createSession(payload) {
  return apiFetch("/chat/sessions", { method: "POST", body: payload });
}

/**
 * Get list of sessions for current user
 * @returns {Promise<{ sessions: { session_id: number; title: string; session_type: string; message_count: number; last_message_at: string | null }[] }>}
 */
export async function listSessions() {
  return apiFetch("/chat/sessions", { method: "GET" });
}

/**
 * Get the history for a specific session
 * @param {number} sessionId
 * @returns {Promise<{ history: { chat_id: number; query: string; response: string; response_time: number; sources_cited: { doc_id: number; chunk_id: number; pdf_name: string; page: number; dropbox_link: string | null; snippet: string; score: number; }[]; created_at: string }[] }>}
 */
export async function getHistory(sessionId) {
  return apiFetch(`/chat/sessions/${sessionId}/history`, { method: "GET" });
}

/**
 * Ask a question in a session (RAG)
 * @param {{ session_id: number; message: string; top_k?: number }} payload
 * @returns {Promise<{ session_id: number; message_id: number; answer_markdown: string; sources: { doc_id: number; chunk_id: number; pdf_name: string; page: number; dropbox_link: string | null; snippet: string; score: number; }[] }>}
 */
export async function sendQuery(payload) {
  return apiFetch("/chat/query", { method: "POST", body: payload });
}

/**
 * Trigger Dropbox re-sync (admin only)
 * @returns {Promise<{ status: string; processed: number; skipped: number; errors: any[] }>}
 */
export async function syncDropbox() {
  return apiFetch("/webhook/dropbox/sync", { method: "POST" });
}
