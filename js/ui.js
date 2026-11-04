/**
 * ui.js — Shared UI utilities: DOM helpers, toasts, modals, spinners, form helpers.
 */
import { CONFIG } from "./config.js";

/* ════════════════════════════════════════
   DOM UTILITIES
════════════════════════════════════════ */

/**
 * Escape a string so it is safe as TEXT CONTENT in the DOM.
 * Does NOT escape quotes — never use for attribute values.
 * For attribute values, use escapeAttr().
 * @param {*} str
 * @returns {string}
 */
export function escapeHTML(str) {
  const d = document.createElement("div");
  d.appendChild(document.createTextNode(String(str ?? "")));
  return d.innerHTML;
}

/**
 * Escape a string so it is safe inside a quoted HTML attribute.
 * Escapes & < > " ' — safe for attribute="value" contexts.
 * @param {*} str
 * @returns {string}
 */
export function escapeAttr(str) {
  return String(str ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

/**
 * Create a DOM element with optional attributes and text.
 * Boolean attributes: pass `true` to set, `false`/`null`/`undefined` to omit.
 */
export function el(tag, attrs = {}, text = "") {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "className") node.className = v;
    else if (k === "style") Object.assign(node.style, v);
    else if (v === true) node.setAttribute(k, "");
    else if (v === false || v == null) { /* omit */ }
    else node.setAttribute(k, v);
  }
  if (text !== "") node.textContent = text;
  return node;
}

/* ════════════════════════════════════════
   TOAST NOTIFICATIONS
════════════════════════════════════════ */

let _toastCtr = null;

function _getToastContainer() {
  if (!_toastCtr) {
    _toastCtr = document.createElement("div");
    _toastCtr.className = "toast-container";
    document.body.appendChild(_toastCtr);
  }
  return _toastCtr;
}

function _showToast(message, type) {
  const ctr = _getToastContainer();
  const toast = document.createElement("div");
  toast.className = `toast toast--${type}`;
  // Errors are assertive; everything else is polite.
  toast.setAttribute("role", type === "error" ? "alert" : "status");
  toast.setAttribute("aria-live", type === "error" ? "assertive" : "polite");

  const icons = { success: "✓", error: "✕", warning: "⚠", info: "ℹ" };

  const iconEl = el("span", { className: "toast__icon", "aria-hidden": "true" }, icons[type] ?? "ℹ");
  const msgEl = el("span", { className: "toast__msg" });
  msgEl.textContent = message;

  const closeBtn = el("button", { className: "toast__close", "aria-label": "Dismiss" }, "×");
  closeBtn.addEventListener("click", dismiss);

  toast.appendChild(iconEl);
  toast.appendChild(msgEl);
  toast.appendChild(closeBtn);
  ctr.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add("toast--in"));

  const timer = setTimeout(dismiss, 4500);

  function dismiss() {
    clearTimeout(timer);
    toast.classList.remove("toast--in");
    toast.classList.add("toast--out");
    toast.addEventListener("transitionend", () => toast.remove(), { once: true });
  }
  return dismiss;
}

export const Toast = {
  success(msg) { return _showToast(msg, "success"); },
  error(msg) { return _showToast(msg, "error"); },
  warning(msg) { return _showToast(msg, "warning"); },
  info(msg) { return _showToast(msg, "info"); },
};

/* ════════════════════════════════════════
   MODAL MANAGER
════════════════════════════════════════ */

const FOCUSABLE =
  'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), ' +
  'textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export const Modal = {
  _stack: [],

  open(id, onOpen) {
    const modal = document.getElementById(id);
    if (!modal) return;

    modal.removeAttribute("hidden");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("body--modal-open");
    this._stack.push(id);

    // Focus first focusable child
    const focusable = modal.querySelectorAll(FOCUSABLE);
    if (focusable.length) setTimeout(() => focusable[0].focus(), 50);

    // Remember what had focus before this modal opened
    modal._ragPrevFocus = document.activeElement;

    // ESC closes; Tab is trapped inside the dialog
    const onKey = (e) => {
      if (e.key === "Escape") { e.preventDefault(); this.close(id); return; }
      if (e.key !== "Tab") return;
      const f = modal.querySelectorAll(FOCUSABLE);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    modal._ragEscHandler = onKey;

    // Backdrop click — attach once per modal element
    if (!modal._ragBackdropHandler) {
      modal._ragBackdropHandler = (e) => { if (e.target === modal) this.close(id); };
      modal.addEventListener("click", modal._ragBackdropHandler);
    }

    if (onOpen) onOpen(modal);
  },

  close(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.setAttribute("hidden", "");
    modal.setAttribute("aria-hidden", "true");

    if (modal._ragEscHandler) {
      document.removeEventListener("keydown", modal._ragEscHandler);
      delete modal._ragEscHandler;
    }
    if (modal._ragBackdropHandler) {
      modal.removeEventListener("click", modal._ragBackdropHandler);
      delete modal._ragBackdropHandler;
    }

    this._stack = this._stack.filter((x) => x !== id);
    if (this._stack.length === 0) document.body.classList.remove("body--modal-open");

    // Restore focus to the element that opened the modal
    const prev = modal._ragPrevFocus;
    delete modal._ragPrevFocus;
    if (prev && typeof prev.focus === "function" && document.body.contains(prev)) {
      prev.focus();
    }
  },

  closeAll() { [...this._stack].forEach((id) => this.close(id)); },
};

