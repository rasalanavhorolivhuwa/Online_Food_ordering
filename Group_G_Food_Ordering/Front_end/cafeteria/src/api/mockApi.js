// In-browser stand-in for the backend. Returns DTO-shaped objects and runs them
// through the same mappers as the real API, with the same function signatures.
import { DEV_STUDENT_ID } from "./config";
import { ApiError } from "./http";
import {
  mapCartItem,
  mapChatMessage,
  mapLogin,
  mapMenuItem,
  mapNotification,
  mapOrder,
  mapShop,
  mapStudent,
  ORDER_STEPS,
  statusLabel,
} from "./mappers";

const title = (s) => String(s).replace(/(^|\s)\w/g, (c) => c.toUpperCase());
import { menus, shops } from "./mockData";

const STORE_KEY = "univen-eats-mock";
const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

function load() {
  try {
    return JSON.parse(sessionStorage.getItem(STORE_KEY)) ?? {};
  } catch {
    return {};
  }
}
const db = { orders: [], cartItems: [], readNotifications: [], chat: [], nextOrder: 1041, nextLine: 1, ...load() };
function persist() {
  try {
    sessionStorage.setItem(STORE_KEY, JSON.stringify(db));
  } catch {
    // ignore
  }
}

const allItems = () => Object.values(menus).flat();
const findItem = (id) => allItems().find((item) => item.id === id);


