import { apiClient } from "./apiClient";
import { clearSession, getStoredSession, saveSession } from "./storage";

const SUPABASE_SIGNUP_ENDPOINT = "/auth/v1/signup";
const SUPABASE_TOKEN_ENDPOINT = "/auth/v1/token";

function mapSessionPayload(payload) {
  if (!payload) return null;
  return {
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token,
    expiresIn: payload.expires_in,
    expiresAt: payload.expires_at,
    tokenType: payload.token_type,
    user: payload.user,
  };
}

export async function signUp({ email, password, fullName }) {
  const payload = await apiClient.post(
    SUPABASE_SIGNUP_ENDPOINT,
    {
      email,
      password,
      data: {
        full_name: fullName,
      },
    },
    { skipAuth: true }
  );
  const session = mapSessionPayload(payload);
  saveSession(session);
  return session;
}

export async function signIn({ email, password }) {
  const payload = await apiClient.post(
    `${SUPABASE_TOKEN_ENDPOINT}?grant_type=password`,
    { email, password },
    { skipAuth: true }
  );
  const session = mapSessionPayload(payload);
  saveSession(session);
  return session;
}

export async function refreshSession() {
  const stored = getStoredSession();
  if (!stored?.refreshToken) {
    throw new Error("No refresh token available");
  }
  const payload = await apiClient.post(
    `${SUPABASE_TOKEN_ENDPOINT}?grant_type=refresh_token`,
    { refresh_token: stored.refreshToken },
    { skipAuth: true }
  );
  const session = mapSessionPayload(payload);
  saveSession(session);
  return session;
}

export function loadSession() {
  return getStoredSession();
}

export function signOut() {
  clearSession();
}



