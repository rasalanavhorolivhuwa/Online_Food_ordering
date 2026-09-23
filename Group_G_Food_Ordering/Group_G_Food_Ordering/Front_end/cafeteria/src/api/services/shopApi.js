// ShopController — /api/shops
import { nullIfNotFound, request } from "../http";
import { mapShop } from "../mappers";

export const shopApi = {
  getShops: async () => (await request("/api/shops")).map(mapShop),

  // GET /api/shops/{shopName} — exact name (case-insensitive); null when not found.
  getShopByName: async (name) => {
    const dto = await nullIfNotFound(request(`/api/shops/${encodeURIComponent(name)}`));
    return dto && mapShop(dto);
  },
};
