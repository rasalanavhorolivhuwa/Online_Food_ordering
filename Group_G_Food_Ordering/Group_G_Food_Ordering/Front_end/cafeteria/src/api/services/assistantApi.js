// Proposed AssistantController — /api/assistant (not built yet)
import { request } from "../http";
import { mapChatMessage } from "../mappers";

export const assistantApi = {
  askAssistant: async (studentId, message) =>
    mapChatMessage(await request("/api/assistant/chat", { method: "POST", body: { studentId, message } })),

  getAssistantHistory: async (studentId) =>
    (await request(`/api/assistant/history/${studentId}`)).map(mapChatMessage),
};
