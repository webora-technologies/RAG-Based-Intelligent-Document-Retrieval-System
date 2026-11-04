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
    if (btn) btn.addEventListener("click", () => this.logout());
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
