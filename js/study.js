/**
 * study.js — "My Study Materials" page (study.html): subject-wise textbooks and notes.
 */
import { listDocuments } from "./api.js";
import { Auth } from "./auth.js";
import { SUBJECTS, UNIVERSITIES, DEPARTMENTS } from "./config.js";
import { escapeHTML, populateYearSelect, linkYearSemester } from "./ui.js";

const currentUser = Auth.requireLogin();
if (!currentUser) throw new Error("stop");
Auth.renderUserName();
Auth.bindLogout();
const roleBadge = document.getElementById("role-badge");
if (roleBadge) roleBadge.textContent = currentUser.role === "admin" ? "Admin" : "Student";
const adminNav = document.getElementById("nav-documents");
if (adminNav && currentUser.role === "admin") adminNav.hidden = false;

const uniSel = document.getElementById("sf-university");
const deptSel = document.getElementById("sf-department");
const yearSel = document.getElementById("sf-year");
const semSel = document.getElementById("sf-sem");
UNIVERSITIES.forEach((u) => uniSel.appendChild(new Option(u, u)));
DEPARTMENTS.forEach((d) => deptSel.appendChild(new Option(d, d)));
populateYearSelect(yearSel, true);
linkYearSemester(yearSel, semSel, true);

const summaryEl = document.getElementById("study-summary");
const gridEl = document.getElementById("subject-grid");
const panelEl = document.getElementById("book-panel");

let docs = [];
let selectedSubject = new URLSearchParams(location.search).get("subject") || "";

function link(params) {
  return "search.html?" + new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString();
}

async function load() {
  gridEl.innerHTML = '<p class="form-help">Loading study materials…</p>';
  try {
    docs = await listDocuments({
      status: "Indexed",
      university: uniSel.value || undefined, department: deptSel.value || undefined,
      year: yearSel.value || undefined, semester: semSel.value ? Number(semSel.value) : undefined,
    });
  } catch (err) {
    gridEl.innerHTML = `<p class="form-help">Could not load study materials: ${escapeHTML(err.message)}</p>`;
    return;
  }
  render();
}

function bySubject(subject) { return docs.filter((d) => d.subject === subject); }

function render() {
  const withBooks = SUBJECTS.filter((s) => bySubject(s).length);
  summaryEl.innerHTML = `
    <div class="study-stat"><strong>${withBooks.length}</strong><span>subjects with study material</span></div>
    <div class="study-stat"><strong>${docs.length}</strong><span>textbooks and notes</span></div>
    <div class="study-stat"><strong>${docs.reduce((n, d) => n + (d.chapters || []).length, 0)}</strong><span>chapters listed</span></div>`;

  gridEl.innerHTML = SUBJECTS.map((s) => {
    const list = bySubject(s);
    const terms = [...new Set(list.map((d) => `${d.year} · Sem ${d.semester}`))].join(", ");
    return `
      <button type="button" class="subject-card ${list.length ? "" : "subject-card--empty"}" data-subject="${escapeHTML(s)}"
              aria-pressed="${s === selectedSubject}">
        <span class="subject-card__name">${escapeHTML(s)}</span>
        <span class="subject-card__count">${list.length} ${list.length === 1 ? "Textbook" : "Textbooks"}</span>
        <span class="subject-card__meta">${list.length ? escapeHTML(terms) : "No material uploaded yet"}</span>
      </button>`;
  }).join("");
  renderPanel();
}

function renderPanel() {
  if (!selectedSubject) { panelEl.hidden = true; return; }
  const list = bySubject(selectedSubject);
  panelEl.hidden = false;
  const subj = escapeHTML(selectedSubject);
  const books = list.map((d) => {
    const chapters = d.chapters || [];
    const chHTML = chapters.length
      ? `<details><summary>${chapters.length} chapters</summary><ul class="chapter-list">${chapters.map((c) =>
          `<li><span>Ch. ${c.no}: ${escapeHTML(c.name)} <small>(pages ${c.from}–${c.to})</small></span>
            <a href="${escapeHTML(link({ subject: d.subject, textbook: d.id, chapter: c.no }))}">Ask about this chapter</a></li>`).join("")}</ul></details>`
      : '<p class="form-help">No chapters listed for this document.</p>';
    return `
      <div class="book">
        <div class="book__title">${escapeHTML(d.title)}</div>
        <div class="book__meta">${escapeHTML(d.year)} · Semester ${escapeHTML(String(d.semester))} · ${escapeHTML(String(d.pages))} pages · ${escapeHTML(d.university)} · ${escapeHTML(d.department)}</div>
        <div class="book__actions">
          <a class="btn btn--primary btn--sm" href="${escapeHTML(link({ subject: d.subject, textbook: d.id }))}">Ask about this textbook</a>
        </div>
        ${chHTML}
      </div>`;
  }).join("");
  panelEl.innerHTML = `
    <div class="book-panel__head">
      <h2 class="book-panel__title">${subj}: ${list.length} ${list.length === 1 ? "textbook" : "textbooks"}</h2>
      <a class="btn btn--secondary btn--sm" href="${escapeHTML(link({ subject: selectedSubject }))}">Ask about the whole subject</a>
    </div>
    ${books || '<p class="form-help">No textbooks or notes are available for this subject with the current filters.</p>'}`;
}

gridEl.addEventListener("click", (e) => {
  const card = e.target.closest("[data-subject]");
  if (!card) return;
  selectedSubject = selectedSubject === card.dataset.subject ? "" : card.dataset.subject;
  render();
  if (selectedSubject) panelEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
});
[uniSel, deptSel, yearSel, semSel].forEach((s) => s.addEventListener("change", load));
load();
