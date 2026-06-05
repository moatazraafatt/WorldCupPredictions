/**
 * predictions.js
 * Logic for rendering prediction buttons on fixtures page.
 * Handles lock state, inline prediction saving, and result display.
 */

import { savePrediction } from "./db.js";
import {
  isLocked,
  showToast,
  formatTime,
  resultBadge,
  predictionBadge,
  pointsBadge,
} from "./ui.js";

// ─── Country flag images (ISO 3166-1 alpha-2 codes → flagcdn.com) ────────────
// flagcdn.com provides free flag PNGs: https://flagcdn.com/20x15/{code}.png
// Scotland and England use subdivision codes: gb-sct / gb-eng
const FLAG_MAP = {
  // Group A
  Mexico: "mx",
  "South Africa": "za",
  "South Korea": "kr",
  Czechia: "cz",
  // Group B
  Canada: "ca",
  "Bosnia": "ba",
  Qatar: "qa",
  Switzerland: "ch",
  // Group C
  Brazil: "br",
  Morocco: "ma",
  Haiti: "ht",
  Scotland: "gb-sct",
  // Group D
  "United States": "us",
  Paraguay: "py",
  Australia: "au",
  Türkiye: "tr",
  // Group E
  Germany: "de",
  Curaçao: "cw",
  "Côte d'Ivoire": "ci",
  Ecuador: "ec",
  // Group F
  Netherlands: "nl",
  Japan: "jp",
  Sweden: "se",
  Tunisia: "tn",
  // Group G
  Belgium: "be",
  Egypt: "eg",
  Iran: "ir",
  "New Zealand": "nz",
  // Group H
  Spain: "es",
  "Cape Verde": "cv",
  "Saudi Arabia": "sa",
  Uruguay: "uy",
  // Group I
  France: "fr",
  Senegal: "sn",
  Iraq: "iq",
  Norway: "no",
  // Group J
  Argentina: "ar",
  Algeria: "dz",
  Austria: "at",
  Jordan: "jo",
  // Group K
  Portugal: "pt",
  "DR Congo": "cd",
  Uzbekistan: "uz",
  Colombia: "co",
  // Group L
  England: "gb-eng",
  Croatia: "hr",
  Ghana: "gh",
  Panama: "pa",
};

function flag(team) {
  const code = FLAG_MAP[team];
  if (!code) return "";
  return `<img class="team-flag" src="https://flagcdn.com/20x15/${code}.png" alt="${team} flag" width="20" height="15"> `;
}

/**
 * Build a match card HTML string for the fixtures page.
 *
 * @param {Object} match - match document from Firestore
 * @param {Object|null} pred - user's prediction document (or null)
 * @param {string} stage - match stage (affects draw option visibility)
 * @returns {string} HTML string
 */
export function buildMatchCard(match, pred, stage) {
  const locked = isLocked(match.scheduledTime) || match.result !== null;
  const lockIcon = locked
    ? '<span class="lock-icon" title="Locked">🔒</span>'
    : "";
  const timeStr = formatTime(match.scheduledTime);

  const isGroupStage = stage === "group";
  const drawAllowed = isGroupStage;

  // Build prediction buttons
  let buttons = "";
  if (!locked) {
    const picks = ["team1", ...(drawAllowed ? ["draw"] : []), "team2"];
    buttons = `<div class="pred-buttons">
      ${picks
        .map((p) => {
          const teamName =
            p === "team1" ? match.team1 : p === "team2" ? match.team2 : null;
          const label = teamName
            ? `${flag(teamName)}<span class="btn-team-name">${teamName}</span>`
            : "Draw";
          const active = pred?.prediction === p ? "active" : "";
          return `<button type="button" class="btn btn-pred ${active}" data-match="${match.matchId}" data-pick="${p}">${label}</button>`;
        })
        .join("")}
    </div>`;
  }

  const resultHtml = resultBadge(match.result, match.team1, match.team2);
  const predHtml = predictionBadge(
    pred?.prediction ?? null,
    match.team1,
    match.team2,
    match.result ?? null,
  );
  const ptsHtml = pointsBadge(pred?.pointsEarned);

  return `
    <div class="match-card ${locked ? "locked" : ""}" id="card-${match.matchId}">
      <div class="match-header">
        ${isGroupStage ? `<span class="group-badge">Group ${match.group}</span>` : ""}
        <span class="match-time">${timeStr}</span>
        ${lockIcon}
        ${resultHtml}
      </div>
      <div class="match-teams">
        <span class="team team1">${flag(match.team1)}${match.team1}</span>
        <span class="vs">vs</span>
        <span class="team team2">${flag(match.team2)}${match.team2}</span>
      </div>
      <div class="match-footer">
        ${predHtml}
        ${ptsHtml}
        ${buttons}
      </div>
    </div>
  `;
}

/**
 * Attach click handlers for all prediction buttons in a container.
 * Delegates to a single listener on the container element.
 *
 * @param {HTMLElement} container - The DOM node containing match cards
 * @param {string} uid - Current user's UID
 */
export function attachPredictionHandlers(container, uid) {
  container.addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-pick]");
    if (!btn) return;

    const matchId = btn.dataset.match;
    const pick = btn.dataset.pick;

    // Disable all buttons in this card immediately (optimistic UI)
    const card = document.getElementById(`card-${matchId}`);
    card?.querySelectorAll(".btn-pred").forEach((b) => (b.disabled = true));

    try {
      // Write prediction to /users/{uid}/predictions/{matchId}
      await savePrediction(uid, matchId, pick);
      showToast("Prediction saved!", "success");

      // Highlight active button
      card?.querySelectorAll(".btn-pred").forEach((b) => {
        b.classList.toggle("active", b.dataset.pick === pick);
        b.disabled = false;
      });
    } catch (err) {
      showToast("Error saving prediction: " + err.message, "error");
      card?.querySelectorAll(".btn-pred").forEach((b) => (b.disabled = false));
    }
  });
}
