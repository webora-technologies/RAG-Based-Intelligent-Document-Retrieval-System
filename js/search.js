/**
 * search.js — Student search page (search.html).
 */
import { search as apiSearch } from "./api.js";
import { Auth } from "./auth.js";
import { CONFIG, SUBJECTS } from "./config.js";
import {
  Toast, escapeHTML, renderSkeleton,
  populateYearSelect, populateSemesterSelect, linkYearSemester,
  highlightWords,
} from "./ui.js";

/* ─── Guards ─── */
const currentUser = Auth.requireLogin();
if (!currentUser) throw new Error("stop");
Auth.renderUserName();
Auth.bindLogout();

/* Update role badge to reflect actual role */
const roleBadge = document.getElementById("role-badge");
if (roleBadge) roleBadge.textContent = currentUser.role === "admin" ? "Admin" : "Student";
const adminNav = document.getElementById("nav-documents");
if (adminNav && currentUser.role === "admin") adminNav.hidden = false;

/* ─── DOM refs ─── */
const queryInput = document.getElementById("search-query");
const charCount = document.getElementById("char-count");
const searchBtn = document.getElementById("btn-search");
const clearFiltersBtn = document.getElementById("btn-clear-filters");
const yearSel = document.getElementById("filter-year");
const semSel = document.getElementById("filter-sem");
const subjectSel = document.getElementById("filter-subject");
const resultsArea = document.getElementById("results-area");
const recentList = document.getElementById("recent-list");
const recentSection = document.getElementById("recent-section");
const suggestionsSection = document.getElementById("suggestions-section");
const clearQueryBtn = document.getElementById("btn-clear-query");

/* ─── Initialise selects ─── */
populateYearSelect(yearSel, true);
linkYearSemester(yearSel, semSel, true);

/* Populate subjects */
subjectSel.innerHTML = '<option value="">All Subjects</option>';
SUBJECTS.forEach((s) => {
  const o = document.createElement("option");
  o.value = s; o.textContent = s;
  subjectSel.appendChild(o);
});

/* ─── Character counter ─── */
queryInput.addEventListener("input", () => {
  const len = queryInput.value.length;
  charCount.textContent = `${len} / 500`;
  charCount.classList.toggle("char-count--warn", len > 450);
  clearQueryBtn.hidden = len === 0;
  suggestionsSection.hidden = len > 0;
});

clearQueryBtn.addEventListener("click", () => {
  queryInput.value = "";
  charCount.textContent = "0 / 500";
  charCount.classList.remove("char-count--warn");
  clearQueryBtn.hidden = true;
  suggestionsSection.hidden = false;
  showInitialState();
  queryInput.focus();
});

/* ─── Recent searches ─── */
function getRecent() {
  try {
    return JSON.parse(sessionStorage.getItem(CONFIG.SESSION_KEYS.RECENT_SEARCHES) ?? "[]");
  } catch (_) { return []; }
}

function saveRecent(query) {
  let list = getRecent().filter((q) => q !== query);
  list.unshift(query);
  list = list.slice(0, CONFIG.MAX_RECENT_SEARCHES);
  sessionStorage.setItem(CONFIG.SESSION_KEYS.RECENT_SEARCHES, JSON.stringify(list));
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
    btn.addEventListener("click", () => {
      queryInput.value = q;
      queryInput.dispatchEvent(new Event("input"));
      runSearch();
    });
    recentList.appendChild(btn);
  });
}

renderRecent();

/* ─── Filter clear ─── */
clearFiltersBtn.addEventListener("click", () => {
  yearSel.value = "";
  populateSemesterSelect(semSel, "", true);
  subjectSel.value = "";
});

/* ─── Search trigger ─── */
searchBtn.addEventListener("click", runSearch);
queryInput.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); runSearch(); } });
document.querySelectorAll(".suggestion-card").forEach((button) => {
  button.addEventListener("click", () => {
    queryInput.value = button.dataset.query;
    queryInput.dispatchEvent(new Event("input"));
    runSearch();
  });
});
document.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
    e.preventDefault();
    queryInput.focus();
  }
});

/* ─── Results rendering ─── */
function showState(html) { resultsArea.innerHTML = html; }

function showInitialState() {
  showState(`
    <div class="result-state result-state--init" role="status">
      <div class="result-state__icon" aria-hidden="true">✦</div>
      <p class="result-state__title">Your study library is ready</p>
      <p class="result-state__body">
        Ask a question above or choose a popular question to find answers with exact document citations.
      </p>
    </div>`);
}

function renderNoEvidence() {
  showState(`
    <div class="result-state result-state--empty" role="status">
      <div class="result-state__icon" aria-hidden="true">📭</div>
      <p class="result-state__title">No Evidence Found</p>
      <p class="result-state__body">
        The uploaded documents do not provide enough information to answer this question.
      </p>
      <p class="result-state__tip">
        <strong>Tip:</strong> Try rephrasing your question, using different keywords, or removing some filters.
      </p>
    </div>`);
}

