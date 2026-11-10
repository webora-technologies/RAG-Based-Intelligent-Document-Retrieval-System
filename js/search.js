/**
 * search.js — Student search page (search.html).
 * Phase 1: works with sample data. Phase 2 sends the same requests to the backend.
 */
import { search as apiSearch, listDocuments } from "./api.js";
import { Auth } from "./auth.js";
import { CONFIG, SUBJECTS, UNIVERSITIES, DEPARTMENTS } from "./config.js";
import {
  Toast, Modal, escapeHTML, renderSkeleton,
  populateYearSelect, populateSemesterSelect, linkYearSemester,
  highlightWords,
} from "./ui.js";

/* ─── Guards ─── */
const currentUser = Auth.requireLogin();
if (!currentUser) throw new Error("stop");
Auth.renderUserName();
Auth.bindLogout();

const roleBadge = document.getElementById("role-badge");
if (roleBadge) roleBadge.textContent = currentUser.role === "admin" ? "Admin" : "Student";
const adminNav = document.getElementById("nav-documents");
if (adminNav && currentUser.role === "admin") adminNav.hidden = false;

/* ─── DOM refs ─── */
const queryInput = document.getElementById("search-query");
const charCount = document.getElementById("char-count");
const searchBtn = document.getElementById("btn-search");
const clearFiltersBtn = document.getElementById("btn-clear-filters");
const uniSel = document.getElementById("filter-university");
const deptSel = document.getElementById("filter-department");
const yearSel = document.getElementById("filter-year");
const semSel = document.getElementById("filter-sem");
const subjectSel = document.getElementById("filter-subject");
const bookSel = document.getElementById("filter-textbook");
const chapterSel = document.getElementById("filter-chapter");
const resultsArea = document.getElementById("results-area");
const recentList = document.getElementById("recent-list");
const recentSection = document.getElementById("recent-section");
const suggestionsSection = document.getElementById("suggestions-section");
const clearQueryBtn = document.getElementById("btn-clear-query");

/* ─── Initialise selects ─── */
UNIVERSITIES.forEach((u) => uniSel.appendChild(new Option(u, u)));
DEPARTMENTS.forEach((d) => deptSel.appendChild(new Option(d, d)));
populateYearSelect(yearSel, true);
linkYearSemester(yearSel, semSel, true);
SUBJECTS.forEach((s) => subjectSel.appendChild(new Option(s, s)));

let textbookDocs = [];

function getFilters() {
  return {
    university: uniSel.value || undefined,
    department: deptSel.value || undefined,
    year: yearSel.value || undefined,
    semester: semSel.value ? Number(semSel.value) : undefined,
    subject: subjectSel.value || undefined,
    document_id: bookSel.value || undefined,
    chapter: chapterSel.value ? Number(chapterSel.value) : undefined,
  };
}

async function refreshTextbooks() {
  const f = getFilters();
  const keep = bookSel.value;
  try {
    textbookDocs = await listDocuments({
      status: "Indexed", university: f.university, department: f.department,
      year: f.year, semester: f.semester, subject: f.subject,
    });
  } catch (_) { textbookDocs = []; }
  bookSel.innerHTML = '<option value="">All Textbooks</option>';
  textbookDocs.forEach((d) => bookSel.appendChild(new Option(d.title, d.id)));
  bookSel.value = textbookDocs.some((d) => d.id === keep) ? keep : "";
  refreshChapters();
}

function refreshChapters() {
  const doc = textbookDocs.find((d) => d.id === bookSel.value);
  const keep = chapterSel.value;
  chapterSel.innerHTML = "";
  if (!doc) {
    chapterSel.appendChild(new Option("Select a textbook first", ""));
    chapterSel.disabled = true;
    return;
  }
  const chapters = doc.chapters || [];
  if (!chapters.length) {
    chapterSel.appendChild(new Option("No chapters listed", ""));
    chapterSel.disabled = true;
    return;
  }
  chapterSel.disabled = false;
  chapterSel.appendChild(new Option("All Chapters", ""));
  chapters.forEach((c) => chapterSel.appendChild(new Option(`Ch. ${c.no}: ${c.name}`, String(c.no))));
  chapterSel.value = chapters.some((c) => String(c.no) === keep) ? keep : "";
}

