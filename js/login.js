/**
 * login.js — Handles the login page (index.html).
 */
import { login }      from "./api.js";
import { Auth }       from "./auth.js";
import { Toast, escapeHTML } from "./ui.js";

(function init() {
  /* If already logged in, redirect away */
  const user = Auth.getUser();
  if (user) {
    window.location.href = user.role === "admin" ? "admin.html" : "search.html";
    return;
  }

  const form     = document.getElementById("login-form");
  const emailIn  = document.getElementById("login-email");
  const passIn   = document.getElementById("login-password");
  const toggleBtn= document.getElementById("btn-toggle-password");
  const submitBtn= document.getElementById("btn-login");
  const errBox   = document.getElementById("login-error");

  /* ── Password show/hide ── */
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      const showing = passIn.type === "text";
      passIn.type   = showing ? "password" : "text";
      toggleBtn.setAttribute("aria-label", showing ? "Show password" : "Hide password");
      toggleBtn.querySelector(".eye-icon").textContent = showing ? "👁" : "🙈";
    });
  }

  /* ── Inline validation helpers ── */
  function showFieldError(inputEl, msg) {
    let errEl = document.getElementById(inputEl.id + "-err");
    if (!errEl) return;
    errEl.textContent = msg;
    inputEl.setAttribute("aria-invalid", "true");
    inputEl.classList.add("input--error");
  }
  function clearFieldError(inputEl) {
    let errEl = document.getElementById(inputEl.id + "-err");
    if (errEl) errEl.textContent = "";
    inputEl.removeAttribute("aria-invalid");
    inputEl.classList.remove("input--error");
  }

  emailIn.addEventListener("input", () => clearFieldError(emailIn));
  passIn.addEventListener("input",  () => clearFieldError(passIn));

  /* ── Form submit ── */
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errBox.hidden = true;

    const email    = emailIn.value.trim();
    const password = passIn.value;
    let valid = true;

    if (!email) {
      showFieldError(emailIn, "Email address is required.");
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showFieldError(emailIn, "Enter a valid email address.");
      valid = false;
    }
    if (!password) {
      showFieldError(passIn, "Password is required.");
      valid = false;
    }
    if (!valid) return;

    submitBtn.disabled = true;
    submitBtn.textContent = "Signing in…";

    try {
      const { token, user } = await login(email, password);
      Auth.setSession(token, user);
      window.location.href = user.role === "admin" ? "admin.html" : "search.html";
    } catch (err) {
      errBox.hidden = false;
      errBox.querySelector(".alert__msg").textContent = err.message;
      submitBtn.disabled = false;
      submitBtn.textContent = "Sign In";
      emailIn.focus();
    }
  });
})();
