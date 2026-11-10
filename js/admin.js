/**
 * admin.js — Admin dashboard (admin.html).
 */
import { listDocuments, uploadDocument, updateDocument, deleteDocument } from "./api.js";
import { Auth } from "./auth.js";
import { CONFIG, SUBJECTS, UNIVERSITIES, DEPARTMENTS } from "./config.js";
import {
  Toast, Modal, escapeHTML, escapeAttr, formatSize, formatDate,
  statusBadge, populateYearSelect, populateSemesterSelect, linkYearSemester,
} from "./ui.js";

/* ─── Auth guard ─── */
const currentUser = Auth.requireAdmin();
if (!currentUser) throw new Error("stop");
Auth.renderUserName();
Auth.bindLogout();

/* ─── State ─── */
let allDocs = [];

/* ─── DOM refs ─── */
const searchInput = document.getElementById("tbl-search");
const filterYear = document.getElementById("tbl-year");
const filterSem = document.getElementById("tbl-sem");
const filterSubj = document.getElementById("tbl-subject");
const filterStatus = document.getElementById("tbl-status");
const tableBody = document.getElementById("docs-tbody");
const emptyState = document.getElementById("tbl-empty");
const tblStatus = document.getElementById("tbl-status-live");
const statsTotal = document.getElementById("stat-total");
const statsIndexed = document.getElementById("stat-indexed");
const statsProc = document.getElementById("stat-processing");
const statsFailed = document.getElementById("stat-failed");

/* ─── Populate filter selects ─── */
populateYearSelect(filterYear, true);
linkYearSemester(filterYear, filterSem, true);
filterSubj.innerHTML = '<option value="">All Subjects</option>';
SUBJECTS.forEach((s) => { filterSubj.appendChild(new Option(s, s)); });

/* ─── Load documents ─── */
async function loadDocs() {
  tableBody.innerHTML = `<tr><td colspan="9" class="tbl-loading">Loading documents…</td></tr>`;
  try {
    allDocs = await listDocuments({});
    renderTable();
    updateStats();
  } catch (err) {
    tableBody.innerHTML = `<tr><td colspan="9" class="tbl-error">${escapeHTML(err.message)}</td></tr>`;
    Toast.error("Failed to load documents: " + err.message);
  }
}

function updateStats() {
  if (statsTotal) statsTotal.textContent = allDocs.length;
  if (statsIndexed) statsIndexed.textContent = allDocs.filter((d) => d.status === "Indexed").length;
  if (statsProc) statsProc.textContent = allDocs.filter((d) => d.status === "Processing" || d.status === "Pending").length;
  if (statsFailed) statsFailed.textContent = allDocs.filter((d) => d.status === "Failed").length;
  renderOverview();
}

function renderOverview() {
  const donut = document.getElementById("ov-donut");
  if (!donut) return;
  const total = allDocs.length;
  const parts = [
    ["Indexed", "#16a34a"], ["Processing", "#0891b2"], ["Pending", "#d97706"], ["Failed", "#dc2626"],
  ].map(([k, c]) => [k, c, allDocs.filter((d) => d.status === k).length]);
  let acc = 0;
  const stops = parts.filter((p) => p[2] > 0).map(([, c, n]) => {
    const a = acc, b = acc + (n / total) * 100; acc = b; return `${c} ${a}% ${b}%`;
  });
  donut.style.background = total ? `conic-gradient(${stops.join(",")})` : "#e2e8f0";
  document.getElementById("ov-total").textContent = total;
  document.getElementById("ov-legend").innerHTML = parts
    .map(([k, c, n]) => `<li><i style="background:${c}"></i>${k}: <b>${n}</b></li>`).join("");
  const bySubj = {};
  allDocs.forEach((d) => { bySubj[d.subject] = (bySubj[d.subject] || 0) + 1; });
  const max = Math.max(1, ...Object.values(bySubj));
  document.getElementById("ov-bars").innerHTML = Object.entries(bySubj).sort((a, b) => b[1] - a[1])
    .map(([s, n]) => `<div class="bar"><span title="${escapeHTML(s)}">${escapeHTML(s)}</span><span class="bar__track"><span class="bar__fill" style="width:${(n / max) * 100}%"></span></span><span>${n}</span></div>`).join("");
  document.getElementById("ov-recent").innerHTML = [...allDocs]
    .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt)).slice(0, 4)
    .map((d) => `<li>${escapeHTML(d.title)}<small>${escapeHTML(d.subject)} · ${new Date(d.uploadedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} · ${escapeHTML(d.status)}</small></li>`).join("");
}

