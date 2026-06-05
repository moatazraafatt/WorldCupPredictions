/**
 * league-predictions.js
 * Drives league-predictions.html: shows match cards with voter columns
 * for every locked match within the 24-hour visibility window.
 */

import { getCurrentUser } from "./auth.js";
import { isAdmin } from "./auth.js";
import {
  getLeague,
  getMatches,
  getUserData,
  getLeagueMemberPredictions,
} from "./db.js";
import {
  renderNav,
  requireAuth,
  setLoading,
  isLocked,
  formatTime,
  resultBadge,
} from "./ui.js";

const STAGES = ["group", "r32", "r16", "qf", "sf", "third_place", "final"];
const WINDOW_MS = 23 * 60 * 60 * 1000; // visible until scheduledTime + 23h

// ─── Country flags (ISO 3166-1 alpha-2 → flagcdn.com) ────────────────────────
const FLAG_MAP = {
  Mexico: "mx",
  "South Africa": "za",
  "South Korea": "kr",
  Czechia: "cz",
  Canada: "ca",
  "Bosnia and Herzegovina": "ba",
  Qatar: "qa",
  Switzerland: "ch",
  Brazil: "br",
  Morocco: "ma",
  Haiti: "ht",
  Scotland: "gb-sct",
  "United States": "us",
  Paraguay: "py",
  Australia: "au",
  "Türkiye": "tr",
  Germany: "de",
  "Curaçao": "cw",
  "Côte d'Ivoire": "ci",
  Ecuador: "ec",
  Netherlands: "nl",
  Japan: "jp",
  Sweden: "se",
  Tunisia: "tn",
  Belgium: "be",
  Egypt: "eg",
  Iran: "ir",
  "New Zealand": "nz",
  Spain: "es",
  "Cape Verde": "cv",
  "Saudi Arabia": "sa",
  Uruguay: "uy",
  France: "fr",
  Senegal: "sn",
  Iraq: "iq",
  Norway: "no",
  Argentina: "ar",
  Algeria: "dz",
  Austria: "at",
  Jordan: "jo",
  Portugal: "pt",
  "DR Congo": "cd",
  Uzbekistan: "uz",
  Colombia: "co",
  England: "gb-eng",
  Croatia: "hr",
  Ghana: "gh",
  Panama: "pa",
};

function flag(team) {
  const code = FLAG_MAP[team];
  if (!code) return "";
  return `<img class="team-flag" src="https://flagcdn.com/20x15/${code}.png" alt="${team} flag" width="20" height="15">`;
}

function escHtml(s) {
  return String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  );
}

// ─── Entry point ─────────────────────────────────────────────────────────────

export async function initLeaguePredictions() {
  setLoading(true);

  const currentUser = await getCurrentUser();
  if (!requireAuth(currentUser)) return;

  // Read leagueId from URL
  const params = new URLSearchParams(location.search);
  const leagueId = params.get("leagueId");
  if (!leagueId) {
    location.href = "leagues.html";
    return;
  }

  // Load league doc and verify membership
  const league = await getLeague(leagueId);
  if (!league || !league.members?.includes(currentUser.uid)) {
    location.href = "leagues.html";
    return;
  }

  renderNav(currentUser, isAdmin(currentUser.uid));
  document.getElementById("league-title").textContent = league.name;

  // Fetch member display names
  const memberDocs = await Promise.all(
    league.members.map((uid) => getUserData(uid)),
  );
  const memberMap = {}; // uid → displayName
  memberDocs.forEach((u) => {
    if (u) memberMap[u.uid] = u.displayName || "Anonymous";
  });

  // Fetch all matches, filter to visibility window
  const allStages = await Promise.all(STAGES.map((s) => getMatches(s)));
  const now = Date.now();
  const recentMatches = allStages
    .flat()
    .filter((m) => {
      if (m.team1 === "TBD" || m.team2 === "TBD") return false;
      const ms = m.scheduledTime?.toDate
        ? m.scheduledTime.toDate().getTime()
        : new Date(m.scheduledTime).getTime();
      return isLocked(m.scheduledTime) && now < ms + WINDOW_MS;
    })
    .sort((a, b) => {
      const ta = a.scheduledTime?.toDate
        ? a.scheduledTime.toDate().getTime()
        : new Date(a.scheduledTime).getTime();
      const tb = b.scheduledTime?.toDate
        ? b.scheduledTime.toDate().getTime()
        : new Date(b.scheduledTime).getTime();
      return ta - tb;
    });

  const container = document.getElementById("matches-container");

  if (recentMatches.length === 0) {
    container.innerHTML = `<p class="empty-state">Predictions from all members become visible after a match deadline passes and remain visible for 24 hours.</p>`;
    setLoading(false);
    return;
  }

  // Fetch predictions for all matches in parallel
  const predMaps = await Promise.all(
    recentMatches.map((m) =>
      getLeagueMemberPredictions(league.members, m.matchId),
    ),
  );

  const cards = recentMatches
    .map((m, i) =>
      buildVoterCard(m, predMaps[i], memberMap, league.members, currentUser.uid),
    )
    .join("");
  container.innerHTML = `<div class="match-grid">${cards}</div>`;

  setLoading(false);
}

