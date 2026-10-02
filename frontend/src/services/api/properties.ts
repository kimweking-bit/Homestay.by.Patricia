import { properties as localCatalog, type Property } from "@/lib/mock-data";
import { apiRequest } from "@/services/api-client";

export type PropertyList = {
  items: Property[];
  page: number;
  pageSize: number;
  total: number;
};

export type AvailabilityResponse = {
  propertyId: string;
  blockedDates: string[];
  hostBlockedDates: string[];
  confirmedRanges: Array<{ reference: string; start: string; end: string }>;
  openRequests: Array<{ reference: string; status: string; guestName: string; start: string; end: string }>;
};

export function listProperties() {
  return apiRequest<PropertyList>("/properties?pageSize=50");
}

export async function loadPublishedProperties() {
  try {
    const { items } = await listProperties();
    if (items.length > 0) {
      return items;
    }
  } catch {
    // Keep the local Cloudinary catalog available when the API is down.
  }
  return localCatalog;
}

export function getProperty(idOrSlug: string) {
  return apiRequest<Property>(`/properties/${encodeURIComponent(idOrSlug)}`);
}

export function listAdminProperties() {
  return apiRequest<PropertyList>("/admin/properties?pageSize=50");
}

export function archiveProperty(idOrSlug: string) {
  return apiRequest<Property>(`/admin/properties/${encodeURIComponent(idOrSlug)}`, { method: "DELETE" });
}

export function getAvailability(idOrSlug: string) {
  return apiRequest<AvailabilityResponse>(`/properties/${encodeURIComponent(idOrSlug)}/availability`);
}

export function getAdminAvailability(idOrSlug: string) {
  return apiRequest<AvailabilityResponse>(`/admin/properties/${encodeURIComponent(idOrSlug)}/availability`);
}

export function blockDate(idOrSlug: string, date: string) {
  return apiRequest(`/admin/properties/${idOrSlug}/blocks`, { method: "POST", body: { date } });
}

export function unblockDate(idOrSlug: string, date: string) {
  return apiRequest(`/admin/properties/${idOrSlug}/blocks/${date}`, { method: "DELETE" });
}
