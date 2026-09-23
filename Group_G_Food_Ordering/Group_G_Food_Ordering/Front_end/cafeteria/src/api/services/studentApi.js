// StudentController — /api/students (+ proposed /api/auth/login, not built yet)
import { request } from "../http";
import { mapLogin, mapStudent } from "../mappers";

export const studentApi = {
  getStudent: async (id) => mapStudent(await request(`/api/students/${id}`)),

  // Proposed: should return the StudentDto (without password), or { token, student }.
  login: async ({ email, password }) =>
    mapLogin(await request("/api/auth/login", { method: "POST", body: { email, password } })),
};
