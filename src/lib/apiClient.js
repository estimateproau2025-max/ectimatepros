import { getStoredSession, clearSession } from "./storage";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://esitmatebackend.vercel.app/api";

let redirectingDueToAuth = false;

async function request(path, options = {}) {
  const {
    method = "GET",
    data,
    headers = {},
    skipAuth = false,
    signal,
  } = options;

  const finalHeaders = new Headers(headers);
  const isFormData = data instanceof FormData;

  if (data && !isFormData && !finalHeaders.has("Content-Type")) {
    finalHeaders.set("Content-Type", "application/json");
  }

  if (!skipAuth) {
    const session = getStoredSession();
    if (session?.accessToken) {
      finalHeaders.set("Authorization", `Bearer ${session.accessToken}`);
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: finalHeaders,
    body: data
      ? isFormData
        ? data
        : JSON.stringify(data)
      : undefined,
    signal,
  });

  const isJson =
    response.headers.get("Content-Type")?.includes("application/json");
  const payload = isJson ? await response.json() : null;

  if (!response.ok) {
    const message =
      payload?.message ||
      payload?.error_description ||
      payload?.error ||
      "Request failed";

    if (response.status === 401 && !skipAuth) {
      clearSession();
      window.dispatchEvent(new CustomEvent("estimatepro:session-expired"));
      if (!redirectingDueToAuth && window.location.pathname !== "/auth") {
        redirectingDueToAuth = true;
        window.location.replace("/auth");
      }
    }

    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return payload;
}

export const apiClient = {
  get: (path, options = {}) => request(path, { ...options, method: "GET" }),
  post: (path, data, options = {}) =>
    request(path, { ...options, method: "POST", data }),
  put: (path, data, options = {}) =>
    request(path, { ...options, method: "PUT", data }),
  patch: (path, data, options = {}) =>
    request(path, { ...options, method: "PATCH", data }),
  delete: (path, options = {}) =>
    request(path, { ...options, method: "DELETE" }),
};



