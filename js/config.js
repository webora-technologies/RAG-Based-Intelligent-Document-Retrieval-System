/**
 * config.js — Central configuration for the RAG Document Retrieval System.
 */
export const CONFIG = Object.freeze({
  /** Set to false in Phase 2 to use the real FastAPI backend. */
  USE_MOCK: true,

  /**
   * Phase 2: change to "https://your-server.example.com" (or "http://localhost:8000" for local dev).
   * Deployed servers MUST use HTTPS — the bearer token travels in this URL's
   * Authorization header and would otherwise cross the wire in cleartext.
   */
  API_BASE_URL: "http://localhost:8000",

  MAX_FILE_SIZE_MB: 20,

  SESSION_KEYS: {
    TOKEN: "rag_token",
    USER: "rag_user",
    RECENT_SEARCHES: "rag_recent_searches",
    DOCUMENTS: "rag_documents",
  },

  MAX_RECENT_SEARCHES: 5,

  YEAR_SEMESTER_MAP: {
    FE: [1, 2],
    SE: [3, 4],
    TE: [5, 6],
    BE: [7, 8],
  },

  YEAR_LABELS: {
    FE: "First Year (FE)",
    SE: "Second Year (SE)",
    TE: "Third Year (TE)",
    BE: "Final Year (BE)",
  },
});

/**
 * Department subject list. Safe to import from any page.
 * Kept here (not in mock-data.js) so production builds do not pull in
 * demo credentials / sample documents just to render a dropdown.
 *
 * Edit this array to add or rename subjects.
 */
export const SUBJECTS = Object.freeze([
  "Data Structures",
  "Database Management Systems",
  "Operating Systems",
  "Computer Networks",
  "Software Engineering",
  "Machine Learning",
  "Theory of Computation",
  "Web Technology",
]);