// ─── Voter card builder ───────────────────────────────────────────────────────

function buildVoterCard(match, predMap, memberMap, memberUids, currentUid) {
  const isGroupStage = match.stage === "group";
  const timeStr = formatTime(match.scheduledTime);
  const resultHtml = resultBadge(match.result, match.team1, match.team2);

  // Bucket uids by pick
  const buckets = { team1: [], draw: [], team2: [] };
  memberUids.forEach((uid) => {
    const pred = predMap[uid];
    if (pred?.prediction && buckets[pred.prediction]) {
      buckets[pred.prediction].push({ uid, pred });
    }
  });

  // Render a list of voter names under a pick column
  function voterList(picks) {
    if (picks.length === 0) return `<div class="voter-list"></div>`;
    const items = picks
      .map(({ uid, pred }) => {
        const name = escHtml(memberMap[uid] || "Anonymous");
        const isMe = uid === currentUid;
        const pts =
          pred.pointsEarned !== null && pred.pointsEarned !== undefined
            ? `<span class="voter-pts"> +${pred.pointsEarned}</span>`
            : "";
        return `<span class="voter-name${isMe ? " voter-me" : ""}">${name}${pts}</span>`;
      })
      .join("");
    return `<div class="voter-list">${items}</div>`;
  }

  const groupBadge = isGroupStage
    ? `<span class="group-badge">Group ${match.group}</span>`
    : "";

  // Flat grid layout: all three boxes are direct grid children in row 1,
  // all three voter lists are direct grid children in row 2.
  // This lets CSS grid share the height of the tallest box across all columns.
  const layoutClass = isGroupStage ? "voter-layout-group" : "voter-layout-ko";

  // Middle column: Draw box (group) or vs label (knockout)
  const middleBox = isGroupStage
    ? `<div class="voter-pick-box">Draw</div>`
    : `<span class="vs">vs</span>`;

  // Middle voter list: draw voters (group) or empty spacer (knockout)
  const middleVoters = isGroupStage
    ? voterList(buckets.draw)
    : `<div class="voter-list"></div>`;

  return `
    <div class="match-card locked">
      <div class="match-header">
        ${groupBadge}
        <span class="match-time">${timeStr}</span>
        <span class="lock-icon" title="Locked">🔒</span>
        ${resultHtml}
      </div>
      <div class="match-teams ${layoutClass}">
        <div class="voter-pick-box">${flag(match.team1)}${escHtml(match.team1)}</div>
        ${middleBox}
        <div class="voter-pick-box">${flag(match.team2)}${escHtml(match.team2)}</div>
        ${voterList(buckets.team1)}
        ${middleVoters}
        ${voterList(buckets.team2)}
      </div>
    </div>`;
}
