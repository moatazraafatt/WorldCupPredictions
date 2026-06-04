/**
 * auth.js
 * Handles Firebase Authentication: register, login, logout, auth state.
 * Uses modular Firebase Auth SDK loaded via CDN ESM.
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { firebaseConfig, ADMIN_UID } from "./firebase-config.js";
import { createUserDocument } from "./db.js";

// ─── Initialize Firebase app (singleton) ────────────────────────────────────
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

/**
 * Register a new user with email, password, and display name.
 * Creates the Firestore user document after auth account creation.
 */
export async function register(email, password, displayName) {
  // Creates email/password account in Firebase Auth
  const credential = await createUserWithEmailAndPassword(
    auth,
    email,
    password,
  );
  const user = credential.user;

  // Set display name on the Auth profile
  await updateProfile(user, { displayName });

  // Write initial user document to /users/{uid}
  await createUserDocument(user.uid, { email, displayName });

  return user;
}

/**
 * Sign in with email and password.
 */
export async function login(email, password) {
  // Authenticates against Firebase Auth
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

/**
 * Sign the current user out.
 */
export async function logout() {
  await signOut(auth);
}

/**
 * Returns a promise that resolves with the current user (or null).
 * Useful for one-time auth checks on page load.
 */
export function getCurrentUser() {
  return new Promise((resolve) => {
    // onAuthStateChanged fires once immediately with current state
    const unsub = onAuthStateChanged(auth, (user) => {
      unsub(); // unsubscribe after first emission
      resolve(user);
    });
  });
}

/**
 * Subscribe to auth state changes (for reactive UI updates).
 * Returns the unsubscribe function.
 */
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

/**
 * Check if a given uid is the admin.
 */
export function isAdmin(uid) {
  return uid === ADMIN_UID;
}
