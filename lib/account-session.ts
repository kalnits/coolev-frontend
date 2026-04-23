import type { AccountSession, RegisterSitterResponse } from "./types";

const SESSION_KEY = "coolev_account_session";
const PROFILE_KEY = "coolev_sitter_profile";

export function readAccountSession(): AccountSession | null {
  if (typeof window === "undefined" || typeof window.localStorage?.getItem !== "function") return null;
  const rawValue = window.localStorage.getItem(SESSION_KEY);
  if (!rawValue) return null;
  try {
    return JSON.parse(rawValue) as AccountSession;
  } catch {
    return null;
  }
}

export function writeAccountSession(session: AccountSession) {
  if (typeof window === "undefined" || typeof window.localStorage?.setItem !== "function") return;
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearAccountSession() {
  if (typeof window === "undefined" || typeof window.localStorage?.removeItem !== "function") return;
  window.localStorage.removeItem(SESSION_KEY);
  window.localStorage.removeItem(PROFILE_KEY);
}

export function readSitterProfile(): RegisterSitterResponse["profile"] | null {
  if (typeof window === "undefined" || typeof window.localStorage?.getItem !== "function") return null;
  const rawValue = window.localStorage.getItem(PROFILE_KEY);
  if (!rawValue) return null;
  try {
    return JSON.parse(rawValue) as RegisterSitterResponse["profile"];
  } catch {
    return null;
  }
}

export function writeSitterProfile(profile: RegisterSitterResponse["profile"]) {
  if (typeof window === "undefined" || typeof window.localStorage?.setItem !== "function") return;
  window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}
