/**
 * fixtures.js
 * Drives fixtures.html: renders all matches grouped by stage/group,
 * handles tab switching, live prediction updates via onSnapshot.
 */

import { getCurrentUser } from "./auth.js";
import { isAdmin } from "./auth.js";
import { onMatchesSnapshot, onPredictionsSnapshot } from "./db.js";
import { buildMatchCard, attachPredictionHandlers } from "./predictions.js";
import { renderNav, requireAuth, setLoading, showToast } from "./ui.js";

const STAGES = [
  { id: "group", label: "Group Stage" },
  { id: "r32", label: "Round of 32" },
  { id: "r16", label: "Round of 16" },
  { id: "qf", label: "Quarter-finals" },
  { id: "sf", label: "Semi-finals" },
  { id: "third_place", label: "Third Place" },
  { id: "final", label: "Final" },
];

let currentStage = "group";
let allMatches = {}; // stage → array of match docs
let allPredictions = {}; // matchId → prediction doc
let matchUnsubs = {}; // stage → unsubscribe function
let predUnsub = null;
let currentUser = null;

/**
 * Entry point — called on DOMContentLoaded in fixtures.html
 */
export async function initFixtures() {
  setLoading(true);
  currentUser = await getCurrentUser();
  if (!requireAuth(currentUser)) return;

  renderNav(currentUser, isAdmin(currentUser.uid));
  buildTabs();
  attachPredictionHandlers(
    document.getElementById("matches-container"),
    currentUser.uid,
  );

  // Subscribe to user's predictions in real time
  // This keeps prediction buttons in sync without full re-renders
  predUnsub = onPredictionsSnapshot(currentUser.uid, (predsMap) => {
    allPredictions = predsMap;
    renderCurrentStage();
  });

  await switchStage("group");
  setLoading(false);
}

/**
 * Build stage tab buttons.
 */
function buildTabs() {
  const tabBar = document.getElementById("stage-tabs");
  tabBar.innerHTML = STAGES.map(
    (s) =>
      `<button class="tab-btn ${s.id === currentStage ? "active" : ""}" data-stage="${s.id}">${s.label}</button>`,
  ).join("");

  tabBar.addEventListener("click", (e) => {
    const btn = e.target.closest(".tab-btn");
    if (!btn) return;
    switchStage(btn.dataset.stage);
  });
}

/**
 * Switch to a different stage tab — subscribe to that stage's matches.
 */
async function switchStage(stage) {
  currentStage = stage;

  // Update active tab
  document.querySelectorAll(".tab-btn").forEach((b) => {
    b.classList.toggle("active", b.dataset.stage === stage);
  });

  setLoading(true);

  // Unsubscribe from previous stage listener if different
  if (matchUnsubs[stage]) {
    // already subscribed — just re-render
    renderCurrentStage();
    setLoading(false);
    return;
  }

  // Subscribe to this stage's matches in Firestore
  matchUnsubs[stage] = onMatchesSnapshot(stage, (matches) => {
    allMatches[stage] = matches;
    if (currentStage === stage) renderCurrentStage();
  });

  setLoading(false);
}

/**
 * Render the matches for the currently selected stage.
 */
function renderCurrentStage() {
  const container = document.getElementById("matches-container");
  const matches = allMatches[currentStage] || [];

  if (matches.length === 0) {
    container.innerHTML = `<p class="empty-state">No matches available for this stage yet.</p>`;
    return;
  }

  if (currentStage === "group") {
    renderGroupStage(container, matches);
  } else {
    renderKnockoutStage(container, matches);
  }
}

/**
 * Render group stage matches sorted by scheduled time (ascending),
 * with a "Matchday N" heading before each round of matches.
 *
 * Matchday boundaries (UTC):
 *   MD1: before Jun 18 00:00 UTC
 *   MD2: Jun 18 00:00 UTC – Jun 24 12:00 UTC
 *   MD3: Jun 24 12:00 UTC onwards
 */
function renderGroupStage(container, matches) {
  const MD2_START = Date.UTC(2026, 5, 18, 6, 0, 0); // Jun 18 06:00 UTC
  const MD3_START = Date.UTC(2026, 5, 24, 12, 0, 0); // Jun 24 12:00 UTC

  function getMs(m) {
    return m.scheduledTime?.toMillis?.() ?? new Date(m.scheduledTime).getTime();
  }

  function getMatchday(m) {
    const t = getMs(m);
    if (t < MD2_START) return 1;
    if (t < MD3_START) return 2;
    return 3;
  }

  const sorted = [...matches].sort((a, b) => getMs(a) - getMs(b));

  // Group into matchdays while preserving chronological order
  const byMd = { 1: [], 2: [], 3: [] };
  sorted.forEach((m) => byMd[getMatchday(m)].push(m));

  // Save current expanded states before re-render
  const prevExpanded = {};
  container.querySelectorAll(".matchday-heading").forEach((btn, i) => {
    prevExpanded[i] = btn.getAttribute("aria-expanded") !== "false";
  });

  // Save scroll position
  const scrollY = window.scrollY;

  const html = [1, 2, 3]
    .filter((md) => byMd[md].length > 0)
    .map((md) => {
      const cards = byMd[md]
        .map((m) =>
          buildMatchCard(m, allPredictions[m.matchId] ?? null, "group"),
        )
        .join("");
      return `
        <div class="matchday-section">
          <button class="matchday-heading" aria-expanded="true">
            Round ${md}
            <svg class="matchday-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          <div class="matchday-body"><div class="match-grid">${cards}</div></div>
        </div>`;
    })
    .join("");

  container.innerHTML = html;

  // Restore previously saved expanded state (or default to open)
  container.querySelectorAll(".matchday-heading").forEach((btn, i) => {
    const wasExpanded = prevExpanded[i];
    btn.setAttribute(
      "aria-expanded",
      wasExpanded === undefined ? "true" : String(wasExpanded),
    );
  });

  // Restore scroll position
  window.scrollTo({ top: scrollY, behavior: "instant" });

  // Attach toggle listeners
  container.querySelectorAll(".matchday-heading").forEach((btn) => {
    btn.addEventListener("click", () => {
      const expanded = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!expanded));
    });
  });
}

/**
 * Render knockout stage matches in a simple list.
 */
function renderKnockoutStage(container, matches) {
  const cards = matches
    .map((m) =>
      buildMatchCard(m, allPredictions[m.matchId] ?? null, currentStage),
    )
    .join("");
  container.innerHTML = `<div class="match-grid">${cards}</div>`;
}
