import { createAssistantBrain } from "./assistantBrain";
import { DEMO_STATUS_SECONDS, FEATURES, isLive } from "./config";
import { mockApi } from "./mockApi";
import { rememberOrder, withOrderExtras } from "./orderExtras";
import { assistantApi } from "./services/assistantApi";
import { cartApi } from "./services/cartApi";
import { menuApi } from "./services/menuApi";
import { notificationApi } from "./services/notificationApi";
import { orderApi } from "./services/orderApi";
import { shopApi } from "./services/shopApi";
import { studentApi } from "./services/studentApi";
import { clearSession, loadSession, saveSession } from "./session";

// Each feature uses its real service or the mock, per VITE_LIVE.
const use = (feature, service) =>
  isLive(feature)
    ? service
    : Object.fromEntries(Object.keys(service).map((name) => [name, mockApi[name]]));

const backend = {
  ...use("auth", studentApi),
  ...use("shops", shopApi),
  ...use("menu", menuApi),
  ...use("cart", cartApi),
  ...use("orders", orderApi),
  ...use("notifications", notificationApi),
  ...use("assistant", assistantApi),
};

export const MOCKED_FEATURES = FEATURES.filter((f) => !isLive(f));

const studentId = () => loadSession()?.student?.id;

// Offline assistant that answers from the same shops/menu/cart/orders the app uses.
const brain = createAssistantBrain({
  getShops: backend.getShops,
  getMenuItems: backend.getMenuItems,
  getMyOrders: () => getMyOrders(),
  getCart: () => backend.getCart(studentId()),
});

// Demo stand-in for the shop: advance a new order step by step. Stops quietly if
// the backend refuses a step (e.g. the student cancelled in between).
function autoAdvance(orderId) {
  if (!DEMO_STATUS_SECONDS) return;
  const steps = ["PREPARING", "READY_FOR_COLLECTION"];
  const next = (i) =>
    i < steps.length &&
    setTimeout(() => {
      backend.updateOrderStatus(orderId, steps[i]).then(() => {
        window.dispatchEvent(new CustomEvent("order-updated", { detail: orderId }));
        next(i + 1);
      }, () => {});
    }, DEMO_STATUS_SECONDS * 1000);
  next(0);
}

const newestFirst = (a, b) => String(b.createdAt ?? "").localeCompare(String(a.createdAt ?? ""));
const getMyOrders = async () => (await backend.getMyOrders(studentId())).map(withOrderExtras).sort(newestFirst);

export const api = {
  ...backend,
  async placeOrder(args) {
    const order = await backend.placeOrder(args);
    rememberOrder(order.id, args);
    autoAdvance(order.id);
    return withOrderExtras(order);
  },
  getOrder: async (orderId) => withOrderExtras(await backend.getOrder(orderId, studentId())),
  cancelOrder: async (orderId) => withOrderExtras(await backend.cancelOrder(orderId)),
  getMyOrders,
  // Until a notifications controller exists, notifications are derived from order statuses.
  getNotifications: () =>
    isLive("notifications")
      ? backend.getNotifications(studentId())
      : mockApi.getNotifications(studentId(), getMyOrders),
  askAssistant: (message) =>
    isLive("assistant")
      ? backend.askAssistant(studentId(), message)
      : mockApi.askAssistant(studentId(), message, brain.reply),
  getAssistantHistory: () => backend.getAssistantHistory(studentId()),
  async login(credentials) {
    const { token, student } = await backend.login(credentials);
    saveSession({ token, student });
    return student;
  },
  logout: clearSession,
  currentStudent: () => loadSession()?.student ?? null,
};

export * from "./mappers";