refreshChapters();   // start with the chapter list disabled until a textbook is chosen
[uniSel, deptSel, yearSel, semSel, subjectSel].forEach((s) => s.addEventListener("change", refreshTextbooks));
bookSel.addEventListener("change", refreshChapters);

async function applyFilters(f = {}) {
  uniSel.value = f.university || "";
  deptSel.value = f.department || "";
  yearSel.value = f.year || "";
  populateSemesterSelect(semSel, f.year || "", true);
  semSel.value = f.semester ? String(f.semester) : "";
  subjectSel.value = f.subject || "";
  await refreshTextbooks();
  bookSel.value = f.document_id && textbookDocs.some((d) => d.id === f.document_id) ? f.document_id : "";
  refreshChapters();
  chapterSel.value = f.chapter ? String(f.chapter) : "";
}

/* ─── Character counter ─── */
function syncQueryUI() {
  const len = queryInput.value.length;
  charCount.textContent = `${len} / 500`;
  charCount.classList.toggle("char-count--warn", len > 450);
  clearQueryBtn.hidden = len === 0;
  suggestionsSection.hidden = len > 0;
}
queryInput.addEventListener("input", syncQueryUI);

clearQueryBtn.addEventListener("click", () => {
  queryInput.value = "";
  syncQueryUI();
  suggestionsSection.hidden = false;
  showInitialState();
  queryInput.focus();
});

/* ─── Recent searches ─── */
function getRecent() {
  try { return JSON.parse(sessionStorage.getItem(CONFIG.SESSION_KEYS.RECENT_SEARCHES) ?? "[]"); }
  catch (_) { return []; }
}
function saveRecent(query) {
  let list = getRecent().filter((q) => q !== query);
  list.unshift(query);
  list = list.slice(0, CONFIG.MAX_RECENT_SEARCHES);
  try { sessionStorage.setItem(CONFIG.SESSION_KEYS.RECENT_SEARCHES, JSON.stringify(list)); } catch (_) { }
  renderRecent();
}
function renderRecent() {
  const list = getRecent();
  if (list.length === 0) { recentSection.hidden = true; return; }
  recentSection.hidden = false;
  recentList.innerHTML = "";
  list.forEach((q) => {
    const btn = document.createElement("button");
    btn.className = "recent-chip";
    btn.type = "button";
    btn.textContent = q;
    btn.title = `Search: ${q}`;
    btn.addEventListener("click", () => { queryInput.value = q; syncQueryUI(); runSearch(); });
    recentList.appendChild(btn);
  });
}
renderRecent();

/* ─── Filter clear ─── */
clearFiltersBtn.addEventListener("click", () => applyFilters({}));

/* ─── Answer length ─── */
const LENGTHS = ["short", "medium", "detailed"];
let answerLength = "medium";
try {
  const saved = localStorage.getItem(CONFIG.SESSION_KEYS.ANSWER_LENGTH);
  if (LENGTHS.includes(saved)) answerLength = saved;
} catch (_) { }

const lengthBtns = [...document.querySelectorAll(".segmented__btn")];
function syncLengthUI() {
  lengthBtns.forEach((b) => b.setAttribute("aria-checked", String(b.dataset.length === answerLength)));
}
syncLengthUI();
lengthBtns.forEach((b) => b.addEventListener("click", () => {
  answerLength = b.dataset.length;
  try { localStorage.setItem(CONFIG.SESSION_KEYS.ANSWER_LENGTH, answerLength); } catch (_) { }
  syncLengthUI();
  if (current && current.result.status === "ok") renderResults(current.result, current.query);
}));

