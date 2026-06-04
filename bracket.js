/**
 * bracket.js
 * Renders the visual knockout bracket on bracket.html.
 * Shows all rounds from R32 → Final + Third Place.
 * TBD slots shown for not-yet-generated matches.
 */

import { getCurrentUser } from "./auth.js";
import { isAdmin } from "./auth.js";
import { onAllMatchesSnapshot, onPredictionsSnapshot } from "./db.js";
import {
  renderNav,
  requireAuth,
  setLoading,
  formatTime,
  isLocked,
} from "./ui.js";

const KNOCKOUT_STAGES = ["r32", "r16", "qf", "sf", "final", "third_place"];
const STAGE_LABELS = {
  r32: "Round of 32",
  r16: "Round of 16",
  qf: "Quarter-finals",
  sf: "Semi-finals",
  final: "Final",
  third_place: "Third Place",
};

let allMatches = {};
let predictions = {};
let collapsedStages = new Set();

export async function initBracket() {
  setLoading(true);
  const user = await getCurrentUser();
  if (!requireAuth(user)) return;

  renderNav(user, isAdmin(user.uid));

  // Subscribe to all matches — re-render bracket on any change
  const unsub1 = onAllMatchesSnapshot((matches) => {
    // Bucket by stage
    allMatches = {};
    matches.forEach((m) => {
      if (!allMatches[m.stage]) allMatches[m.stage] = [];
      allMatches[m.stage].push(m);
    });
    renderBracket();
  });

  // Subscribe to user's predictions
  const unsub2 = onPredictionsSnapshot(user.uid, (preds) => {
    predictions = preds;
    renderBracket();
  });

  setLoading(false);

  // Clean up listeners on page hide
  window.addEventListener("pagehide", () => {
    unsub1();
    unsub2();
  });
}

/**
 * Main bracket render function.
 * Builds columns for each round side-by-side.
 */
function renderBracket() {
  const container = document.getElementById("bracket-container");
  if (!container) return;

  const mainStages = ["r32", "r16", "qf", "sf", "third_place", "final"];

  let html = `<div class="bracket-scroll"><div class="bracket-columns">`;

  for (const stage of mainStages) {
    const matches = allMatches[stage] || [];
    const expanded = !collapsedStages.has(stage);
    html += `
      <div class="bracket-column">
        <button class="bracket-col-title" aria-expanded="${expanded}" data-stage="${stage}">
          ${STAGE_LABELS[stage]}
          <svg class="matchday-arrow" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="5 8 10 13 15 8"/></svg>
        </button>
        <div class="bracket-slots-wrap">
          <div class="bracket-slots">
            ${
              matches.length
                ? matches.map((m) => buildBracketSlot(m)).join("")
                : buildTBDSlot(stageMatchCount(stage))
            }
          </div>
        </div>
      </div>`;
  }

  html += `</div></div>`; // bracket-columns, bracket-scroll
  container.innerHTML = html;

  // Attach collapse toggle handlers
  container.querySelectorAll(".bracket-col-title").forEach((btn) => {
    btn.addEventListener("click", () => {
      const isExpanded = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!isExpanded));
      const stage = btn.dataset.stage;
      if (isExpanded) collapsedStages.add(stage);
      else collapsedStages.delete(stage);
    });
  });
}

/**
 * Build a bracket slot card for a real match.
 */
function buildBracketSlot(match) {
  const pred = predictions[match.matchId];
  const locked = isLocked(match.scheduledTime) || match.result !== null;
  const winnerTeam = match.result
    ? match.result === "team1"
      ? match.team1
      : match.team2
    : null;

  const team1Class =
    match.result === "team1" ? "winner" : match.result ? "loser" : "";
  const team2Class =
    match.result === "team2" ? "winner" : match.result ? "loser" : "";

  const userPick = pred?.prediction;
  const pickLabel = userPick
    ? userPick === "team1"
      ? match.team1
      : match.team2
    : null;

  const ptsHtml =
    typeof pred?.pointsEarned === "number"
      ? `<span class="bracket-pts ${pred.pointsEarned > 0 ? "pts-win" : "pts-zero"}">+${pred.pointsEarned}pts</span>`
      : "";

  return `
    <div class="bracket-slot ${locked ? "slot-locked" : ""}">
      <div class="slot-header">
        <span class="slot-time">${formatTime(match.scheduledTime)}</span>
        ${locked ? '<span class="slot-lock">🔒</span>' : ""}
      </div>
      <div class="slot-body">
        <div class="slot-team ${team1Class}">${match.team1}</div>
        <div class="slot-vs">VS</div>
        <div class="slot-team ${team2Class}">${match.team2}</div>
      </div>
      ${pickLabel ? `<div class="slot-pick"><span>Your pick: <strong>${pickLabel}</strong></span>${ptsHtml}</div>` : ""}
    </div>`;
}

/**
 * Build placeholder TBD slots for rounds not yet generated.
 */
function buildTBDSlot(count) {
  return Array.from({ length: count })
    .map(
      () => `
      <div class="bracket-slot slot-tbd">
        <div class="slot-header"><span class="slot-time">TBD</span></div>
        <div class="slot-body">
          <div class="slot-team">TBD</div>
          <div class="slot-vs">VS</div>
          <div class="slot-team">TBD</div>
        </div>
      </div>`,
    )
    .join("");
}

/**
 * Expected match counts per stage for TBD placeholder generation.
 */
function stageMatchCount(stage) {
  const counts = { r32: 16, r16: 8, qf: 4, sf: 2, final: 1 };
  return counts[stage] || 1;
}
