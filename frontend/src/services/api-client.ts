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

export async function apiRequest<TResponse>(
  path: string,
  { body, headers, ...init }: RequestOptions = {},
): Promise<TResponse> {
  const response = await fetch(`${env.apiUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const data = response.headers.get("content-type")?.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok) {
    throw new ApiClientError("API request failed", response.status, data as ApiErrorResponse);
  }

  return data as TResponse;
}
