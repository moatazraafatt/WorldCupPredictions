/**
 * ui.js
 * Shared UI helpers: nav rendering, toast notifications, modal, spinners,
 * time formatting, lock detection. Imported by every page module.
 */

import { LOCK_BEFORE_MS } from "./firebase-config.js";

// ─── Navigation ──────────────────────────────────────────────────────────────

/**
 * Inject the shared navigation bar into #nav-container.
 * Highlights the active page link.
 */
export function renderNav(user, isAdminUser = false) {
  const container = document.getElementById("nav-container");
  if (!container) return;

  const currentPage = location.pathname.split("/").pop() || "index.html";

  // Inline SVG icon helper
  const icon = (d) =>
    `<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`;

  const links = [
    {
      href: "fixtures.html",
      label: "Fixtures",
      svg: icon(
        "M8 2v3M16 2v3M3 7h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z",
      ),
    },
    {
      href: "bracket.html",
      label: "Bracket",
      svg: icon(
        "M6 9H4.5a2.5 2.5 0 0 0 0 5H6m12-5h1.5a2.5 2.5 0 0 0 0 5H18M6 2v9a6 6 0 0 0 12 0V2M4 22h16M10 22v-3h4v3",
      ),
    },
    {
      href: "leagues.html",
      label: "Leagues",
      svg: icon(
        "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
      ),
    },
    {
      href: "history.html",
      label: "History",
      svg: icon("M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2"),
    },
  ];

  if (isAdminUser)
    links.push({
      href: "admin.html",
      label: "Admin",
      svg: icon(
        "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z",
      ),
    });

  const navLinks = links
    .map(
      (l) =>
        `<a href="${l.href}" class="nav-link ${currentPage === l.href ? "active" : ""}">${l.svg}<span class="nav-label">${l.label}</span></a>`,
    )
    .join("");

  // Trophy brand icon
  const brandSvg = `<svg class="brand-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9H4.5a2.5 2.5 0 0 0 0 5H6m12-5h1.5a2.5 2.5 0 0 0 0 5H18M6 2v9a6 6 0 0 0 12 0V2M4 22h16M10 22v-3h4v3"/></svg>`;

  // Theme defaults to light unless user explicitly selected and saved one
  const currentTheme = document.documentElement.dataset.theme || "light";
  const sunSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18" aria-hidden="true"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
  const moonSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
  const themeIcon = currentTheme === "dark" ? sunSvg : moonSvg;
  const themeTitle =
    currentTheme === "dark" ? "Switch to light mode" : "Switch to dark mode";

  container.innerHTML = `
    <nav class="navbar">
      <a href="index.html" class="nav-brand">
        ${brandSvg}<span class="brand-wc">WC</span><span class="brand-year">2026</span>
      </a>
      <div class="nav-links" id="nav-links">
        ${navLinks}
        <div class="nav-user">
          <span class="nav-username">${user?.displayName ?? "Guest"}</span>
          <button class="btn btn-sm btn-outline" id="logout-btn">Sign out</button>
        </div>
      </div>
      <button class="theme-toggle" id="theme-toggle-btn" title="${themeTitle}" aria-label="${themeTitle}">${themeIcon}</button>
      <button class="nav-toggle" aria-label="Toggle menu" id="nav-toggle">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
      </button>
    </nav>
  `;

  // Mobile menu toggle
  document.getElementById("nav-toggle")?.addEventListener("click", () => {
    document.getElementById("nav-links")?.classList.toggle("open");
  });

  // Theme toggle
  document.getElementById("theme-toggle-btn")?.addEventListener("click", () => {
    const html = document.documentElement;
    const isDark = html.dataset.theme === "dark";
    const next = isDark ? "light" : "dark";
    html.dataset.theme = next;
    localStorage.setItem("theme", next);
    const btn = document.getElementById("theme-toggle-btn");
    if (btn) {
      const sunSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18" aria-hidden="true"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
      const moonSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
      btn.innerHTML = next === "dark" ? sunSvg : moonSvg;
      const label =
        next === "dark" ? "Switch to light mode" : "Switch to dark mode";
      btn.title = label;
      btn.setAttribute("aria-label", label);
    }
  });
}

// ─── Toast Notifications ─────────────────────────────────────────────────────

