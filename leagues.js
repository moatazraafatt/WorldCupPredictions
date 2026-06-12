/**
 * leagues.js
 * Drives leagues.html: create/join leagues, live leaderboards per league.
 */

// /* import { getCurrentUser } from "./auth.js";
// import { isAdmin } from "./auth.js";
// import {
//   getUserLeagues,
//   createLeague,
//   joinLeagueByCode,
//   onLeagueLeaderboard,
// } from "./db.js";
// import { renderNav, requireAuth, setLoading, showToast } from "./ui.js";

// let currentUser = null;
// const leagueUnsubs = {}; // leagueId → unsubscribe

// export async function initLeagues() {
//   setLoading(true);
//   currentUser = await getCurrentUser();
//   if (!requireAuth(currentUser)) return;

//   renderNav(currentUser, isAdmin(currentUser.uid));
//   bindForms();
//   await loadLeagues();
//   setLoading(false);
// }

// /**
//  * Load all leagues the user belongs to and render them.
//  */
// async function loadLeagues() {
//   const container = document.getElementById("leagues-container");
//   container.innerHTML = `<p>Loading leagues…</p>`;

//   // Read /leagues where members array-contains current user's uid
//   const leagues = await getUserLeagues(currentUser.uid);

//   if (leagues.length === 0) {
//     container.innerHTML = `<p class="empty-state">You're not in any leagues yet. Create or join one below!</p>`;
//     return;
//   }

//   container.innerHTML = leagues
//     .map(
//       (l) => `
//       <section class="league-card" id="league-${l.leagueId}">
//         <div class="league-header">
//           <h2>${escHtml(l.name)}</h2>
//           <a href="league-predictions.html?leagueId=${l.leagueId}" class="btn btn-primary btn-sm">View Predictions</a>
//         </div>
//         <div class="leaderboard-container" id="lb-${l.leagueId}">
//           <p>Loading leaderboard…</p>
//         </div>
//         <div class="league-card-footer">
//           <span class="invite-code">Code: <strong>${l.inviteCode}</strong></span>
//         </div>
//       </section>`

//     )
//     .join("");

//   // Subscribe to each league's leaderboard
//   leagues.forEach((l) => {
//     if (leagueUnsubs[l.leagueId]) leagueUnsubs[l.leagueId]();
//     leagueUnsubs[l.leagueId] = onLeagueLeaderboard(l.members, (members) => {
//       renderLeaderboard(l.leagueId, members);
//     });
//   });
// }

// /**
//  * Render a leaderboard table inside a league card.
//  */
// function renderLeaderboard(leagueId, members) {
//   const container = document.getElementById(`lb-${leagueId}`);
//   if (!container) return;

//   const rows = members
//     .map(
//       (m, i) => `
//       <tr class="${m.uid === currentUser.uid ? "me" : ""}">
//         <td class="rank">${i + 1}</td>
//         <td class="name">${escHtml(m.displayName || "Anonymous")}</td>
//         <td class="pts">${m.totalPoints ?? 0} pts</td>
//       </tr>`,
//     )
//     .join("");

//   container.innerHTML = `
//     <table class="leaderboard">
//       <thead><tr><th>#</th><th>Player</th><th>Points</th></tr></thead>
//       <tbody>${rows}</tbody>
//     </table>`;
// }

// /**
//  * Bind create/join form submit handlers.
//  */
// function bindForms() {
//   // Create league form
//   document
//     .getElementById("create-league-form")
//     ?.addEventListener("submit", async (e) => {
//       e.preventDefault();
//       const nameInput = document.getElementById("league-name");
//       const name = nameInput.value.trim();
//       if (!name) return;

//       try {
//         setLoading(true);
//         // Writes new league document to /leagues
//         const { leagueId, inviteCode } = await createLeague(
//           name,
//           currentUser.uid,
//         );
//         showToast(`League created! Invite code: ${inviteCode}`, "success");
//         nameInput.value = "";
//         await loadLeagues();
//       } catch (err) {
//         showToast("Error: " + err.message, "error");
//       } finally {
//         setLoading(false);
//       }
//     });

//   // Join league form
//   document
//     .getElementById("join-league-form")
//     ?.addEventListener("submit", async (e) => {
//       e.preventDefault();
//       const codeInput = document.getElementById("invite-code");
//       const code = codeInput.value.trim().toUpperCase();
//       if (code.length !== 6) {
//         showToast("Enter a 6-character code", "error");
//         return;
//       }

//       try {
//         setLoading(true);
//         // Queries /leagues by inviteCode, adds uid to members
//         await joinLeagueByCode(code, currentUser.uid);
//         showToast("Joined league!", "success");
//         codeInput.value = "";
//         // Tear down existing listeners before reloading
//         Object.values(leagueUnsubs).forEach((u) => u());
//         await loadLeagues();
//       } catch (err) {
//         showToast("Error: " + err.message, "error");
//       } finally {
//         setLoading(false);
//       }
//     });
// }

// function escHtml(s) {
//   return String(s).replace(
//     /[&<>"']/g,
//     (c) =>
//       ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
//         c
//       ],
//   );
// } */




