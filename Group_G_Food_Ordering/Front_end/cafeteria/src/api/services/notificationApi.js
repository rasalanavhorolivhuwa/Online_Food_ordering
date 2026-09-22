// Proposed NotificationController — /api/notifications (not built yet)
import { request } from "../http";
import { mapNotification } from "../mappers";

export const notificationApi = {
  getNotifications: async (studentId) =>
    (await request(`/api/notifications/student/${studentId}`)).map(mapNotification),

  markNotificationRead: (id) => request(`/api/notifications/${id}/read`, { method: "PUT" }),
};