function getFilteredDocs() {
  const q = searchInput.value.trim().toLowerCase();
  const year = filterYear.value;
  const sem = filterSem.value;
  const subj = filterSubj.value;
  const st = filterStatus.value;
  return allDocs.filter((d) => {
    if (q && !(`${d.title} ${d.fileName}`.toLowerCase().includes(q))) return false;
    if (year && d.year !== year) return false;
    if (sem && d.semester !== Number(sem)) return false;
    if (subj && d.subject !== subj) return false;
    if (st && d.status !== st) return false;
    return true;
  });
}

function renderTable() {
  const docs = getFilteredDocs();
  tableBody.innerHTML = "";

  if (docs.length === 0) {
    emptyState.hidden = false;
    if (tblStatus) tblStatus.textContent = "No documents match the current filters.";
    return;
  }
  emptyState.hidden = true;
  if (tblStatus) {
    tblStatus.textContent = `${docs.length} document${docs.length === 1 ? "" : "s"} shown.`;
  }

  docs.forEach((doc) => {
    const tr = document.createElement("tr");
    tr.dataset.id = doc.id;

    const failHint = doc.status === "Failed" && doc.errorMsg
      ? `<button class="btn-fail-info" title="${escapeAttr(doc.errorMsg)}" aria-label="Error details: ${escapeAttr(doc.errorMsg)}">⚠</button>`
      : "";

    tr.innerHTML = `
      <td class="td-title" title="${escapeAttr(doc.title)}">${escapeHTML(doc.title)}</td>
      <td class="td-file"><code>${escapeHTML(doc.fileName)}</code></td>
      <td>${escapeHTML(doc.year)}</td>
      <td>${escapeHTML(String(doc.semester))}</td>
      <td>${escapeHTML(doc.subject)}</td>
      <td>${escapeHTML(formatSize(doc.sizeMB))}</td>
      <td>${escapeHTML(formatDate(doc.uploadedAt))}</td>
      <td class="td-status">${statusBadge(doc.status)} ${failHint}</td>
      <td class="td-actions">
        <button class="btn btn--ghost btn--sm btn-edit" data-id="${escapeAttr(doc.id)}" aria-label="Edit ${escapeAttr(doc.title)}">Edit</button>
        <button class="btn btn--danger-ghost btn--sm btn-delete" data-id="${escapeAttr(doc.id)}" aria-label="Delete ${escapeAttr(doc.title)}">Delete</button>
      </td>`;
    tableBody.appendChild(tr);
  });
}

/* Event delegation — bound once, not per render */
tableBody.addEventListener("click", (e) => {
  const editBtn = e.target.closest(".btn-edit");
  if (editBtn) { openEditModal(editBtn.dataset.id); return; }
  const delBtn = e.target.closest(".btn-delete");
  if (delBtn) { openDeleteModal(delBtn.dataset.id); return; }
  const infoBtn = e.target.closest(".btn-fail-info");
  if (infoBtn) { Toast.error(infoBtn.title); return; }
});

/* Filter listeners */
[searchInput, filterYear, filterSem, filterSubj, filterStatus].forEach((el) => {
  el.addEventListener("input", renderTable);
  el.addEventListener("change", renderTable);
});

/* Status change listener (from mock timers) */
document.addEventListener("rag:statusChange", (e) => {
  const { id, status } = e.detail;
  const doc = allDocs.find((d) => d.id === id);
  if (doc) { doc.status = status; renderTable(); updateStats(); }
});

/* ════════════════════════════════════════
   UPLOAD MODAL
════════════════════════════════════════ */
const uploadYearSel = document.getElementById("up-year");
const uploadSemSel = document.getElementById("up-sem");
const uploadSubjSel = document.getElementById("up-subject");
const dropZone = document.getElementById("drop-zone");
const fileInput = document.getElementById("up-file-input");
const fileInfo = document.getElementById("up-file-info");
const progressBar = document.getElementById("upload-progress");
const progressRole = progressBar ? progressBar.querySelector('[role="progressbar"]') : null;
const progressFill = document.getElementById("upload-progress-fill");
const uploadForm = document.getElementById("upload-form");
const uploadErrEl = document.getElementById("upload-error");

