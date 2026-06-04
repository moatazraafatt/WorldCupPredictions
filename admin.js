/**
 * admin.js
 * Drives admin.html — protected by ADMIN_UID check.
 * Sections: seed fixtures, enter results, group standings,
 * build R32, generate knockout rounds, set champion.
 */

import { getCurrentUser, isAdmin } from "./auth.js";
import {
  db,
  seedFixtures,
  getMatches,
  getMatch,
  updateMatch,
  setMatch,
  getAllGroupStandings,
  setGroupStanding,
  getThirdPlaceQualifiers,
  setThirdPlaceQualifiers,
  recalculatePointsForMatch,
  recalculateAllTotals,
  setTournamentChampion,
  getAllUsers,
} from "./db.js";
import {
  collection,
  getDocs,
  doc,
  writeBatch,
  serverTimestamp,
  Timestamp,
  query,
  orderBy,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { GROUP_FIXTURES, ALL_TEAMS, GROUPS_MAP } from "./fixtures-data.js";
import {
  renderNav,
  setLoading,
  showToast,
  showConfirm,
  formatTime,
} from "./ui.js";

// ─── Module-level handler ref to prevent duplicate change listeners ─────────
let _tpChangeHandler = null;

// ─── Stage display names ──────────────────────────────────────────────────────
const STAGE_NAMES = {
  r32: "Round of 32",
  r16: "Round of 16",
  qf: "Quarter-finals",
  sf: "Semi-finals",
  final: "Final",
  third_place: "Third Place",
};

export async function initAdmin() {
  setLoading(true);
  const user = await getCurrentUser();
  if (!user || !isAdmin(user.uid)) {
    document.body.innerHTML = `<div class="admin-denied"><h1>🚫 Access Denied</h1><p>Admin only.</p><a href="index.html">Go home</a></div>`;
    return;
  }

  renderNav(user, true);
  bindAllSections();
  setLoading(false);
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION BINDERS
// ════════════════════════════════════════════════════════════════════════════

function bindAllSections() {
  bindSeedFixtures();
  bindGroupResults();
  bindGroupStandings();
  bindThirdPlaceSection();
  buildR32Section();
  buildKnockoutBuilders();
  bindKnockoutResults();
  bindChampion();
  bindRecalcAll();
}

// ─── 1. Seed Fixtures ────────────────────────────────────────────────────────

function bindSeedFixtures() {
  document.getElementById("seed-btn")?.addEventListener("click", async () => {
    const ok = await showConfirm(
      "Seed all 72 group stage fixtures into Firestore?",
    );
    if (!ok) return;
    setLoading(true);
    try {
      // Writes 72 match documents in one batch to /matches
      await seedFixtures(GROUP_FIXTURES);
      showToast("72 fixtures seeded!", "success");
    } catch (err) {
      showToast("Seed error: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  });
}

// ─── 2. Group Stage Results ───────────────────────────────────────────────────

async function refreshGroupResultSelect() {
  const matches = await getMatches("group");
  const select = document.getElementById("group-match-select");
  if (!select) return;
  select.innerHTML =
    `<option value="">-- Select Match --</option>` +
    matches
      .map(
        (m) =>
          `<option value="${m.matchId}">${m.group}: ${m.team1} vs ${m.team2} ${m.result ? "✓" : ""}</option>`,
      )
      .join("");
}

async function bindGroupResults() {
  const section = document.getElementById("group-results-section");
  if (!section) return;

  await refreshGroupResultSelect();

  // Use replaceWith to wipe any previously attached listeners before binding
  const oldForm = document.getElementById("group-result-form");
  if (!oldForm) return;
  const form = oldForm.cloneNode(true);
  oldForm.replaceWith(form);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const select = document.getElementById("group-match-select");
    const matchId = select.value;
    const result = document.getElementById("group-result-select").value;
    if (!matchId || !result) {
      showToast("Select match and result", "error");
      return;
    }

    setLoading(true);
    try {
      const match = await getMatch(matchId);
      await updateMatch(matchId, { result });
      await recalculatePointsForMatch(matchId, result, "group");
      showToast(
        `Result saved: ${match.team1} vs ${match.team2} → ${result}`,
        "success",
      );
      // Only refresh the select — do NOT re-bind the form
      await refreshGroupResultSelect();
    } catch (err) {
      showToast("Error: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  });
}

// ─── 3. Group Standings ───────────────────────────────────────────────────────

async function bindGroupStandings() {
  const container = document.getElementById("standings-container");
  if (!container) return;

  const existing = await getAllGroupStandings();

  const groups = Object.keys(GROUPS_MAP).sort();

  // Build rows (no per-group save buttons)
  const rows = groups
    .map((grp) => {
      const teams = [...GROUPS_MAP[grp]].sort((a, b) => a.localeCompare(b));
      const standing = existing[grp] || {};
      const opts = teams
        .map(
          (t) =>
            `<option value="${t}" ${standing.first === t ? "selected" : ""}>${t}</option>`,
        )
        .join("");
      const opts2 = teams
        .map(
          (t) =>
            `<option value="${t}" ${standing.second === t ? "selected" : ""}>${t}</option>`,
        )
        .join("");
      return `
      <div class="standing-row">
        <strong>Group ${grp}</strong>
        <label>1st: <select id="st-${grp}-1" class="input st-select"><option value="">--</option>${opts}</select></label>
        <label>2nd: <select id="st-${grp}-2" class="input st-select"><option value="">--</option>${opts2}</select></label>
      </div>`;
    })
    .join("");

  container.innerHTML = `
    ${rows}
    <div class="standing-save-row">
      <button id="save-all-standings-btn" class="btn btn-primary" disabled>
        💾 Save All Standings
      </button>
    </div>`;

  const saveBtn = document.getElementById("save-all-standings-btn");

  // Check whether current selections differ from what is already saved
  function checkDirty() {
    for (const grp of groups) {
      const s1 = document.getElementById(`st-${grp}-1`);
      const s2 = document.getElementById(`st-${grp}-2`);
      if (!s1 || !s2) continue;
      const saved = existing[grp] || {};
      if (
        s1.value !== (saved.first || "") ||
        s2.value !== (saved.second || "")
      ) {
        return true;
      }
    }
    return false;
  }

  function updateSaveBtn() {
    const dirty = checkDirty();
    saveBtn.disabled = !dirty;
    saveBtn.classList.toggle("btn-dimmed", !dirty);
  }

  // Listen for any change in any select
  container.addEventListener("change", (e) => {
    if (e.target.classList.contains("st-select")) {
      updateSaveBtn();
    }
  });

  // Initial state: dim if nothing changed
  updateSaveBtn();

  saveBtn.addEventListener("click", async () => {
    // Validate all groups before writing
    for (const grp of groups) {
      const first = document.getElementById(`st-${grp}-1`).value;
      const second = document.getElementById(`st-${grp}-2`).value;
      if (!first || !second) {
        showToast(`Group ${grp}: select both 1st and 2nd`, "error");
        return;
      }
      if (first === second) {
        showToast(`Group ${grp}: 1st and 2nd must be different teams`, "error");
        return;
      }
    }

    setLoading(true);
    try {
      for (const grp of groups) {
        const first = document.getElementById(`st-${grp}-1`).value;
        const second = document.getElementById(`st-${grp}-2`).value;
        await setGroupStanding(grp, { first, second });
        // Update local cache so dirty-check works correctly after save
        existing[grp] = { first, second };
      }
      showToast("All group standings saved!", "success");
      // Dim the button — selections now match saved state
      saveBtn.disabled = true;
      saveBtn.classList.add("btn-dimmed");
      await bindThirdPlaceSection();
      await buildR32Section();
    } catch (err) {
      showToast("Error: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  });
}

// ─── 3b. Third-Place Qualifiers ──────────────────────────────────────────────

async function bindThirdPlaceSection() {
  const container = document.getElementById("third-place-container");
  if (!container) return;

  // ── Capture in-progress checkbox/select state BEFORE re-render ────────────
  // This preserves what the user has already ticked when a new standing is saved.
  const inProgressChecked = new Set(
    [...container.querySelectorAll(".tp-check:checked")].map(
      (cb) => cb.dataset.grp,
    ),
  );
  const inProgressSelections = {};
  container.querySelectorAll(".tp-select").forEach((sel) => {
    if (sel.value) inProgressSelections[sel.dataset.grp] = sel.value;
  });

  // Load existing standings and any previously saved qualifiers
  const [standings, saved] = await Promise.all([
    getAllGroupStandings(),
    getThirdPlaceQualifiers(),
  ]);
  const savedTeams = saved?.teams ?? [];

  // Build rows: for each group where 1st+2nd are set, show the remaining teams
  const groups = Object.keys(GROUPS_MAP).sort();
  const rows = groups
    .map((grp) => {
      const s = standings[grp];
      if (!s?.first || !s?.second) return ""; // not ready yet
      const remaining = GROUPS_MAP[grp]
        .filter((t) => t !== s.first && t !== s.second)
        .sort((a, b) => a.localeCompare(b));

      // Determine which team to show as selected in the dropdown:
      // priority: 1) what user had selected in DOM, 2) what's saved in Firestore, 3) first option
      const savedTeamForGrp = savedTeams.find((st) => remaining.includes(st));
      const selectedTeam =
        inProgressSelections[grp] ?? savedTeamForGrp ?? remaining[0];

      const opts = remaining
        .map(
          (t) =>
            `<option value="${t}" ${selectedTeam === t ? "selected" : ""}>${t}</option>`,
        )
        .join("");

      // Checked if: user had it checked before re-render, OR it's already saved in Firestore
      const isChecked =
        inProgressChecked.has(grp) || savedTeamForGrp !== undefined;

      return `
      <div class="third-place-row" data-grp="${grp}">
        <label class="third-place-check">
          <input type="checkbox" class="tp-check" data-grp="${grp}" ${isChecked ? "checked" : ""} />
          <strong>Group ${grp}</strong>
        </label>
        <select class="input tp-select" data-grp="${grp}">
          ${opts}
        </select>
        <span class="tp-rank">(3rd place)</span>
      </div>`;
    })
    .join("");

  if (!rows.trim()) {
    container.innerHTML = `<p>Set 1st &amp; 2nd place for each group first, then return here to pick the 8 best third-place teams.</p>`;
    return;
  }

  container.innerHTML = `
    <div id="tp-rows">${rows}</div>
    <p id="tp-counter" class="tp-counter">0 / 8 selected</p>
    <button class="btn btn-primary" id="save-tp-btn" disabled>Save 8 Third-Place Qualifiers</button>`;

  function updateCounter() {
    const checked = container.querySelectorAll(".tp-check:checked").length;
    const counter = document.getElementById("tp-counter");
    const btn = document.getElementById("save-tp-btn");
    if (counter) counter.textContent = `${checked} / 8 selected`;
    if (btn) btn.disabled = checked !== 8;
  }

  // Initialise counter (accounts for pre-checked boxes after re-render)
  updateCounter();

  // Remove old handler before adding new one to prevent accumulation across re-renders
  if (_tpChangeHandler)
    container.removeEventListener("change", _tpChangeHandler);
  _tpChangeHandler = (e) => {
    if (e.target.classList.contains("tp-check")) updateCounter();
  };
  container.addEventListener("change", _tpChangeHandler);

  document
    .getElementById("save-tp-btn")
    ?.addEventListener("click", async () => {
      const teams = [];
      container.querySelectorAll(".tp-check:checked").forEach((cb) => {
        const grp = cb.dataset.grp;
        const sel = container.querySelector(`.tp-select[data-grp="${grp}"]`);
        if (sel?.value) teams.push(sel.value);
      });
      if (teams.length !== 8) {
        showToast("Select exactly 8 teams", "error");
        return;
      }
      setLoading(true);
      try {
        await setThirdPlaceQualifiers(teams);
        showToast("8 third-place qualifiers saved!", "success");
        await buildR32Section();
      } catch (err) {
        showToast("Error: " + err.message, "error");
      } finally {
        setLoading(false);
      }
    });
}

// ─── 4. Build Round of 32 ────────────────────────────────────────────────────

async function buildR32Section() {
  const container = document.getElementById("r32-builder");
  if (!container) return;

  // Fetch qualified teams: 1st + 2nd from each group, plus 8 third-place qualifiers
  const [standings, thirdPlace] = await Promise.all([
    getAllGroupStandings(),
    getThirdPlaceQualifiers(),
  ]);
  const qualified = [];
  Object.keys(standings)
    .sort()
    .forEach((grp) => {
      const s = standings[grp];
      if (s.first)
        qualified.push({ team: s.first, label: `${s.first} (${grp} 1st)` });
      if (s.second)
        qualified.push({ team: s.second, label: `${s.second} (${grp} 2nd)` });
    });
  // Append 8 third-place qualifiers (if saved)
  (thirdPlace?.teams ?? []).forEach((t) => {
    qualified.push({ team: t, label: `${t} (3rd place)` });
  });

  if (qualified.length < 2) {
    container.innerHTML = `<p>Set group standings first to unlock R32 builder.</p>`;
    return;
  }

  // Check if R32 already exists
  const existing = await getMatches("r32");
  if (existing.length > 0) {
    container.innerHTML = `<p class="success-msg">✅ Round of 32 already built (${existing.length} matches). Edit results in the knockout results section.</p>`;
    return;
  }

  const teamOpts = [...qualified]
    .sort((a, b) => a.team.localeCompare(b.team))
    .map((q) => `<option value="${q.team}">${q.label}</option>`)
    .join("");

  let rows = "";
  for (let i = 1; i <= 16; i++) {
    const nextSlot = slotForR32(i);
    rows += `
      <div class="r32-match-row">
        <span class="slot-label">Match ${i} → feeds ${nextSlot}</span>
        <select id="r32-t1-${i}"><option value="">Team 1</option>${teamOpts}</select>
        <span>vs</span>
        <select id="r32-t2-${i}"><option value="">Team 2</option>${teamOpts}</select>
        <input type="datetime-local" id="r32-time-${i}" />
      </div>`;
  }

  container.innerHTML = `
    <h3>Build Round of 32</h3>
    <div class="r32-rows">${rows}</div>
    <button class="btn btn-primary" id="save-r32-btn">Save Round of 32</button>`;

  // ── Dim already-selected teams across all dropdowns ──────────────────────
  const allSelects = () =>
    container.querySelectorAll("select[id^='r32-t1-'], select[id^='r32-t2-']");

  function syncR32Selects() {
    const selects = [...allSelects()];
    // Build set of all chosen values
    const chosen = new Set(selects.map((s) => s.value).filter(Boolean));
    selects.forEach((sel) => {
      const own = sel.value;
      sel.querySelectorAll("option").forEach((opt) => {
        if (!opt.value) return; // keep the placeholder enabled
        const takenElsewhere = chosen.has(opt.value) && opt.value !== own;
        opt.disabled = takenElsewhere;
        opt.classList.toggle("option-dimmed", takenElsewhere);
      });
    });
  }

  // Run once on render, then on every change
  syncR32Selects();
  container.addEventListener("change", (e) => {
    if (
      e.target.id?.startsWith("r32-t1-") ||
      e.target.id?.startsWith("r32-t2-")
    ) {
      syncR32Selects();
    }
  });

  document
    .getElementById("save-r32-btn")
    ?.addEventListener("click", async () => {
      await saveR32Matches(qualified);
    });
}

/**
 * Determine which R16 slot an R32 slot feeds into.
 */
function slotForR32(matchNum) {
  const r16Idx = Math.ceil(matchNum / 2);
  return `r16_slot_${r16Idx}`;
}

async function saveR32Matches(qualified) {
  const matches = [];
  for (let i = 1; i <= 16; i++) {
    const t1 = document.getElementById(`r32-t1-${i}`)?.value;
    const t2 = document.getElementById(`r32-t2-${i}`)?.value;
    const timeVal = document.getElementById(`r32-time-${i}`)?.value;

    if (!t1 || !t2 || !timeVal) {
      showToast(`Complete all fields for match ${i}`, "error");
      return;
    }
    if (t1 === t2) {
      showToast(`Match ${i}: same team selected twice`, "error");
      return;
    }

    const bracketSlot = `r32_slot_${i}`;
    const nextMatchSlot = slotForR32(i);

    matches.push({
      matchId: `r32_match_${String(i).padStart(2, "0")}`,
      stage: "r32",
      team1: t1,
      team2: t2,
      scheduledTime: Timestamp.fromDate(new Date(timeVal)),
      result: null,
      bracketSlot,
      nextMatchSlot,
    });
  }

  const ok = await showConfirm("Save all 16 Round of 32 matches?");
  if (!ok) return;

  setLoading(true);
  try {
    const batch = writeBatch(db);
    matches.forEach((m) => {
      // Write each R32 match to /matches/{matchId}
      batch.set(doc(db, "matches", m.matchId), m);
    });
    await batch.commit();
    showToast("Round of 32 saved! Users can now predict.", "success");
    await buildR32Section(); // refresh UI
  } catch (err) {
    showToast("Error: " + err.message, "error");
  } finally {
    setLoading(false);
  }
}

// ─── 5. Build Knockout Rounds ────────────────────────────────────────────────

async function buildKnockoutBuilders() {
  await buildKnockoutRoundSection("r16", "r32", 8);
  await buildKnockoutRoundSection("qf", "r16", 4);
  await buildKnockoutRoundSection("sf", "qf", 2);
  await buildKnockoutRoundSection("final", "sf", 1, "winners");
  await buildKnockoutRoundSection("third_place", "sf", 1, "losers");
}

/**
 * Generic manual knockout round builder.
 * teamSource: "winners" (default) or "losers" — which teams from prevStage to offer.
 */
async function buildKnockoutRoundSection(stage, prevStage, matchCount, teamSource = "winners") {
  const container = document.getElementById(`${stage}-builder`);
  if (!container) return;

  // Already built?
  const existing = await getMatches(stage);
  if (existing.length > 0) {
    container.innerHTML = `<p class="success-msg">✅ ${STAGE_NAMES[stage]} already built (${existing.length} match${existing.length > 1 ? "es" : ""}).</p>`;
    return;
  }

  // Previous round must exist
  const prevMatches = await getMatches(prevStage);
  if (prevMatches.length === 0) {
    container.innerHTML = `<p>Build ${STAGE_NAMES[prevStage] || prevStage.toUpperCase()} first.</p>`;
    return;
  }

  // All previous results must be entered
  const incomplete = prevMatches.filter((m) => !m.result);
  if (incomplete.length > 0) {
    container.innerHTML = `<p>Enter all ${STAGE_NAMES[prevStage]} results first (${incomplete.length} remaining).</p>`;
    return;
  }

  // Build team list from previous round
  const teams = prevMatches
    .map((m) =>
      teamSource === "losers"
        ? m.result === "team1" ? m.team2 : m.team1
        : m.result === "team1" ? m.team1 : m.team2,
    )
    .sort((a, b) => a.localeCompare(b));

  const teamOpts = teams.map((t) => `<option value="${t}">${t}</option>`).join("");

  let rows = "";
  for (let i = 1; i <= matchCount; i++) {
    rows += `
      <div class="r32-match-row">
        <span class="slot-label">Match ${i}</span>
        <select id="${stage}-t1-${i}"><option value="">Team 1</option>${teamOpts}</select>
        <span>vs</span>
        <select id="${stage}-t2-${i}"><option value="">Team 2</option>${teamOpts}</select>
        <input type="datetime-local" id="${stage}-time-${i}" />
      </div>`;
  }

  const stageName = STAGE_NAMES[stage];
  container.innerHTML = `
    <div class="r32-rows">${rows}</div>
    <button class="btn btn-primary" id="save-${stage}-btn">Save ${stageName}</button>`;

  // Dim already-selected teams across all dropdowns
  const allSels = () =>
    container.querySelectorAll(`select[id^='${stage}-t1-'], select[id^='${stage}-t2-']`);

  function syncSelects() {
    const sels = [...allSels()];
    const chosen = new Set(sels.map((s) => s.value).filter(Boolean));
    sels.forEach((sel) => {
      const own = sel.value;
      sel.querySelectorAll("option").forEach((opt) => {
        if (!opt.value) return;
        opt.disabled = chosen.has(opt.value) && opt.value !== own;
      });
    });
  }

  syncSelects();
  container.addEventListener("change", syncSelects);

  document.getElementById(`save-${stage}-btn`)?.addEventListener("click", async () => {
    const matches = [];
    for (let i = 1; i <= matchCount; i++) {
      const t1 = document.getElementById(`${stage}-t1-${i}`)?.value;
      const t2 = document.getElementById(`${stage}-t2-${i}`)?.value;
      const timeVal = document.getElementById(`${stage}-time-${i}`)?.value;
      if (!t1 || !t2 || !timeVal) {
        showToast(`Complete all fields for match ${i}`, "error");
        return;
      }
      if (t1 === t2) {
        showToast(`Match ${i}: same team selected twice`, "error");
        return;
      }
      matches.push({
        matchId: `${stage}_match_${String(i).padStart(2, "0")}`,
        stage,
        team1: t1,
        team2: t2,
        scheduledTime: Timestamp.fromDate(new Date(timeVal)),
        result: null,
        bracketSlot: `${stage}_slot_${i}`,
        nextMatchSlot: null,
      });
    }

    const ok = await showConfirm(`Save ${matchCount} ${stageName} match${matchCount > 1 ? "es" : ""}?`);
    if (!ok) return;

    setLoading(true);
    try {
      const batch = writeBatch(db);
      matches.forEach(({ matchId, ...data }) => {
        batch.set(doc(db, "matches", matchId), data);
      });
      await batch.commit();
      showToast(`${stageName} saved! Users can now predict.`, "success");
      await buildKnockoutRoundSection(stage, prevStage, matchCount, teamSource);
      await refreshKnockoutSelects();
    } catch (err) {
      showToast("Error: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  });
}

// ─── 6. Knockout Results ──────────────────────────────────────────────────────

async function refreshKnockoutSelects() {
  const stages = ["r32", "r16", "qf", "sf", "third_place", "final"];
  for (const stage of stages) {
    const select = document.getElementById(`${stage}-match-select`);
    if (!select) continue;
    const matches = await getMatches(stage);
    select.innerHTML =
      `<option value="">-- Select Match --</option>` +
      matches
        .map(
          (m) =>
            `<option value="${m.matchId}">${m.team1} vs ${m.team2} ${m.result ? "✓" : ""}</option>`,
        )
        .join("");
  }
}

async function bindKnockoutResults() {
  const stages = ["r32", "r16", "qf", "sf", "third_place", "final"];

  await refreshKnockoutSelects();

  for (const stage of stages) {
    const oldForm = document.getElementById(`${stage}-result-form`);
    if (!oldForm) continue;

    // Clone to remove any previously attached listeners
    const form = oldForm.cloneNode(true);
    oldForm.replaceWith(form);

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const select = document.getElementById(`${stage}-match-select`);
      const matchId = select?.value;
      const result = document.getElementById(`${stage}-result-select`)?.value;
      if (!matchId || !result) {
        showToast("Select match and result", "error");
        return;
      }

      setLoading(true);
      try {
        await updateMatch(matchId, { result });
        await recalculatePointsForMatch(matchId, result, stage);
        showToast("Knockout result saved & points updated!", "success");
        // Refresh selects and re-check if next round builder is now unlocked
        await refreshKnockoutSelects();
        await buildKnockoutBuilders();
      } catch (err) {
        showToast("Error: " + err.message, "error");
      } finally {
        setLoading(false);
      }
    });
  }
}

// ─── 7. Tournament Champion ───────────────────────────────────────────────────

function bindChampion() {
  const select = document.getElementById("champion-select");
  if (!select) return;

  select.innerHTML =
    `<option value="">-- Select Champion --</option>` +
    [...ALL_TEAMS]
      .sort((a, b) => a.localeCompare(b))
      .map((t) => `<option value="${t}">${t}</option>`)
      .join("");

  document
    .getElementById("champion-form")
    ?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const champion = select.value;
      if (!champion) {
        showToast("Select a team", "error");
        return;
      }

      const ok = await showConfirm(
        `Set ${champion} as World Cup 2026 Champion?`,
      );
      if (!ok) return;

      setLoading(true);
      try {
        // Award bonus points to all users based on their pick order
        await setTournamentChampion(champion);
        showToast(
          `Champion set: ${champion}. Bonus points awarded!`,
          "success",
        );
      } catch (err) {
        showToast("Error: " + err.message, "error");
      } finally {
        setLoading(false);
      }
    });
}

// ─── 8. Recalculate All Points (manual repair tool) ──────────────────────────

function bindRecalcAll() {
  document
    .getElementById("recalc-all-btn")
    ?.addEventListener("click", async () => {
      const ok = await showConfirm(
        "Recalculate all user totals from scratch? This reads every prediction and may take a moment.",
      );
      if (!ok) return;
      setLoading(true);
      try {
        await recalculateAllTotals();
        showToast("All totals recalculated!", "success");
      } catch (err) {
        showToast("Error: " + err.message, "error");
      } finally {
        setLoading(false);
      }
    });
}
