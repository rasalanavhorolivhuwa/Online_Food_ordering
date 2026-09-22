// CartController — /api/carts, CartItemController — /api/cart-items
import { request } from "../http";
import { mapCartItem } from "../mappers";

export const cartApi = {
  // GET the student's cart, or POST one if they don't have it yet.
  async getCart(studentId) {
    let cart = null;
    try {
      cart = await request(`/api/carts/${studentId}`);
    } catch (err) {
      // "Cart not found" currently surfaces as a 500 (RuntimeException), or 404 once handled.
      if (err.status !== 404 && err.status !== 500) throw err;
    }
    if (!cart) cart = await request(`/api/carts/${studentId}`, { method: "POST" });
    const items = await request(`/api/cart-items/${cart.id}`);
    return { cartId: cart.id, items: items.map(mapCartItem) };
  },

  addCartItem: async (cartId, menuItemId, quantity) =>
    mapCartItem(await request("/api/cart-items", { method: "POST", body: { cartId, menuItemId, quantity } })),

  updateCartItem: async (line, quantity) =>
    mapCartItem(
      await request(`/api/cart-items/${line.lineId}`, {
        method: "PUT",
        body: { id: line.lineId, cartId: line.cartId, menuItemId: line.menuItemId, quantity },
      }),
    ),

  removeCartItem: (lineId) => request(`/api/cart-items/${lineId}`, { method: "DELETE" }),

  // Needs the controller fix: @GetMapping("{cartId}/total")
  getCartTotal: async (cartId) => Number(await request(`/api/cart-items/${cartId}/total`)),
};
