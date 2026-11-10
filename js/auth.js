/**
 * auth.js — Session management, role guards, and logout helper.
 * Import this on every protected page.
 */
import { CONFIG } from "./config.js";

export const Auth = {
  /** Store token + user after successful login. */
  setSession(token, user) {
    sessionStorage.setItem(CONFIG.SESSION_KEYS.TOKEN, token);
    sessionStorage.setItem(CONFIG.SESSION_KEYS.USER, JSON.stringify(user));
  },

  /** Return the stored user object, or null. */
  getUser() {
    try {
      const raw = sessionStorage.getItem(CONFIG.SESSION_KEYS.USER);
      return raw ? JSON.parse(raw) : null;
    } catch (_) { return null; }
  },

  /** Return the stored auth token, or null. */
  getToken() {
    return sessionStorage.getItem(CONFIG.SESSION_KEYS.TOKEN);
  },

  /** Clear session data and redirect to login page. */
  logout() {
    sessionStorage.removeItem(CONFIG.SESSION_KEYS.TOKEN);
    sessionStorage.removeItem(CONFIG.SESSION_KEYS.USER);
    sessionStorage.removeItem(CONFIG.SESSION_KEYS.RECENT_SEARCHES);
    window.location.href = "index.html";
  },

  /**
   * Guard — requires any authenticated user.
   * Redirects to index.html if not logged in.
   * @returns {Object} the current user
   */
  requireLogin() {
    const user  = this.getUser();
    const token = this.getToken();
    if (!user || !token) { window.location.href = "index.html"; return null; }
    return user;
  },

  /**
   * Guard — requires admin role.
   * Redirects to index.html if not logged in, denied.html if wrong role.
   * @returns {Object} the current user
   */
  requireAdmin() {
    const user  = this.getUser();
    const token = this.getToken();
    if (!user || !token) { window.location.href = "index.html"; return null; }
    if (user.role !== "admin") { window.location.href = "denied.html"; return null; }
    return user;
  },

  /**
   * Bind the logout button found by ID.
   * @param {string} [id="btn-logout"]
   */
  bindLogout(id = "btn-logout") {
    const btn = document.getElementById(id);
    if (btn) btn.addEventListener("click", () => this.confirmLogout());
  },

  /** Ask for confirmation before signing out ("Are you sure?" with Yes / Cancel). */
  confirmLogout() {
    if (document.getElementById("modal-signout")) return;
    const prevFocus = document.activeElement;
    const modal = document.createElement("div");
    modal.id = "modal-signout";
    modal.className = "modal modal--sm";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "signout-title");
    modal.innerHTML = `
      <div class="modal__dialog">
        <div class="modal__header">
          <h2 class="modal__title" id="signout-title">Sign Out</h2>
          <button type="button" class="modal__close" id="so-x" aria-label="Close">&#215;</button>
        </div>
        <div class="modal__body">
          <p style="margin:0;font-size:0.95rem;">Are you sure you want to sign out?</p>
        </div>
        <div class="modal__footer">
          <button type="button" class="btn btn--secondary" id="so-cancel">Cancel</button>
          <button type="button" class="btn btn--primary" id="so-yes">Yes, Sign Out</button>
        </div>
      </div>`;
    document.body.appendChild(modal);
    document.body.classList.add("body--modal-open");
    const onKey = (e) => { if (e.key === "Escape") close(); };
    const close = () => {
      document.removeEventListener("keydown", onKey);
      modal.remove();
      document.body.classList.remove("body--modal-open");
      if (prevFocus && prevFocus.focus) prevFocus.focus();
    };
    document.addEventListener("keydown", onKey);
    modal.addEventListener("click", (e) => { if (e.target === modal) close(); });
    modal.querySelector("#so-x").addEventListener("click", close);
    modal.querySelector("#so-cancel").addEventListener("click", close);
    modal.querySelector("#so-yes").addEventListener("click", () => this.logout());
    modal.querySelector("#so-cancel").focus();
  },

  /**
   * Write the current user name into an element by ID.
   * @param {string} [id="user-name"]
   */
  renderUserName(id = "user-name") {
    const el = document.getElementById(id);
    if (el) el.textContent = this.getUser()?.name ?? "";
  },
};
