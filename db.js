/**
 * db.js
 * All Firestore read/write operations.
 * Centralises data access so other modules never import Firestore directly.
 */

import {
  initializeApp,
  getApps,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  addDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  writeBatch,
  serverTimestamp,
  Timestamp,
  arrayUnion,
  increment,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { firebaseConfig, POINTS, PICK_BONUS } from "./firebase-config.js";

// ─── Firestore singleton ─────────────────────────────────────────────────────
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const db = getFirestore(app);

// ════════════════════════════════════════════════════════════════════════════
// USER DOCUMENTS
// ════════════════════════════════════════════════════════════════════════════

/**
 * Create the initial /users/{uid} document on first registration.
 */
export async function createUserDocument(uid, { email, displayName }) {
  // setDoc with merge:true is safe to call again (won't overwrite existing data)
  await setDoc(
    doc(db, "users", uid),
    { email, displayName, totalPoints: 0, createdAt: serverTimestamp() },
    { merge: true },
  );
}

/**
 * Read a single user document. Returns the data object or null.
 */
export async function getUserData(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? { uid, ...snap.data() } : null;
}

/**
 * Update arbitrary fields on a user document.
 */
export async function updateUserData(uid, fields) {
  await updateDoc(doc(db, "users", uid), fields);
}

/**
 * Fetch all user documents (for global leaderboard / admin).
 * Reads entire /users collection — only used in admin & leaderboard contexts.
 */
export async function getAllUsers() {
  const snap = await getDocs(collection(db, "users"));
  return snap.docs.map((d) => ({ uid: d.id, ...d.data() }));
}

// ════════════════════════════════════════════════════════════════════════════
// MATCHES
// ════════════════════════════════════════════════════════════════════════════

/**
 * Seed all group-stage fixtures into Firestore in one batch write.
 * Called once from admin panel. Uses matchId as document ID.
 */
export async function seedFixtures(fixtures) {
  const batch = writeBatch(db);
  for (const f of fixtures) {
    const ref = doc(db, "matches", f.matchId);
    batch.set(ref, {
      stage: f.stage,
      group: f.group,
      team1: f.team1,
      team2: f.team2,
      // Convert ISO string to Firestore Timestamp
      scheduledTime: Timestamp.fromDate(new Date(f.scheduledTime)),
      result: null,
    });
  }
  // Commit all 72 writes atomically
  await batch.commit();
}

/**
 * Fetch all matches, optionally filtered by stage.
 * Returns array sorted by scheduledTime ascending.
 */
export async function getMatches(stage = null) {
  let q = stage
    ? query(
        collection(db, "matches"),
        where("stage", "==", stage),
        orderBy("scheduledTime", "asc"),
      )
    : query(collection(db, "matches"), orderBy("scheduledTime", "asc"));

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ matchId: d.id, ...d.data() }));
}

/**
 * Fetch a single match document by ID.
 */
export async function getMatch(matchId) {
  const snap = await getDoc(doc(db, "matches", matchId));
  return snap.exists() ? { matchId: snap.id, ...snap.data() } : null;
}

/**
 * Write a single match document (admin use: create knockout matches).
 */
export async function setMatch(matchId, data) {
  await setDoc(doc(db, "matches", matchId), data, { merge: true });
}

/**
 * Update match fields (e.g. result, scheduledTime).
 */
export async function updateMatch(matchId, fields) {
  await updateDoc(doc(db, "matches", matchId), fields);
}

/**
 * Real-time listener for all matches of a given stage.
 * Returns unsubscribe function.
 */
export function onMatchesSnapshot(stage, callback) {
  const q = query(
    collection(db, "matches"),
    where("stage", "==", stage),
    orderBy("scheduledTime", "asc"),
  );
  // onSnapshot keeps the UI in sync with Firestore changes
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ matchId: d.id, ...d.data() })));
  });
}

/**
 * Real-time listener for ALL matches (bracket page needs all stages).
 */
