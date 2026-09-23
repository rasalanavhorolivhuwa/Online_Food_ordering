// OrderController — /api/orders
import { request } from "../http";
import { mapOrder } from "../mappers";

const getHistory = async (studentId) =>
  (await request(`/api/orders/${studentId}/history`)).map(mapOrder);

export const orderApi = {
  // POST /api/orders/{studentId} — the backend builds the order from the student's cart.
  placeOrder: async ({ studentId }) =>
    mapOrder(await request(`/api/orders/${studentId}`, { method: "POST" })),

  // GET /api/orders/{id}. Currently clashes with GET {orderNumber} ("Ambiguous handler
  // methods"), so fall back to finding the order in the student's history.
  async getOrder(orderId, studentId) {
    try {
      return mapOrder(await request(`/api/orders/${orderId}`));
    } catch (err) {
      if (err.status !== 500 || studentId == null) throw err;
      const order = (await getHistory(studentId)).find((o) => String(o.id) === String(orderId));
      if (!order) throw err;
      return order;
    }
  },

  // PUT /api/orders/{id}/status?status=… — the backend enforces the allowed order:
  // ORDER RECEIVED → PREPARING → READY_FOR_COLLECTION → COLLECTED, or CANCELLED.
  updateOrderStatus: async (orderId, status) =>
    mapOrder(await request(`/api/orders/${orderId}/status?status=${encodeURIComponent(status)}`, { method: "PUT" })),

  cancelOrder: (orderId) => orderApi.updateOrderStatus(orderId, "CANCELLED"),

  // GET /api/orders/{studentId}/history
  getMyOrders: getHistory,
};