/* ════════════════════════════════════════
   SPINNER / SKELETON
════════════════════════════════════════ */

export const Spinner = {
  show(containerId, label = "Loading…") {
    const c = document.getElementById(containerId);
    if (!c) return;
    c.innerHTML = `<div class="spinner" role="status" aria-label="${escapeAttr(label)}">
      <div class="spinner__ring"></div>
      <span class="spinner__label">${escapeHTML(label)}</span>
    </div>`;
  },
  hide(containerId) {
    const c = document.getElementById(containerId);
    if (c) { const s = c.querySelector(".spinner"); if (s) s.remove(); }
  },
};

export function renderSkeleton(container, rows = 3) {
  container.innerHTML = Array.from({ length: rows }, () =>
    `<div class="skeleton-card" aria-hidden="true">
      <div class="skeleton-line skel--title"></div>
      <div class="skeleton-line skel--body"></div>
      <div class="skeleton-line skel--body skel--short"></div>
    </div>`
  ).join("");
}

/* ════════════════════════════════════════
   YEAR / SEMESTER SELECTS
════════════════════════════════════════ */

export function populateYearSelect(sel, includeAll = true) {
  sel.innerHTML = "";
  if (includeAll) sel.appendChild(new Option("All Years", ""));
  for (const [code, label] of Object.entries(CONFIG.YEAR_LABELS)) {
    sel.appendChild(new Option(label, code));
  }
}

export function populateSemesterSelect(sel, year, includeAll = true) {
  sel.innerHTML = "";
  if (includeAll) sel.appendChild(new Option("All Semesters", ""));
  const semesters = CONFIG.YEAR_SEMESTER_MAP[year] ?? [];
  for (const s of semesters) sel.appendChild(new Option(`Semester ${s}`, String(s)));
}

export function linkYearSemester(yearSel, semSel, includeAll = true) {
  populateSemesterSelect(semSel, yearSel.value, includeAll);
  yearSel.addEventListener("change", () => {
    populateSemesterSelect(semSel, yearSel.value, includeAll);
    semSel.value = "";
  });
}

/* ════════════════════════════════════════
   FORMATTING HELPERS
════════════════════════════════════════ */

export function formatSize(mb) {
  if (mb == null || Number.isNaN(Number(mb))) return "—";
  if (mb < 1) return `${Math.round(mb * 1024)} KB`;
  return `${Number(mb).toFixed(1)} MB`;
}

export function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

/**
 * Highlight occurrences of search words inside a passage.
 * Escapes each raw slice individually so entities like &amp; cannot be
 * corrupted by a match landing inside the entity text.
 * Returns safe HTML string.
 */
export function highlightWords(text, words) {
  const raw = String(text ?? "");
  const list = (words || [])
    .filter((w) => w && w.length > 2)
    .sort((a, b) => b.length - a.length);
  if (!list.length) return escapeHTML(raw);

  const pattern = list
    .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");
  const re = new RegExp(`(${pattern})`, "gi");

  let out = "", last = 0, m;
  while ((m = re.exec(raw))) {
    if (m[0] === "") { re.lastIndex++; continue; }
    out += escapeHTML(raw.slice(last, m.index));
    out += `<mark class="highlight">${escapeHTML(m[0])}</mark>`;
    last = m.index + m[0].length;
  }
  out += escapeHTML(raw.slice(last));
  return out;
}

export function statusBadge(status) {
  const map = {
    Pending: "badge--warning",
    Processing: "badge--info",
    Indexed: "badge--success",
    Failed: "badge--danger",
  };
  const cls = map[status] ?? "badge--default";
  return `<span class="badge ${cls}">${escapeHTML(status)}</span>`;
}