export function onAllMatchesSnapshot(callback) {
  const q = query(collection(db, "matches"), orderBy("scheduledTime", "asc"));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ matchId: d.id, ...d.data() })));
  });
}

// ════════════════════════════════════════════════════════════════════════════
// PREDICTIONS
// ════════════════════════════════════════════════════════════════════════════

/**
 * Save or update a user's prediction for one match.
 * Path: /users/{uid}/predictions/{matchId}
 */
export async function savePrediction(uid, matchId, prediction) {
  await setDoc(
    doc(db, "users", uid, "predictions", matchId),
    { prediction, pointsEarned: null, updatedAt: serverTimestamp() },
    { merge: true },
  );
}

/**
 * Fetch a single prediction document for a user+match.
 */
export async function getPrediction(uid, matchId) {
  const snap = await getDoc(doc(db, "users", uid, "predictions", matchId));
  return snap.exists() ? snap.data() : null;
}

/**
 * Fetch all predictions made by a user.
 * Used on history page and for points recalculation.
 */
export async function getAllPredictions(uid) {
  const snap = await getDocs(collection(db, "users", uid, "predictions"));
  return snap.docs.map((d) => ({ matchId: d.id, ...d.data() }));
}

/**
 * Fetch predictions for a list of users for a single match, in parallel.
 * Returns a map of { uid: predictionData | null }.
 * Used to display league members' predictions after the match deadline.
 */
export async function getLeagueMemberPredictions(memberUids, matchId) {
  const results = await Promise.all(
    memberUids.map((uid) => getPrediction(uid, matchId)),
  );
  const map = {};
  memberUids.forEach((uid, i) => {
    map[uid] = results[i]; // null if member never submitted a prediction
  });
  return map;
}

/**
 * Real-time listener for a user's predictions sub-collection.
 * Returns unsubscribe. Used to keep prediction buttons live.
 */
export function onPredictionsSnapshot(uid, callback) {
  return onSnapshot(collection(db, "users", uid, "predictions"), (snap) => {
    const map = {};
    snap.docs.forEach((d) => {
      map[d.id] = d.data();
    });
    callback(map);
  });
}

// ════════════════════════════════════════════════════════════════════════════
// TOURNAMENT PICKS (top-4 winner prediction)
// ════════════════════════════════════════════════════════════════════════════

/**
 * Save user's ranked tournament picks.
 * Path: /users/{uid}/tournamentPicks/picks  (single doc)
 */
export async function saveTournamentPicks(uid, picks) {
  await setDoc(
    doc(db, "users", uid, "tournamentPicks", "picks"),
    { picks, updatedAt: serverTimestamp(), bonusEarned: null },
    { merge: true },
  );
}

/**
 * Read user's tournament picks document.
 */
export async function getTournamentPicks(uid) {
  const snap = await getDoc(doc(db, "users", uid, "tournamentPicks", "picks"));
  return snap.exists() ? snap.data() : null;
}

// ════════════════════════════════════════════════════════════════════════════
// POINTS RECALCULATION (called by admin after result entry)
// ════════════════════════════════════════════════════════════════════════════

/**
 * After admin sets a match result, this function:
 * 1. Reads all users
 * 2. For each user, reads their prediction for this match
 * 3. Awards points if prediction matches result
 * 4. Recalculates totalPoints from all predictions
 * 5. Batch-writes everything back
 *
 * This is intentionally comprehensive to keep totalPoints accurate.
 */
