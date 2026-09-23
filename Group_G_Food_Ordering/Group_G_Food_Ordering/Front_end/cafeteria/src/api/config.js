// Leave empty to call same-origin /api/* (Vite proxies it to the backend in dev).
// Set VITE_API_URL=http://localhost:8080 to call the backend directly (needs CORS).
export const API_BASE_URL = import.meta.env.VITE_API_URL ?? "";

// Features served by the real backend; the rest use in-browser mock data until
// their controllers exist. e.g. VITE_LIVE=shops,menu,cart  or  VITE_LIVE=all
export const FEATURES = ["auth", "shops", "menu", "cart", "orders", "notifications", "assistant"];
const live = (import.meta.env.VITE_LIVE ?? "").split(",").map((s) => s.trim()).filter(Boolean);
export const isLive = (feature) => live.includes("all") || live.includes(feature);

// Demo only: after an order is placed, the app itself moves it to PREPARING and then
// READY_FOR_COLLECTION every N seconds (standing in for the shop). 0 turns it off.
export const DEMO_STATUS_SECONDS = Number(import.meta.env.VITE_DEMO_STATUS_SECONDS ?? 5);

// While auth is mocked, the signed-in student is this backend student id.
export const DEV_STUDENT_ID = Number(import.meta.env.VITE_DEV_STUDENT_ID ?? 2);