populateYearSelect(uploadYearSel, false);
uploadYearSel.insertBefore(new Option("Select year…", ""), uploadYearSel.firstChild);
uploadYearSel.value = "";
linkYearSemester(uploadYearSel, uploadSemSel, false);
uploadSemSel.insertBefore(new Option("Select semester…", ""), uploadSemSel.firstChild);
uploadSemSel.value = "";
uploadSubjSel.innerHTML = '<option value="">Select subject…</option>';
SUBJECTS.forEach((s) => { uploadSubjSel.appendChild(new Option(s, s)); });
const uploadUniSel = document.getElementById("up-university");
const uploadDeptSel = document.getElementById("up-department");
UNIVERSITIES.forEach((u) => uploadUniSel.appendChild(new Option(u, u)));
DEPARTMENTS.forEach((d) => uploadDeptSel.appendChild(new Option(d, d)));

document.getElementById("btn-open-upload").addEventListener("click", () => {
  uploadForm.reset();
  fileInfo.textContent = "";
  uploadErrEl.hidden = true;
  progressBar.hidden = true;
  progressFill.style.width = "0%";
  if (progressRole) progressRole.setAttribute("aria-valuenow", "0");
  selectedFile = null;
  document.getElementById("up-chapters").value = "";
  Modal.open("modal-upload");
});

document.getElementById("btn-cancel-upload").addEventListener("click", () => Modal.close("modal-upload"));
document.getElementById("btn-cancel-upload-footer").addEventListener("click", () => Modal.close("modal-upload"));

/* Drag-and-drop */
dropZone.addEventListener("dragover", (e) => { e.preventDefault(); dropZone.classList.add("drop-zone--over"); });
dropZone.addEventListener("dragleave", () => dropZone.classList.remove("drop-zone--over"));
dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("drop-zone--over");
  const file = e.dataTransfer.files[0];
  if (file) handleFileSelected(file);
});
dropZone.addEventListener("click", () => fileInput.click());
dropZone.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fileInput.click(); } });
fileInput.addEventListener("change", () => { if (fileInput.files[0]) handleFileSelected(fileInput.files[0]); });

let selectedFile = null;

async function handleFileSelected(file) {
  uploadErrEl.hidden = true;
  const reject = (msg) => { showUploadError(msg); selectedFile = null; fileInfo.textContent = ""; };
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    return reject("Only PDF files are accepted. Please select a .pdf file.");
  }
  if (file.size === 0) {
    return reject("This file is empty (0 KB). Please choose a PDF that contains pages.");
  }
  const sizeMB = file.size / (1024 * 1024);
  if (sizeMB > CONFIG.MAX_FILE_SIZE_MB) {
    return reject(`File is too large (${sizeMB.toFixed(1)} MB). Maximum allowed size is ${CONFIG.MAX_FILE_SIZE_MB} MB.`);
  }
  /* A real PDF contains the marker "%PDF-" near the start. Renamed or damaged files do not. */
  try {
    const head = new TextDecoder("latin1").decode(await file.slice(0, 1024).arrayBuffer());
    if (!head.includes("%PDF-")) {
      return reject("This file has a .pdf name but is not a valid PDF (it may be renamed or damaged). Please export it again as a PDF.");
    }
  } catch (_) { /* if the browser cannot read the file head, accept it and continue */ }
  selectedFile = file;
  fileInfo.textContent = `${file.name}  (${sizeMB.toFixed(2)} MB)`;
}

function showUploadError(msg) {
  uploadErrEl.hidden = false;
  uploadErrEl.querySelector(".alert__msg").textContent = msg;
}

uploadForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  uploadErrEl.hidden = true;

  const title = document.getElementById("up-title").value.trim();
  const year = uploadYearSel.value;
  const semester = uploadSemSel.value;
  const subject = uploadSubjSel.value;

  if (!selectedFile) { showUploadError("Please select a PDF file."); return; }
  if (!title) { showUploadError("Document title is required."); return; }
  if (!year) { showUploadError("Academic year is required."); return; }
  if (!semester) { showUploadError("Semester is required."); return; }
  if (!subject) { showUploadError("Subject is required."); return; }

  const submitBtn = document.getElementById("btn-submit-upload");
  submitBtn.disabled = true;
  progressBar.hidden = false;
  progressFill.style.width = "0%";
  if (progressRole) progressRole.setAttribute("aria-valuenow", "0");

  try {
    const newDoc = await uploadDocument(
      selectedFile,
      {
        title, year, semester: Number(semester), subject,
        university: uploadUniSel.value, department: uploadDeptSel.value,
        chapterNames: document.getElementById("up-chapters").value.split(/\r?\n/).map((x) => x.trim()).filter(Boolean),
      },
      (pct) => {
        progressFill.style.width = pct + "%";
        if (progressRole) progressRole.setAttribute("aria-valuenow", String(pct));
      }
    );
    allDocs.unshift(newDoc);
    renderTable();
    updateStats();
    Modal.close("modal-upload");
    Toast.success(`"${title}" uploaded. Indexing in progress…`);
  } catch (err) {
    showUploadError(err.message);
  } finally {
    submitBtn.disabled = false;
  }
});

