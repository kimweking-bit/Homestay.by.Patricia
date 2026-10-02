import { ApiClientError, apiRequest } from "@/services/api-client";

export type SessionUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: "GUEST" | "ADMIN";
  createdAt?: string;
  updatedAt?: string;
};

export type RegisterInput = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
};

export function registerAccount(input: RegisterInput) {
  return apiRequest<SessionUser>("/auth/register", { method: "POST", body: input });
}

export function loginAccount(input: { email: string; password: string }) {
  return apiRequest<SessionUser>("/auth/login", { method: "POST", body: input });
}

export function logoutAccount() {
  return apiRequest<{ ok: true }>("/auth/logout", { method: "POST" });
}

export async function getSession() {
  try {
    return await apiRequest<SessionUser>("/auth/me");
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 401) {
      return null;
    }
    throw error;
  }
}

export function updateProfile(input: { firstName?: string; lastName?: string; phone?: string; email?: string }) {
  return apiRequest<SessionUser>("/me", { method: "PATCH", body: input });
}