/**
 * leagues.js
 * Drives leagues.html: create/join leagues, live leaderboards per league.
 */

import { getCurrentUser } from "./auth.js";
import { isAdmin } from "./auth.js";
import {
  getUserLeagues,
  createLeague,
  joinLeagueByCode,
  onLeagueLeaderboard,
} from "./db.js";
import { renderNav, requireAuth, setLoading, showToast } from "./ui.js";

let currentUser = null;
const leagueUnsubs = {}; // leagueId → unsubscribe

export async function initLeagues() {
  setLoading(true);
  currentUser = await getCurrentUser();
  if (!requireAuth(currentUser)) return;

  renderNav(currentUser, isAdmin(currentUser.uid));
  bindForms();
  await loadLeagues();
  setLoading(false);
}

/**
 * Load all leagues the user belongs to and render them.
 */
async function loadLeagues() {
  const container = document.getElementById("leagues-container");
  container.innerHTML = `<p>Loading leagues…</p>`;

  // Read /leagues where members array-contains current user's uid
  const leagues = await getUserLeagues(currentUser.uid);

  if (leagues.length === 0) {
    container.innerHTML = `<p class="empty-state">You're not in any leagues yet. Create or join one below!</p>`;
    return;
  }

  container.innerHTML = leagues
    .map(
      (l) => `
      <section class="league-card" id="league-${l.leagueId}">
        <div class="league-header">
          <h2>${escHtml(l.name)}</h2>
          <a href="league-predictions.html?leagueId=${l.leagueId}" class="btn btn-primary btn-sm">View Predictions</a>
        </div>
        <div class="leaderboard-container" id="lb-${l.leagueId}">
          <p>Loading leaderboard…</p>
        </div>
        <div class="league-card-footer">
          <span class="invite-code">Code: <strong>${l.inviteCode}</strong></span>
        </div>
      </section>`
    )
    .join("");

  // Subscribe to each league's leaderboard
  leagues.forEach((l) => {
    if (leagueUnsubs[l.leagueId]) leagueUnsubs[l.leagueId]();
    leagueUnsubs[l.leagueId] = onLeagueLeaderboard(l.members, (members) => {
      renderLeaderboard(l.leagueId, members);
    });
  });
}

/**
 * Render a leaderboard table inside a league card.
 * Uses standard competition ranking (1224): tied users share the same rank,
 * and the next rank skips ahead by the number of tied users.
 */
function renderLeaderboard(leagueId, members) {
  const container = document.getElementById(`lb-${leagueId}`);
  if (!container) return;

  // 1. Sort by points descending
  const sorted = [...members].sort(
    (a, b) => (b.totalPoints ?? 0) - (a.totalPoints ?? 0)
  );

  // 2. Assign standard competition ranks
  const rows = sorted
    .map((m, i, arr) => {
      // Find the first index where this point value appears in the sorted array.
      // Since the array is sorted descending, this gives all tied users the same rank,
      // and the next group's rank skips ahead by the number of tied users.
      const rank =
        arr.findIndex((x) => (x.totalPoints ?? 0) === (m.totalPoints ?? 0)) + 1;

      return `
        <tr class="${m.uid === currentUser.uid ? "me" : ""}">
          <td class="rank">${rank}</td>
          <td class="name">${escHtml(m.displayName || "Anonymous")}</td>
          <td class="pts">${m.totalPoints ?? 0} pts</td>
        </tr>`;
    })
    .join("");

  container.innerHTML = `
    <table class="leaderboard">
      <thead><tr><th>#</th><th>Player</th><th>Points</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}

/**
 * Bind create/join form submit handlers.
 */
function bindForms() {
  // Create league form
  document
    .getElementById("create-league-form")
    ?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const nameInput = document.getElementById("league-name");
      const name = nameInput.value.trim();
      if (!name) return;

      try {
        setLoading(true);
        // Writes new league document to /leagues
        const { leagueId, inviteCode } = await createLeague(
          name,
          currentUser.uid,
        );
        showToast(`League created! Invite code: ${inviteCode}`, "success");
        nameInput.value = "";
        await loadLeagues();
      } catch (err) {
        showToast("Error: " + err.message, "error");
      } finally {
        setLoading(false);
      }
    });

  // Join league form
  document
    .getElementById("join-league-form")
    ?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const codeInput = document.getElementById("invite-code");
      const code = codeInput.value.trim().toUpperCase();
      if (code.length !== 6) {
        showToast("Enter a 6-character code", "error");
        return;
      }

      try {
        setLoading(true);
        // Queries /leagues by inviteCode, adds uid to members
        await joinLeagueByCode(code, currentUser.uid);
        showToast("Joined league!", "success");
        codeInput.value = "";
        // Tear down existing listeners before reloading
        Object.values(leagueUnsubs).forEach((u) => u());
        await loadLeagues();
      } catch (err) {
        showToast("Error: " + err.message, "error");
      } finally {
        setLoading(false);
      }
    });
}

function escHtml(s) {
  return String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
}