export const mockApi = {
  async login({ email, password }) {
    await delay();
    if (!/^\d+@mvula\.univen\.ac\.za$/.test(email))
      throw new ApiError("Only UNIVEN student emails can sign in.", 401);
    if (password.length < 6) throw new ApiError("Incorrect email or password.", 401);
    return mapLogin({ id: DEV_STUDENT_ID, email, studentNumber: email.split("@")[0] });
  },

  async getStudent(id) {
    await delay();
    return mapStudent({ id, studentNumber: "12345678", email: "12345678@mvula.univen.ac.za" });
  },

  async getShops() {
    await delay();
    return shops.map(mapShop);
  },

  async getShopByName(name) {
    await delay(150);
    const dto = shops.find((s) => s.shopName.toLowerCase() === name.toLowerCase());
    return dto ? mapShop(dto) : null;
  },

  async getMenuItems() {
    await delay();
    return allItems().map(mapMenuItem);
  },

  async getMenuItemByName(name) {
    await delay(150);
    const dto = allItems().find((i) => i.name.toLowerCase() === name.toLowerCase());
    return dto ? mapMenuItem(dto) : null;
  },

  // ---- Cart (mirrors CartController + CartItemController) ----
  async getCart() {
    await delay(150);
    return { cartId: "mock-cart", items: db.cartItems.map(mapCartItem) };
  },

  async addCartItem(cartId, menuItemId, quantity) {
    await delay(150);
    const price = findItem(menuItemId)?.price ?? 0;
    const dto = { id: db.nextLine++, cartId, menuItemId, quantity, price, itemTotal: price * quantity };
    db.cartItems.push(dto);
    persist();
    return mapCartItem(dto);
  },

  async updateCartItem(line, quantity) {
    await delay(150);
    const dto = db.cartItems.find((c) => c.id === line.lineId);
    if (!dto) throw new ApiError("Cart item not found.", 404);
    Object.assign(dto, { quantity, itemTotal: dto.price * quantity });
    persist();
    return mapCartItem(dto);
  },

  async removeCartItem(lineId) {
    await delay(150);
    db.cartItems = db.cartItems.filter((c) => c.id !== lineId);
    persist();
  },

  async getCartTotal() {
    await delay(100);
    return db.cartItems.reduce((sum, c) => sum + c.itemTotal, 0);
  },

  // ---- Orders ----
  async placeOrder({ shopId, shopName, cart, paymentMethod }) {
    await delay(500);
    const dto = {
      id: `o-${db.nextOrder++}`,
      orderNumber: `ORD-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      status: "ORDER RECEIVED",
      shopId,
      shopName,
      paymentMethod,
      paymentStatus: paymentMethod === "PAY_NOW" ? "PAID" : "UNPAID",
      items: cart.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price })),
      total: cart.reduce((sum, i) => sum + i.price * i.quantity, 0),
      createdAt: new Date().toISOString(),
    };
    db.orders.unshift(dto);
    persist();
    return mapOrder(dto);
  },

  async getOrder(orderId) {
    await delay(200);
    const dto = db.orders.find((o) => o.id === orderId);
    if (!dto) throw new ApiError("Order not found.", 404);
    return mapOrder(dto);
  },

  // Same transitions as OrderServiceImpl.updateOrderStatus.
  async updateOrderStatus(orderId, status) {
    await delay(200);
    const dto = db.orders.find((o) => o.id === orderId);
    if (!dto) throw new ApiError("Order not found.", 404);
    const required = { PREPARING: "ORDER RECEIVED", READY_FOR_COLLECTION: "PREPARING", COLLECTED: "READY_FOR_COLLECTION" };
    if (status === "CANCELLED" ? dto.status === "COLLECTED" : dto.status !== required[status])
      throw new ApiError(`Can't move order from ${dto.status} to ${status}`, 500);
    dto.status = status;
    persist();
    return mapOrder(dto);
  },

  cancelOrder(orderId) {
    return mockApi.updateOrderStatus(orderId, "CANCELLED");
  },

  async getMyOrders() {
    await delay();
    return db.orders.map((o) => mapOrder(o));
  },

  // One notification per status an order has reached. getOrders is the app's
  // order source (live or mock), so this also works against the real backend.
  async getNotifications(studentId, getOrders) {
    const orders = await getOrders();
    const where = (o) => (o.shopName ? title(o.shopName) : "the shop");
    const messages = {
      PENDING: (o) => `We received your order${o.shopName ? ` at ${where(o)}` : ""}.`,
      PREPARING: (o) => `${o.shopName ? where(o) : "The shop"} has started preparing your order.`,
      READY: (o) =>
        `Your order is ready. Collect it at ${where(o)}${o.paymentMethod === "PAY_AT_COUNTER" ? ` and pay R${o.total.toFixed(2)} at the counter` : ""}.`,
      CANCELLED: () => "This order was cancelled and won't be prepared.",
    };
    const reached = (status) =>
      status === "CANCELLED" ? ["PENDING", "CANCELLED"] : ORDER_STEPS.slice(0, ORDER_STEPS.indexOf(status) + 1);
    return orders
      .flatMap((order) =>
        reached(order.status)
          .filter((status) => messages[status])
          .map((status, i) => ({
            id: `${order.id}-${status}`,
            title: `${order.orderNumber}: ${statusLabel(status)}`,
            message: messages[status](order),
            orderId: order.id,
            read: db.readNotifications.includes(`${order.id}-${status}`),
            createdAt: new Date(new Date(order.createdAt ?? Date.now()).getTime() + i * 1000).toISOString(),
          })),
      )
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map(mapNotification);
  },

  async markNotificationRead(id) {
    if (!db.readNotifications.includes(id)) db.readNotifications.push(id);
    persist();
  },

  // ---- AI assistant ----
  async getAssistantHistory() {
    await delay(200);
    return db.chat.map(mapChatMessage);
  },

  // replyFn: the offline assistant brain (see assistantBrain.js).
  async askAssistant(studentId, message, replyFn) {
    const now = () => new Date().toISOString();
    db.chat.push({ id: crypto.randomUUID(), role: "user", content: message, createdAt: now() });
    const [content] = await Promise.all([replyFn(message), delay(500)]);
    const reply = { id: crypto.randomUUID(), role: "assistant", content, createdAt: now() };
    db.chat.push(reply);
    persist();
    return mapChatMessage(reply);
  },
};
