function trimTrailingSlash(value: string) {
  return value.replace(/\/$/, "");
}

function resolveApiUrl() {
  if (typeof window === "undefined") {
    return trimTrailingSlash(process.env.API_INTERNAL_URL?.trim() || "http://127.0.0.1:4000/api/v1");
  }

  const publicUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (publicUrl) {
    return trimTrailingSlash(publicUrl);
  }

  return "/api/v1";
}

export const env = {
  get apiUrl() {
    return resolveApiUrl();
  },
} as const;