export async function recalculatePointsForMatch(matchId, result, stage) {
  const pointValue = POINTS[stage] ?? 0;
  const users = await getAllUsers();

  // ── 1. Read all N prediction docs in ONE parallel round trip ─────────────
  const predRefs = users.map((u) =>
    doc(db, "users", u.uid, "predictions", matchId),
  );
  const predSnaps = await Promise.all(predRefs.map((ref) => getDoc(ref)));

  // ── 2. Compute deltas and pack everything into ONE batch write ────────────
  const batch = writeBatch(db);
  let hasWrites = false;

  predSnaps.forEach((snap, i) => {
    if (!snap.exists()) return; // user made no prediction — skip
    const predData = snap.data();
    const newEarned = predData.prediction === result ? pointValue : 0;
    const prevEarned =
      typeof predData.pointsEarned === "number" ? predData.pointsEarned : 0;
    const delta = newEarned - prevEarned;

    // Update pointsEarned on the prediction doc
    batch.set(predRefs[i], { pointsEarned: newEarned }, { merge: true });

    // Atomically apply only the delta — no full recalc needed
    if (delta !== 0) {
      batch.set(
        doc(db, "users", users[i].uid),
        { totalPoints: increment(delta) },
        { merge: true },
      );
    }
    hasWrites = true;
  });

  if (hasWrites) await batch.commit();
  // Total cost: N parallel reads (1 round trip) + 1 batch write (1 round trip)
}

/**
 * Recalculate and persist totalPoints for every user.
 * Reads all prediction sub-collections and sums pointsEarned.
 */
export async function recalculateAllTotals() {
  const users = await getAllUsers();

  // ── 1. Fan out ALL reads in parallel (2 round trips total) ───────────────
  const [allPredSnaps, allPicksSnaps] = await Promise.all([
    Promise.all(
      users.map((u) => getDocs(collection(db, "users", u.uid, "predictions"))),
    ),
    Promise.all(
      users.map((u) =>
        getDoc(doc(db, "users", u.uid, "tournamentPicks", "picks")),
      ),
    ),
  ]);

  // ── 2. Compute totals and commit in ONE batch write ───────────────────────
  const batch = writeBatch(db);
  users.forEach((user, i) => {
    let total = 0;
    allPredSnaps[i].docs.forEach((d) => {
      const pe = d.data().pointsEarned;
      if (typeof pe === "number") total += pe;
    });
    if (allPicksSnaps[i].exists()) {
      const bonus = allPicksSnaps[i].data().bonusEarned;
      if (typeof bonus === "number") total += bonus;
    }
    batch.set(
      doc(db, "users", user.uid),
      { totalPoints: total },
      { merge: true },
    );
  });
  await batch.commit();
  // Total cost: 2 parallel read round trips + 1 batch write (regardless of user count)
}

/**
 * Admin: set the tournament champion and award pick bonuses to all users.
 * champion: string (team name)
 */
export async function setTournamentChampion(champion) {
  const users = await getAllUsers();

  // ── 1. Read all picks docs in ONE parallel round trip ────────────────────
  const picksRefs = users.map((u) =>
    doc(db, "users", u.uid, "tournamentPicks", "picks"),
  );
  const picksSnaps = await Promise.all(picksRefs.map((ref) => getDoc(ref)));

  // ── 2. Compute bonuses and write in ONE batch ─────────────────────────────
  const batch = writeBatch(db);
  picksSnaps.forEach((snap, i) => {
    if (!snap.exists()) return;
    const picks = snap.data().picks || [];
    const idx = picks.indexOf(champion);
    const bonus = idx >= 0 ? PICK_BONUS[idx] : 0;
    batch.set(picksRefs[i], { bonusEarned: bonus }, { merge: true });
  });
  await batch.commit();

  // Re-sum totals after bonus award (also fully parallelised)
  await recalculateAllTotals();
}

// ════════════════════════════════════════════════════════════════════════════
// GROUP STANDINGS (admin sets 1st/2nd after group stage)
// ════════════════════════════════════════════════════════════════════════════

/**
 * Save group standings document.
 * Path: /groupStandings/{group}
 * standings: { first: "TeamName", second: "TeamName" }
 */