let toastTimeout;

/**
 * Show a toast message at the bottom of the screen.
 * type: "success" | "error" | "info"
 */
export function showToast(message, type = "info") {
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.className = `toast toast-${type} show`;
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove("show"), 3500);
}

// ─── Spinner ─────────────────────────────────────────────────────────────────

/**
 * Show or hide a full-page loading spinner.
 */
export function setLoading(visible) {
  let spinner = document.getElementById("global-spinner");
  if (!spinner) {
    spinner = document.createElement("div");
    spinner.id = "global-spinner";
    spinner.innerHTML = `<div class="spinner"></div>`;
    document.body.appendChild(spinner);
  }
  spinner.style.display = visible ? "flex" : "none";
}

// ─── Modal ───────────────────────────────────────────────────────────────────

/**
 * Show a simple confirm modal. Returns a Promise<boolean>.
 */
export function showConfirm(message) {
  return new Promise((resolve) => {
    let modal = document.getElementById("confirm-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "confirm-modal";
      modal.className = "modal-overlay";
      modal.innerHTML = `
        <div class="modal-box">
          <p id="confirm-msg"></p>
          <div class="modal-actions">
            <button class="btn btn-danger" id="confirm-yes">Yes</button>
            <button class="btn btn-outline" id="confirm-no">Cancel</button>
          </div>
        </div>`;
      document.body.appendChild(modal);
    }
    document.getElementById("confirm-msg").textContent = message;
    modal.style.display = "flex";

    const cleanup = (result) => {
      modal.style.display = "none";
      resolve(result);
    };

    document.getElementById("confirm-yes").onclick = () => cleanup(true);
    document.getElementById("confirm-no").onclick = () => cleanup(false);
  });
}

// ─── Time Formatting ─────────────────────────────────────────────────────────

/**
 * Format a Firestore Timestamp (or Date) to user's local time string.
 */
export function formatTime(tsOrDate) {
  let date;
  if (tsOrDate?.toDate) {
    // Firestore Timestamp object
    date = tsOrDate.toDate();
  } else if (tsOrDate instanceof Date) {
    date = tsOrDate;
  } else {
    // ISO string or timestamp number
    date = new Date(tsOrDate);
  }

  // Always display in Cairo time regardless of user's local timezone
  return new Intl.DateTimeFormat("en-EG", {
    timeZone: "Africa/Cairo",
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

/**
 * Returns true if the match is locked (within 15 minutes of kick-off or already started).
 */
export function isLocked(scheduledTime) {
  const matchDate = scheduledTime?.toDate
    ? scheduledTime.toDate()
    : new Date(scheduledTime);
  return Date.now() >= matchDate.getTime() - LOCK_BEFORE_MS;
}

// ─── Result Badge ─────────────────────────────────────────────────────────────

/**
 * Build a result badge string showing the outcome.
 */
export function resultBadge(result, team1, team2) {
  if (!result) return "";
  const label =
    result === "team1" ? team1 : result === "team2" ? team2 : "Draw";
  return `<span class="badge badge-result">${label}</span>`;
}

/**
 * Build a prediction badge showing user's pick.
 */
export function predictionBadge(prediction, team1, team2, result) {
  if (!prediction) return `<span class="badge badge-none">No pick</span>`;
  const label =
    prediction === "team1" ? team1 : prediction === "team2" ? team2 : "Draw";
  const isWrong = result && prediction !== result;
  const cls = isWrong ? "badge-pick-wrong" : "badge-pick";
  return `<span class="badge ${cls}">${label}</span>`;
}

// ─── Points badge ─────────────────────────────────────────────────────────────

export function pointsBadge(pointsEarned) {
  if (pointsEarned === null || pointsEarned === undefined) return "";
  const cls = pointsEarned > 0 ? "badge-pts-win" : "badge-pts-zero";
  return `<span class="badge ${cls}">+${pointsEarned} pts</span>`;
}

// ─── Auth guard ───────────────────────────────────────────────────────────────

/**
 * Redirect to login if user is not authenticated.
 * Call at top of every protected page.
 */
export function requireAuth(user) {
  if (!user) {
    location.href = "login.html";
    return false;
  }
  return true;
}
