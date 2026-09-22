import { API_BASE_URL } from "./config";
import { clearSession, loadSession } from "./session";

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

const IDEMPOTENT = ["GET", "PUT", "DELETE"];

// For lookups where "not found" is a normal answer. The backend currently
// reports not-found as a 500 (RuntimeException), so treat both as null.
export const nullIfNotFound = (promise) =>
  promise.catch((err) => {
    if (err.status === 404 || err.status === 500) return null;
    throw err;
  });

export async function request(path, { method = "GET", body } = {}, attempt = 1) {
  const token = loadSession()?.token;
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    if (attempt === 1 && IDEMPOTENT.includes(method)) return request(path, { method, body }, 2);
    throw new ApiError("Can't reach the server. Check your connection.", 0);
  }

  const text = await response.text();
  // An empty 5xx is a dropped connection (e.g. the dev proxy/tunnel), not a backend error: retry once.
  if (!text && response.status >= 500 && attempt === 1 && IDEMPOTENT.includes(method)) {
    return request(path, { method, body }, 2);
  }
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (response.status === 401 && token) {
    clearSession();
    window.dispatchEvent(new Event("auth-expired"));
  }
  if (!response.ok) {
    // Spring's default error body often has an empty "message"; the RuntimeException
    // text ("Cannot place order because cart is empty") is on the first line of "trace".
    const fromTrace = typeof data?.trace === "string" && data.trace.match(/Exception: ([^\r\n]+)/)?.[1];
    const message =
      (typeof data === "string" && data) || data?.message || fromTrace || data?.error || `Request failed (${response.status})`;
    throw new ApiError(message, response.status);
  }
  return data;
}
