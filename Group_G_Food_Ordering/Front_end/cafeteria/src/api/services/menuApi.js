// MenuItemController — /api/menu-items
import { nullIfNotFound, request } from "../http";
import { mapMenuItem } from "../mappers";

export const menuApi = {
  // Returns every shop's items; the UI filters by shopId.
  getMenuItems: async () => (await request("/api/menu-items")).map(mapMenuItem),

  // GET /api/menu-items/{name} — exact name (case-insensitive); null when not found.
  getMenuItemByName: async (name) => {
    const dto = await nullIfNotFound(request(`/api/menu-items/${encodeURIComponent(name)}`));
    return dto && mapMenuItem(dto);
  },
};
