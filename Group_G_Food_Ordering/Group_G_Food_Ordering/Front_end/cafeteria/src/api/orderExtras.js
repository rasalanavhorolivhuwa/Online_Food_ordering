// OrderDto has no shop, items or payment method yet (payment is mock-only), so the
// app remembers them per order in this browser and merges them back in.
// Once the backend returns them, the backend values win.
const KEY = "univen-eats-order-extras";

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? {};
  } catch {
    return {};
  }
}

export function rememberOrder(orderId, { shopId, shopName, cart, paymentMethod }) {
  const all = load();
  all[orderId] = {
    shopId,
    shopName,
    paymentMethod,
    items: cart.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price })),
  };
  try {
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    // Storage unavailable — the order still works, just without these details.
  }
}

export function withOrderExtras(order) {
  const extra = load()[order.id];
  if (!extra) return order;
  const paymentMethod = order.paymentMethod ?? extra.paymentMethod ?? null;
  return {
    ...order,
    shopId: order.shopId ?? extra.shopId,
    shopName: order.shopName || extra.shopName || "",
    items: order.items.length ? order.items : extra.items,
    paymentMethod,
    paymentStatus: order.paymentStatus ?? (paymentMethod === "PAY_NOW" ? "PAID" : paymentMethod ? "UNPAID" : null),
  };
}