export async function setGroupStanding(group, standings) {
  await setDoc(doc(db, "groupStandings", group), {
    ...standings,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Fetch all group standings.
 */
export async function getAllGroupStandings() {
  const snap = await getDocs(collection(db, "groupStandings"));
  const result = {};
  snap.docs.forEach((d) => {
    result[d.id] = d.data();
  });
  return result;
}

// ════════════════════════════════════════════════════════════════════════════
// THIRD-PLACE QUALIFIERS (admin selects 8 best 3rd-place teams for R32)
// ════════════════════════════════════════════════════════════════════════════

/**
 * Fetch the saved list of 8 third-place qualifying teams.
 * Path: /thirdPlaceQualifiers/selected
 * Returns { teams: string[] } or null if not yet set.
 */
export async function getThirdPlaceQualifiers() {
  const snap = await getDoc(doc(db, "thirdPlaceQualifiers", "selected"));
  return snap.exists() ? snap.data() : null;
}

/**
 * Save the 8 third-place teams that advance to the Round of 32.
 * Path: /thirdPlaceQualifiers/selected
 * @param {string[]} teams - array of exactly 8 team name strings
 */
export async function setThirdPlaceQualifiers(teams) {
  await setDoc(doc(db, "thirdPlaceQualifiers", "selected"), {
    teams,
    updatedAt: serverTimestamp(),
  });
}

// ════════════════════════════════════════════════════════════════════════════
// LEAGUES
// ════════════════════════════════════════════════════════════════════════════

/**
 * Create a new league. Generates a random 6-char uppercase invite code.
 * Writes to /leagues/{leagueId}.
 */
export async function createLeague(name, uid) {
  const inviteCode = generateCode();
  const ref = await addDoc(collection(db, "leagues"), {
    name,
    inviteCode,
    createdBy: uid,
    members: [uid],
    createdAt: serverTimestamp(),
  });
  return { leagueId: ref.id, inviteCode };
}

/**
 * Find a league by its invite code and add the user as a member.
 * Returns the league data or throws if not found.
 */
export async function joinLeagueByCode(code, uid) {
  // Query /leagues where inviteCode matches — anyone authenticated can read leagues
  const q = query(
    collection(db, "leagues"),
    where("inviteCode", "==", code.toUpperCase()),
  );
  const snap = await getDocs(q);

  if (snap.empty)
    throw new Error("Invalid invite code. Check the code and try again.");

  const leagueDoc = snap.docs[0];
  const data = leagueDoc.data();

  if (data.members && data.members.includes(uid)) {
    throw new Error("You are already a member of this league.");
  }

  // Use arrayUnion to safely append uid without overwriting other members
  // arrayUnion is imported from Firestore at the top of db.js
  await updateDoc(doc(db, "leagues", leagueDoc.id), {
    members: arrayUnion(uid),
  });

  return { leagueId: leagueDoc.id, ...data };
}

/**
 * Fetch a single league document by ID.
 */
export async function getLeague(leagueId) {
  const snap = await getDoc(doc(db, "leagues", leagueId));
  return snap.exists() ? { leagueId: snap.id, ...snap.data() } : null;
}

/**
 * Fetch all leagues a user belongs to.
 * Reads /leagues where members array contains uid.
 */
export async function getUserLeagues(uid) {
  const q = query(
    collection(db, "leagues"),
    where("members", "array-contains", uid),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ leagueId: d.id, ...d.data() }));
}

/**
 * Real-time listener for league members' points (leaderboard).
 * Returns unsubscribe. Callback receives sorted array of user objects.
 */
export function onLeagueLeaderboard(memberUids, callback) {
  if (!memberUids || memberUids.length === 0) {
    callback([]);
    return () => {};
  }

  // Listen to entire /users collection — filter to members client-side
  // This avoids the __name__ array query which can be unreliable
  const unsub = onSnapshot(
    collection(db, "users"),
    (snap) => {
      const members = [];
      snap.docs.forEach((d) => {
        // Only include users who are in this league's members array
        if (memberUids.includes(d.id)) {
          members.push({ uid: d.id, ...d.data() });
        }
      });
      // Sort by totalPoints descending
      members.sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0));
      callback(members);
    },
    (err) => {
      console.error("Leaderboard listener error:", err);
      callback([]);
    },
  );

  return unsub;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++)
    code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function chunkArray(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size)
    chunks.push(arr.slice(i, i + size));
  return chunks;
}