/* ─── Search trigger ─── */
searchBtn.addEventListener("click", runSearch);
queryInput.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); runSearch(); } });
document.querySelectorAll(".suggestion-card").forEach((button) => {
  button.addEventListener("click", () => { queryInput.value = button.dataset.query; syncQueryUI(); runSearch(); });
});
document.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); queryInput.focus(); }
});

/* ─── Result states ─── */
function showState(html) { resultsArea.innerHTML = html; }

function showInitialState() {
  current = null;
  showState(`
    <div class="result-state result-state--init" role="status">
      <div class="result-state__icon" aria-hidden="true">✦</div>
      <p class="result-state__title">Your study library is ready</p>
      <p class="result-state__body">
        Ask a question above or choose a popular question to find answers with exact document citations.
      </p>
    </div>`);
}

function renderNoEvidence(filtered) {
  showState(`
    <div class="result-state result-state--empty" role="status">
      <div class="result-state__icon" aria-hidden="true">📭</div>
      <p class="result-state__title">Answer Verification</p>
      <p class="result-state__body">
        Sorry, the answer to this question could not be found in the uploaded textbooks or notes.
        Please ask a question related to the available study materials.
      </p>
      ${filtered ? '<p class="result-state__hint">Your filters may be narrowing the search too much. Try clearing them.</p>' : ""}
    </div>`);
}

function renderError(message, query) {
  showState(`
    <div class="result-state result-state--error" role="alert">
      <div class="result-state__icon" aria-hidden="true">⚠️</div>
      <p class="result-state__title">Something went wrong</p>
      <p class="result-state__body">${escapeHTML(message)}</p>
      <button class="btn btn--primary" id="btn-retry" type="button">Retry</button>
    </div>`);
  document.getElementById("btn-retry").addEventListener("click", () => _doSearch(query, getFilters()));
}

function renderDocumentsOnly(result) {
  const cards = result.documents.map((d) => `
    <div class="doc-match">
      <div class="doc-match__title">${escapeHTML(d.title)}</div>
      <div class="doc-match__meta">${escapeHTML(d.subject)} · ${escapeHTML(d.year)} · Semester ${escapeHTML(String(d.semester))} · ${escapeHTML(d.university)}</div>
    </div>`).join("");
  showState(`
    <section class="answer-section" aria-label="Matching documents">
      <div class="answer-card">
        <div class="answer-card__header">
          <span class="answer-icon" aria-hidden="true">📚</span>
          <h2 class="answer-card__title">Matching documents found</h2>
        </div>
        <div class="answer-card__body">
          <p class="answer-text">These uploaded documents match your question by title and subject:</p>
          ${cards}
          <p class="answer-note">In this Phase 1 demo, answers are written from the sample study material. Reading the full text of newly uploaded PDFs, and answering from it, is added in Phase 2.</p>
          <a class="btn btn--secondary btn--sm" href="study.html">Open My Study Materials</a>
        </div>
      </div>
    </section>`);
}

/* ─── Answer + sources ─── */
let current = null;   // { query, filters, result }

function answerHTML(text) {
  return text.split(/\n\n+/).map((para) =>
    `<p class="answer-text">${escapeHTML(para).replace(
      /\[(\d+)\]/g,
      (_, n) => `<button type="button" class="cite-link" data-src="${n}" aria-label="Open source ${n}">[${n}]</button>`
    )}</p>`).join("");
}

function chapterLabel(src) {
  return src.chapter_no ? `Chapter ${src.chapter_no}: ${src.chapter_name}` : "";
}

function citationText(src, n) {
  const ch = chapterLabel(src);
  return `[${n}] ${src.document_title}${ch ? ", " + ch : ""}, page ${src.page}`;
}