/* ════════════════════════════════════════
   EDIT MODAL
════════════════════════════════════════ */
const editYearSel = document.getElementById("edit-year");
const editSemSel = document.getElementById("edit-sem");
const editSubjSel = document.getElementById("edit-subject");

populateYearSelect(editYearSel, false);
linkYearSemester(editYearSel, editSemSel, false);
editSubjSel.innerHTML = "";
SUBJECTS.forEach((s) => { editSubjSel.appendChild(new Option(s, s)); });
const editUniSel = document.getElementById("edit-university");
const editDeptSel = document.getElementById("edit-department");
UNIVERSITIES.forEach((u) => editUniSel.appendChild(new Option(u, u)));
DEPARTMENTS.forEach((d) => editDeptSel.appendChild(new Option(d, d)));

let editingDocId = null;

function openEditModal(id) {
  const doc = allDocs.find((d) => d.id === id);
  if (!doc) return;
  editingDocId = id;
  document.getElementById("edit-title").value = doc.title;
  editYearSel.value = doc.year;
  populateSemesterSelect(editSemSel, doc.year, false);
  editSemSel.value = String(doc.semester);
  editSubjSel.value = doc.subject;
  editUniSel.value = doc.university || UNIVERSITIES[0];
  editDeptSel.value = doc.department || DEPARTMENTS[0];
  document.getElementById("edit-error").hidden = true;
  Modal.open("modal-edit");
}

document.getElementById("btn-cancel-edit").addEventListener("click", () => Modal.close("modal-edit"));
document.getElementById("btn-cancel-edit-footer").addEventListener("click", () => Modal.close("modal-edit"));

document.getElementById("edit-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const errEl = document.getElementById("edit-error");
  errEl.hidden = true;

  const title = document.getElementById("edit-title").value.trim();
  const year = editYearSel.value;
  const semester = editSemSel.value;
  const subject = editSubjSel.value;

  if (!title || !year || !semester || !subject) {
    errEl.hidden = false;
    errEl.querySelector(".alert__msg").textContent = "All fields are required.";
    return;
  }

  const btn = document.getElementById("btn-submit-edit");
  btn.disabled = true;
  try {
    const updated = await updateDocument(editingDocId, { title, year, semester: Number(semester), subject, university: editUniSel.value, department: editDeptSel.value });
    const idx = allDocs.findIndex((d) => d.id === editingDocId);
    if (idx > -1) allDocs[idx] = updated;
    renderTable(); updateStats();
    Modal.close("modal-edit");
    Toast.success("Document metadata updated.");
  } catch (err) {
    errEl.hidden = false;
    errEl.querySelector(".alert__msg").textContent = err.message;
  } finally {
    btn.disabled = false;
  }
});

/* ════════════════════════════════════════
   DELETE MODAL
════════════════════════════════════════ */
let deletingDocId = null;

function openDeleteModal(id) {
  const doc = allDocs.find((d) => d.id === id);
  if (!doc) return;
  deletingDocId = id;
  const nameEl = document.getElementById("delete-doc-name");
  if (nameEl) nameEl.textContent = doc.title;
  Modal.open("modal-delete");
}

document.getElementById("btn-cancel-delete").addEventListener("click", () => Modal.close("modal-delete"));
document.getElementById("btn-cancel-delete-footer").addEventListener("click", () => Modal.close("modal-delete"));

document.getElementById("btn-confirm-delete").addEventListener("click", async () => {
  const btn = document.getElementById("btn-confirm-delete");
  btn.disabled = true;
  try {
    await deleteDocument(deletingDocId);
    allDocs = allDocs.filter((d) => d.id !== deletingDocId);
    renderTable(); updateStats();
    Modal.close("modal-delete");
    Toast.success("Document deleted.");
  } catch (err) {
    // Keep the modal open so the user can retry or cancel.
    Toast.error("Delete failed: " + err.message);
    btn.disabled = false;
  }
});

/* ─── Initial load ─── */
loadDocs();