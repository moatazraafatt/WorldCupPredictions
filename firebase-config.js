/**
 * FIRESTORE SECURITY RULES
 * Copy these into your Firebase Console → Firestore → Rules
 *
 * rules_version = '2';
 * service cloud.firestore {
 *   match /databases/{database}/documents {
 *
 *     // Users can read any user doc (for leaderboards), write only their own
 *     match /users/{uid} {
 *       allow read: if request.auth != null;
 *       allow write: if request.auth != null &&
 *         (request.auth.uid == uid ||
 *          request.auth.uid == "4DqTxaOzddblKgsJy63f4oyw3es1");
 *
 *       // Predictions sub-collection: user owns their own; admin can update pointsEarned
 *       match /predictions/{matchId} {
 *         allow read: if request.auth != null;
 *         allow write: if request.auth != null &&
 *           (request.auth.uid == uid ||
 *            request.auth.uid == "4DqTxaOzddblKgsJy63f4oyw3es1");
 *       }
 *
 *       // Tournament picks: user owns their own; admin can update bonusEarned
 *       match /tournamentPicks/{docId} {
 *         allow read: if request.auth != null;
 *         allow write: if request.auth != null &&
 *           (request.auth.uid == uid ||
 *            request.auth.uid == "4DqTxaOzddblKgsJy63f4oyw3es1");
 *       }
 *     }
 *
 *     // Matches: anyone authenticated can read; only admin writes
 *     match /matches/{matchId} {
 *       allow read: if request.auth != null;
 *       allow write: if request.auth != null && request.auth.uid == "4DqTxaOzddblKgsJy63f4oyw3es1";
 *     }
 *
 *     // groupStandings: admin only writes, anyone reads
 *     match /groupStandings/{group} {
 *       allow read: if request.auth != null;
 *       allow write: if request.auth != null && request.auth.uid == "4DqTxaOzddblKgsJy63f4oyw3es1";
 *     }
 *
 *     // Third-place qualifiers: anyone authenticated can read; only admin writes
 *     match /thirdPlaceQualifiers/{docId} {
 *       allow read: if request.auth != null;
 *       allow write: if request.auth != null && request.auth.uid == "4DqTxaOzddblKgsJy63f4oyw3es1";
 *     }
 *
 *     // Tournament champion: anyone authenticated can read; only admin writes
 *     match /tournament/{docId} {
 *       allow read: if request.auth != null;
 *       allow write: if request.auth != null && request.auth.uid == "4DqTxaOzddblKgsJy63f4oyw3es1";
 *     }
 *
 *     // Leagues: authenticated users can read/create.
 *     // Any authenticated user can UPDATE to join (the app uses arrayUnion to add only themselves).
 *     match /leagues/{leagueId} {
 *       allow read: if request.auth != null;
 *       allow create: if request.auth != null;
 *       allow update: if request.auth != null;
 *       allow delete: if request.auth != null &&
 *         (request.auth.uid == resource.data.createdBy ||
 *          request.auth.uid == "4DqTxaOzddblKgsJy63f4oyw3es1");
 *     }
 *   }
 * }
 */

// ─── PASTE YOUR FIREBASE PROJECT CONFIG HERE ───────────────────────────────
export const firebaseConfig = {
  apiKey: "AIzaSyB9oTrDJ1yGxAGc7n1yHnkUP885RfX6T9Q",
  authDomain: "wc2026-76d7d.firebaseapp.com",
  projectId: "wc2026-76d7d",
  storageBucket: "wc2026-76d7d.firebasestorage.app",
  messagingSenderId: "181978723751",
  appId: "1:181978723751:web:0135a3b58ce4a39e633282",
  measurementId: "G-WDNNM9KTHD",
};

// ─── REPLACE WITH YOUR OWN FIREBASE AUTH UID ────────────────────────────────
// Find this in Firebase Console → Authentication → Users → copy UID
export const ADMIN_UID = "4DqTxaOzddblKgsJy63f4oyw3es1";

// ─── SCORING TABLE ───────────────────────────────────────────────────────────
export const POINTS = {
  group: 2,
  r32: 3,
  r16: 4,
  qf: 5,
  sf: 6,
  third_place: 6,
  final: 8,
};

// ─── TOURNAMENT PICK BONUS ───────────────────────────────────────────────────
export const PICK_BONUS = [10, 7, 5, 3]; // index 0 = 1st pick

// ─── PREDICTION LOCK WINDOW (ms before match) ────────────────────────────────
export const LOCK_BEFORE_MS = 15 * 60 * 1000; // 15 minutes
