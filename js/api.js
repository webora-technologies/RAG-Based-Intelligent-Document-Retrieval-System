/**
 * api.js — Service layer.
 *
 * All functions work in both modes:
 *   USE_MOCK = true  → uses mock functions (loaded dynamically — never bundled when false)
 *   USE_MOCK = false → calls real FastAPI server
 */
import { CONFIG } from "./config.js";
import { Auth } from "./auth.js";

/**
 * Lazily import mock-data.js. This keeps demo credentials and sample
 * documents out of the bundle when USE_MOCK is false.
 */
async function _mock() {
  return import("./mock-data.js");
}

/* ── Internal helpers ── */

function _authHeaders() {
  return { Authorization: `Bearer ${Auth.getToken() ?? ""}` };
}

async function _handleRes(res) {
  if (res.ok) return res.status === 204 ? undefined : res.json();
  let msg = `Server error (HTTP ${res.status})`;
  try { const d = await res.json(); msg = d.detail ?? d.message ?? msg; } catch (_) { }
  throw new Error(msg);
}

/* ════════════════════════════════════════════════════════════
   AUTH
════════════════════════════════════════════════════════════ */

export async function login(username, password) {
  if (CONFIG.USE_MOCK) return (await _mock()).mockLogin(username, password);
  const res = await fetch(`${CONFIG.API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  return _handleRes(res);
}

/* ════════════════════════════════════════════════════════════
   DOCUMENTS
════════════════════════════════════════════════════════════ */

export async function listDocuments(filters = {}) {
  if (CONFIG.USE_MOCK) return (await _mock()).mockListDocuments(filters);
  const p = new URLSearchParams();
  if (filters.year) p.set("year", filters.year);
  if (filters.semester) p.set("semester", String(filters.semester));
  if (filters.subject) p.set("subject", filters.subject);
  if (filters.status) p.set("status", filters.status);
  if (filters.search) p.set("search", filters.search);
  const res = await fetch(`${CONFIG.API_BASE_URL}/documents?${p}`, {
    headers: _authHeaders(),
  });
  return _handleRes(res);
}

export async function uploadDocument(file, metadata, onProgress) {
  if (CONFIG.USE_MOCK) return (await _mock()).mockUploadDocument(file, metadata, onProgress);

  const fd = new FormData();
  fd.append("file", file);
  fd.append("title", metadata.title);
  fd.append("year", metadata.year);
  fd.append("semester", String(metadata.semester));
  fd.append("subject", metadata.subject);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${CONFIG.API_BASE_URL}/documents`);
    xhr.setRequestHeader("Authorization", `Bearer ${Auth.getToken() ?? ""}`);
    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    });
    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try { resolve(JSON.parse(xhr.responseText)); }
        catch (_) { reject(new Error("Invalid server response.")); }
      } else {
        let msg = `HTTP ${xhr.status}`;
        try { msg = JSON.parse(xhr.responseText).detail ?? msg; } catch (_) { }
        reject(new Error(msg));
      }
    });
    xhr.addEventListener("error", () => reject(new Error("Network error during upload.")));
    xhr.send(fd);
  });
}

export async function updateDocument(id, metadata) {
  if (CONFIG.USE_MOCK) return (await _mock()).mockUpdateDocument(id, metadata);
  const res = await fetch(`${CONFIG.API_BASE_URL}/documents/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { ..._authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(metadata),
  });
  return _handleRes(res);
}

export async function deleteDocument(id) {
  if (CONFIG.USE_MOCK) return (await _mock()).mockDeleteDocument(id);
  const res = await fetch(`${CONFIG.API_BASE_URL}/documents/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: _authHeaders(),
  });
  return _handleRes(res);
}

/* ════════════════════════════════════════════════════════════
   SEARCH
════════════════════════════════════════════════════════════ */

export async function search(params) {
  if (CONFIG.USE_MOCK) return (await _mock()).mockSearch(params);
  const res = await fetch(`${CONFIG.API_BASE_URL}/search`, {
    method: "POST",
    headers: { ..._authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  return _handleRes(res);
}