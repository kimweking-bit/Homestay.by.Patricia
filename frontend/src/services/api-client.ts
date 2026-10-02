import { env } from "@/lib/env";
import type { ApiErrorResponse } from "@/types/api";

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly details?: ApiErrorResponse,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

export function apiErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiClientError) {
    const message = error.details?.message;
    if (Array.isArray(message) && message.length > 0) {
      return message.join(" ");
    }
    if (typeof message === "string" && message.trim() && message !== "Internal server error") {
      return message;
    }
    if (error.status === 401) {
      return "Sign in to continue.";
    }
    if (error.status === 409) {
      return "Those dates are not available.";
    }
  }
  return fallback;
}

export async function apiRequest<TResponse>(
  path: string,
  { body, headers, credentials, ...init }: RequestOptions = {},
): Promise<TResponse> {
  const response = await fetch(`${env.apiUrl}${path}`, {
    ...init,
    cache: init.cache ?? "no-store",
    credentials: credentials ?? "include",
    headers: {
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const data = response.headers.get("content-type")?.includes("application/json") ? await response.json() : null;

  if (!response.ok) {
    throw new ApiClientError("API request failed", response.status, data as ApiErrorResponse);
  }

  return data as TResponse;
}
