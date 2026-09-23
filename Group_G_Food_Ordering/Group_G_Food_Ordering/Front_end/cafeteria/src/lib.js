import { useEffect, useRef } from "react";

export const money = (value) => `R${Number(value).toFixed(2)}`;

export const formatTime = (iso) =>
  iso ? new Date(iso).toLocaleString(undefined, { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" }) : "";

// Re-runs fn whenever the app changes an order (see autoAdvance in api/index.js).
export function useOrderUpdates(fn) {
  const saved = useRef(fn);
  saved.current = fn;
  useEffect(() => {
    const handler = () => saved.current();
    window.addEventListener("order-updated", handler);
    return () => window.removeEventListener("order-updated", handler);
  }, []);
}

// Calls fn immediately, then every intervalMs while enabled.
export function usePolling(fn, intervalMs, enabled = true) {
  const saved = useRef(fn);
  saved.current = fn;
  useEffect(() => {
    if (!enabled) return undefined;
    saved.current();
    const id = setInterval(() => saved.current(), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs, enabled]);
}
