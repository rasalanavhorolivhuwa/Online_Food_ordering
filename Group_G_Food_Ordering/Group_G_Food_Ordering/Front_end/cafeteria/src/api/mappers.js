// Backend DTO -> UI model. Components only ever see the shapes returned here,
// so DTO changes are absorbed in this file.

const ACCENTS = ["#d65d3e", "#c03b2f", "#146e8a", "#174d38", "#7a4bb5"];

export const PAYMENT_METHODS = {
  PAY_NOW: "PAY_NOW",
  PAY_AT_COUNTER: "PAY_AT_COUNTER",
};

export const ORDER_STEPS = ["PENDING", "PREPARING", "READY", "COLLECTED"];

export const STATUS_LABELS = {
  PENDING: "Order received",
  PREPARING: "Being prepared",
  READY: "Ready for collection",
  COLLECTED: "Collected",
  CANCELLED: "Cancelled",
};

// Backend status strings -> the UI's order steps. Unknown values pass through as-is.
const STATUS_ALIASES = {
  ORDER_RECEIVED: "PENDING", ORDER_PLACED: "PENDING", PLACED: "PENDING", NEW: "PENDING", RECEIVED: "PENDING",
  IN_PROGRESS: "PREPARING", PROCESSING: "PREPARING", COOKING: "PREPARING",
  READY_FOR_COLLECTION: "READY", READY_FOR_PICKUP: "READY",
  COMPLETED: "COLLECTED", DELIVERED: "COLLECTED", PICKED_UP: "COLLECTED",
  CANCELED: "CANCELLED",
};
const normaliseStatus = (status) => {
  const key = String(status ?? "PENDING").trim().toUpperCase().replace(/[\s-]+/g, "_");
  return STATUS_ALIASES[key] ?? key;
};

export const statusLabel = (status) =>
  STATUS_LABELS[status] ?? status.charAt(0) + status.slice(1).toLowerCase().replace(/_/g, " ");

// StudentDto { id, studentNumber, firstName, lastName, email, contact, password }
export const mapStudent = (dto) => ({
  id: dto.id,
  email: dto.email,
  studentNumber: dto.studentNumber ?? String(dto.email ?? "").split("@")[0],
  name: [dto.firstName, dto.lastName].filter(Boolean).join(" ") || null,
});

// Login response: either a StudentDto, or { token, student: StudentDto } once JWT is added.
export const mapLogin = (dto) => ({
  token: dto.token ?? dto.accessToken ?? null,
  student: mapStudent(dto.student ?? dto),
});

// ShopDto { id, shopName, status }
export const mapShop = (dto, index = 0) => ({
  id: dto.id,
  name: dto.shopName ?? dto.name,
  description: dto.description ?? "",
  accent: dto.accent ?? ACCENTS[index % ACCENTS.length],
  isOpen: dto.status == null || /^(open|active|available)$/i.test(dto.status),
  prepTime: dto.prepTime ?? "15–20 min",
});

// MenuItemDto { id, name, description, price, availability, shopId, image }
export const mapMenuItem = (dto) => ({
  id: dto.id,
  shopId: dto.shopId ?? null,
  name: dto.name,
  description: dto.description ?? "",
  price: Number(dto.price ?? 0),
  category: dto.category ?? null,
  image: dto.image || null,
  available: dto.availability ?? true,
});

// CartItemDto { id, cartId, menuItemId, quantity, price, itemTotal }
export const mapCartItem = (dto) => ({
  lineId: dto.id,
  cartId: dto.cartId,
  menuItemId: dto.menuItemId,
  quantity: dto.quantity,
  price: Number(dto.price ?? 0),
  itemTotal: Number(dto.itemTotal ?? 0),
});

// OrderDto { id, orderNumber, totalAmount, status, orderDate, studentId }
// No shop, items or payment yet — see withOrderExtras in api/index.js.
export const mapOrder = (dto) => ({
  id: dto.id ?? dto.orderId,
  studentId: dto.studentId ?? null,
  orderNumber: dto.orderNumber ?? String(dto.id ?? dto.orderId),
  status: normaliseStatus(dto.status ?? dto.orderStatus),
  shopId: dto.shopId,
  shopName: dto.shopName ?? "",
  items: (dto.items ?? dto.orderItems ?? []).map((item) => ({
    name: item.name ?? item.menuItemName,
    quantity: item.quantity,
    price: Number(item.price ?? 0),
  })),
  total: Number(dto.total ?? dto.totalAmount ?? 0),
  paymentMethod: dto.paymentMethod ?? null,
  paymentStatus: dto.paymentStatus ?? null,
  // If "pay now" goes through a hosted gateway, the backend returns its redirect URL.
  paymentUrl: dto.paymentUrl ?? null,
  createdAt: dto.createdAt ?? dto.orderDate ?? null,
});

// NotificationDto — not built yet.
export const mapNotification = (dto) => ({
  id: dto.id,
  title: dto.title ?? "Order update",
  message: dto.message ?? "",
  read: dto.read ?? dto.isRead ?? false,
  orderId: dto.orderId ?? null,
  createdAt: dto.createdAt ?? null,
});

// ChatMessageDto — not built yet.
export const mapChatMessage = (dto) => ({
  id: dto.id ?? crypto.randomUUID(),
  role: String(dto.role ?? dto.sender ?? "assistant").toLowerCase() === "user" ? "user" : "assistant",
  content: dto.content ?? dto.message ?? dto.reply ?? "",
  createdAt: dto.createdAt ?? null,
});
