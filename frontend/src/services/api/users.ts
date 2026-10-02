import { apiRequest } from "@/services/api-client";

export type AdminUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: "GUEST" | "ADMIN";
  createdAt: string;
  updatedAt: string;
};

export type AdminUserList = {
  items: AdminUser[];
  page: number;
  pageSize: number;
  total: number;
};

export function listAdminUsers() {
  return apiRequest<AdminUserList>("/admin/users?pageSize=50");
}