function renderResults(result, query) {
  const sources = result.sources;
  const text = (result.answers && result.answers[answerLength]) || result.answer;
  const queryWords = query.toLowerCase().split(/\s+/).filter((w) => w.length > 2);

  const sourcesHTML = sources.map((src, idx) => {
    const n = idx + 1;
    const ch = chapterLabel(src);
    return `
      <div class="source-card" id="src-${n}">
        <div class="source-card__header">
          <span class="source-num">[${n}]</span>
          <span class="source-title">${escapeHTML(src.document_title)}</span>
          <span class="source-score badge badge--info">${Math.round((src.score ?? 0) * 100)}% match</span>
        </div>
        <div class="source-chips">
          ${ch ? `<span class="chip">📖 ${escapeHTML(ch)}</span>` : ""}
          <span class="chip">📄 Page ${escapeHTML(String(src.page))}</span>
          <span class="chip">${escapeHTML(src.subject)}</span>
          <span class="chip">${escapeHTML(src.year)} · Sem ${escapeHTML(String(src.semester))}</span>
        </div>
        <div class="source-actions">
          <button type="button" class="btn btn--primary btn--sm btn-view-source" data-src="${n}">View source</button>
          <button class="source-toggle btn btn--ghost btn--sm" type="button" aria-expanded="false" data-target="src-body-${n}">Show passage ▼</button>
        </div>
        <div class="source-card__body" id="src-body-${n}" hidden>
          <blockquote class="passage">${highlightWords(src.passage, queryWords)}</blockquote>
        </div>
      </div>`;
  }).join("");

  showState(`
    <section class="answer-section" aria-label="Answer">
      <div class="answer-card">
        <div class="answer-card__header">
          <span class="answer-icon" aria-hidden="true">🤖</span>
          <h2 class="answer-card__title">Answer</h2>
          <span class="badge badge--info answer-length-badge">${answerLength[0].toUpperCase() + answerLength.slice(1)}</span>
          <button class="answer-copy btn btn--secondary btn--sm" type="button" aria-label="Copy answer with source citations">
            <span aria-hidden="true">▢</span> Copy with citations
          </button>
        </div>
        <div class="answer-card__body">
          ${answerHTML(text)}
          <p class="answer-note">🔒 Based only on the uploaded textbooks and notes. Select a number such as [1] to open its source.</p>
        </div>
      </div>
    </section>
    <section class="sources-section" aria-label="Source references">
      <h3 class="sources-title">
        <span aria-hidden="true">📄</span> Source references
        <span class="sources-count">${sources.length} citation${sources.length !== 1 ? "s" : ""}</span>
      </h3>
      <div class="sources-list">${sourcesHTML}</div>
    </section>`);

  resultsArea.querySelector(".answer-copy").addEventListener("click", async (event) => {
    const button = event.currentTarget;
    if (!navigator.clipboard?.writeText) { Toast.error("Copying isn't available in this browser context."); return; }
    try {
      const list = sources.map((s, i) => citationText(s, i + 1)).join("\n");
      await navigator.clipboard.writeText(`${text}\n\nSources\n${list}`);
      button.innerHTML = '<span aria-hidden="true">✓</span> Copied';
      Toast.success("Answer and source citations copied.");
    } catch (err) { Toast.error(`Couldn't copy the answer: ${err.message}`); }
  });

  resultsArea.querySelectorAll(".cite-link, .btn-view-source").forEach((b) =>
    b.addEventListener("click", () => openSource(Number(b.dataset.src), query)));

  resultsArea.querySelectorAll(".source-toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      const body = document.getElementById(btn.dataset.target);
      const hidden = body.hasAttribute("hidden");
      if (hidden) { body.removeAttribute("hidden"); btn.setAttribute("aria-expanded", "true"); btn.textContent = "Hide passage ▲"; }
      else { body.setAttribute("hidden", ""); btn.setAttribute("aria-expanded", "false"); btn.textContent = "Show passage ▼"; }
    });
  });
}