function renderError(msg, query, year, semester, subject) {
  const safeMsg = escapeHTML(msg);
  showState(`
    <div class="result-state result-state--error" role="alert">
      <div class="result-state__icon" aria-hidden="true">⚠️</div>
      <p class="result-state__title">Something went wrong</p>
      <p class="result-state__body">${safeMsg}</p>
      <button id="btn-retry" class="btn btn--primary btn--sm">Retry</button>
    </div>`);
  document.getElementById("btn-retry").addEventListener("click", () =>
    _doSearch(query, year, semester, subject)
  );
}

function renderResults(answer, sources, queryWords) {
  const answerHTML = escapeHTML(answer).replace(
    /\[(\d+)\]/g,
    (_, n) => `<a href="#src-${escapeHTML(n)}" class="cite-link">[${escapeHTML(n)}]</a>`
  );

  const sourcesHTML = sources.map((src, idx) => {
    const n = idx + 1;
    const title = escapeHTML(src.document_title);
    const page = escapeHTML(String(src.page));
    const passage = highlightWords(src.passage, queryWords);
    const score = Math.round((src.score ?? 0) * 100);
    return `
      <div class="source-card" id="src-${n}">
        <div class="source-card__header">
          <span class="source-num">[${n}]</span>
          <span class="source-title">${title}</span>
          <span class="source-page">— Page ${page}</span>
          <span class="source-score badge badge--info">${score}% match</span>
          <button class="source-toggle btn btn--ghost btn--sm" aria-expanded="false"
                  aria-controls="src-body-${n}" data-target="src-body-${n}">
            Show passage ▼
          </button>
        </div>
        <div class="source-card__body" id="src-body-${n}" hidden>
          <blockquote class="passage">${passage}</blockquote>
        </div>
      </div>`;
  }).join("");

  showState(`
    <section class="answer-section" aria-label="Answer">
      <div class="answer-card">
        <div class="answer-card__header">
          <span class="answer-icon" aria-hidden="true">🤖</span>
          <h2 class="answer-card__title">Answer</h2>
          <button class="answer-copy btn btn--secondary btn--sm" type="button" aria-label="Copy answer with source citations">
            <span aria-hidden="true">▢</span> Copy with citations
          </button>
        </div>
        <div class="answer-card__body">
          <p class="answer-text">${answerHTML}</p>
        </div>
      </div>
    </section>
    <section class="sources-section" aria-label="Source documents">
      <h3 class="sources-title">
        <span aria-hidden="true">📄</span> Source Documents
        <span class="sources-count">${sources.length} citation${sources.length !== 1 ? "s" : ""}</span>
      </h3>
      <div class="sources-list">${sourcesHTML}</div>
    </section>`);

  resultsArea.querySelector(".answer-copy").addEventListener("click", async (event) => {
    const button = event.currentTarget;
    if (!navigator.clipboard?.writeText) {
      Toast.error("Copying isn't available in this browser context.");
      return;
    }
    try {
      const citationList = sources
        .map((source, index) => `[${index + 1}] ${source.document_title}, page ${source.page}`)
        .join("\n");
      await navigator.clipboard.writeText(`${answer}\n\nSources\n${citationList}`);
      button.innerHTML = '<span aria-hidden="true">✓</span> Copied';
      Toast.success("Answer and source citations copied.");
    } catch (err) {
      Toast.error(`Couldn't copy the answer: ${err.message}`);
    }
  });

  resultsArea.querySelectorAll(".source-toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.dataset.target;
      const body = document.getElementById(targetId);
      const isHidden = body.hasAttribute("hidden");
      if (isHidden) {
        body.removeAttribute("hidden");
        btn.setAttribute("aria-expanded", "true");
        btn.textContent = "Hide passage ▲";
      } else {
        body.setAttribute("hidden", "");
        btn.setAttribute("aria-expanded", "false");
        btn.textContent = "Show passage ▼";
      }
    });
  });
}

/* ─── Core search flow ─── */
let _reqSeq = 0;

async function _doSearch(query, year, semester, subject) {
  const seq = ++_reqSeq;
  renderSkeleton(resultsArea, 3);
  resultsArea.setAttribute("aria-busy", "true");

  try {
    const result = await apiSearch({
      query,
      year: year || undefined,
      semester: semester ? Number(semester) : undefined,
      subject: subject || undefined,
    });

    if (seq !== _reqSeq) return;   // a newer search superseded this one

    if (result.status === "no_evidence") {
      renderNoEvidence();
    } else {
      const queryWords = query.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
      renderResults(result.answer, result.sources, queryWords);
    }
  } catch (err) {
    if (seq !== _reqSeq) return;
    renderError(err.message, query, year, semester, subject);
  } finally {
    if (seq === _reqSeq) resultsArea.removeAttribute("aria-busy");
  }
}

function runSearch() {
  const query = queryInput.value.trim();
  if (!query) {
    Toast.warning("Please enter a question before searching.");
    queryInput.focus();
    return;
  }
  if (query.length > 500) {
    Toast.warning("Question is too long (max 500 characters).");
    return;
  }

  const year = yearSel.value;
  const semester = semSel.value;
  const subject = subjectSel.value;

  suggestionsSection.hidden = true;
  saveRecent(query);
  _doSearch(query, year, semester, subject);
}