/* ─── Source viewer ─── */
let viewedCitation = "";
function openSource(n, query) {
  if (!current || current.result.status !== "ok") return;
  const src = current.result.sources[n - 1];
  if (!src) return;
  const words = (query || current.query).toLowerCase().split(/\s+/).filter((w) => w.length > 2);
  const ch = chapterLabel(src);
  viewedCitation = citationText(src, n);
  document.getElementById("source-title").textContent = `Source [${n}]`;
  document.getElementById("source-body").innerHTML = `
    <dl class="src-meta">
      <div><dt>Textbook / document</dt><dd>${escapeHTML(src.document_title)}</dd></div>
      <div><dt>Chapter</dt><dd>${ch ? escapeHTML(ch) : "Not specified"}</dd></div>
      <div><dt>Page</dt><dd>${escapeHTML(String(src.page))}</dd></div>
      <div><dt>Subject</dt><dd>${escapeHTML(src.subject)}</dd></div>
      <div><dt>Academic year</dt><dd>${escapeHTML(src.year)} · Semester ${escapeHTML(String(src.semester))}</dd></div>
      <div><dt>University / Department</dt><dd>${escapeHTML(src.university)} · ${escapeHTML(src.department)}</dd></div>
    </dl>
    <p class="src-label">Original passage supporting the answer (page ${escapeHTML(String(src.page))})</p>
    <blockquote class="passage">${highlightWords(src.passage, words)}</blockquote>`;
  Modal.open("modal-source");
}
const closeSource = () => Modal.close("modal-source");
document.getElementById("btn-source-close").addEventListener("click", closeSource);
document.getElementById("btn-source-done").addEventListener("click", closeSource);
document.getElementById("btn-source-copy").addEventListener("click", async () => {
  try { await navigator.clipboard.writeText(viewedCitation); Toast.success("Citation copied."); }
  catch (_) { Toast.error("Copying isn't available in this browser context."); }
});

/* ─── History ─── */
const historyKey = `${CONFIG.SESSION_KEYS.HISTORY}_${currentUser.role}_${currentUser.name}`;
const drawer = document.getElementById("history-drawer");
const historyList = document.getElementById("history-list");
const historyCount = document.getElementById("history-count");

function loadHistory() {
  try { return JSON.parse(localStorage.getItem(historyKey) ?? "[]"); } catch (_) { return []; }
}
function storeHistory(list) {
  try { localStorage.setItem(historyKey, JSON.stringify(list)); } catch (_) { }
  historyCount.textContent = String(list.length);
}
function addHistory(query, filters, result) {
  const sig = JSON.stringify([query.toLowerCase(), filters]);
  let list = loadHistory().filter((h) => JSON.stringify([h.query.toLowerCase(), h.filters]) !== sig);
  list.unshift({ id: "h" + Date.now(), ts: new Date().toISOString(), query, filters, result });
  storeHistory(list.slice(0, CONFIG.MAX_HISTORY));
}
function filterChips(f) {
  const parts = [f.subject, f.year && `${f.year}${f.semester ? " · Sem " + f.semester : ""}`, f.university, f.department]
    .filter(Boolean);
  return parts.map((p) => `<span class="chip chip--sm">${escapeHTML(p)}</span>`).join("");
}
function renderHistory() {
  const list = loadHistory();
  historyCount.textContent = String(list.length);
  if (!list.length) {
    historyList.innerHTML = '<li class="history-empty">No questions yet. Your questions and answers will appear here so you can revise them later.</li>';
    return;
  }
  historyList.innerHTML = list.map((h) => {
    const snippet = h.result.status === "ok"
      ? (h.result.answers?.short || h.result.answer)
      : "Matching documents found";
    const when = new Date(h.ts).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
    return `
      <li class="history-item">
        <button type="button" class="history-item__main" data-id="${escapeHTML(h.id)}">
          <span class="history-item__q">${escapeHTML(h.query)}</span>
          <span class="history-item__a">${escapeHTML(snippet.replace(/\[\d+\]/g, "").slice(0, 120))}…</span>
          <span class="history-item__meta">${escapeHTML(when)} ${filterChips(h.filters || {})}</span>
        </button>
        <button type="button" class="history-item__del" data-del="${escapeHTML(h.id)}" aria-label="Delete this item">&times;</button>
      </li>`;
  }).join("");
}
function openDrawer() { renderHistory(); drawer.hidden = false; document.body.classList.add("body--modal-open"); document.getElementById("btn-history-close").focus(); }
function closeDrawer() { drawer.hidden = true; document.body.classList.remove("body--modal-open"); document.getElementById("btn-history").focus(); }
document.getElementById("btn-history").addEventListener("click", openDrawer);
document.getElementById("btn-history-close").addEventListener("click", closeDrawer);
document.getElementById("history-backdrop").addEventListener("click", closeDrawer);
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !drawer.hidden) closeDrawer(); });
document.getElementById("btn-history-clear").addEventListener("click", () => {
  if (!loadHistory().length) return;
  storeHistory([]); renderHistory(); Toast.success("History cleared.");
});
historyList.addEventListener("click", async (e) => {
  const del = e.target.closest("[data-del]");
  if (del) {
    storeHistory(loadHistory().filter((h) => h.id !== del.dataset.del));
    renderHistory();
    return;
  }
  const open = e.target.closest("[data-id]");
  if (!open) return;
  const item = loadHistory().find((h) => h.id === open.dataset.id);
  if (!item) return;
  closeDrawer();
  queryInput.value = item.query; syncQueryUI(); suggestionsSection.hidden = true;
  await applyFilters(item.filters || {});
  current = { query: item.query, filters: item.filters || {}, result: item.result };
  if (item.result.status === "ok") renderResults(item.result, item.query);
  else renderDocumentsOnly(item.result);
  resultsArea.scrollIntoView({ behavior: "smooth", block: "start" });
});
historyCount.textContent = String(loadHistory().length);

/* ─── Core search flow ─── */
let _reqSeq = 0;

async function _doSearch(query, filters) {
  const seq = ++_reqSeq;
  renderSkeleton(resultsArea, 3);
  resultsArea.setAttribute("aria-busy", "true");
  try {
    const result = await apiSearch({ query, ...filters, length: answerLength });
    if (seq !== _reqSeq) return;
    current = { query, filters, result };
    if (result.status === "ok") {
      renderResults(result, query);
      addHistory(query, filters, result);
    } else if (result.status === "documents_only") {
      renderDocumentsOnly(result);
      addHistory(query, filters, result);
    } else {
      renderNoEvidence(result.filtered);
    }
  } catch (err) {
    if (seq !== _reqSeq) return;
    renderError(err.message, query);
  } finally {
    if (seq === _reqSeq) resultsArea.removeAttribute("aria-busy");
  }
}

function runSearch() {
  const query = queryInput.value.trim();
  if (!query) { Toast.warning("Please enter a question before searching."); queryInput.focus(); return; }
  if (query.length > 500) { Toast.warning("Question is too long (max 500 characters)."); return; }
  suggestionsSection.hidden = true;
  saveRecent(query);
  _doSearch(query, getFilters());
}

/* ─── Start-up: read filters / question from the address (e.g. from My Study Materials) ─── */
(async () => {
  const p = new URLSearchParams(location.search);
  await refreshTextbooks();
  if ([...p.keys()].length) {
    await applyFilters({
      university: p.get("university") || undefined, department: p.get("department") || undefined,
      year: p.get("year") || undefined, semester: p.get("semester") ? Number(p.get("semester")) : undefined,
      subject: p.get("subject") || undefined, document_id: p.get("textbook") || undefined,
      chapter: p.get("chapter") ? Number(p.get("chapter")) : undefined,
    });
    const q = p.get("q");
    if (q) { queryInput.value = q; syncQueryUI(); runSearch(); }
  }
})();
