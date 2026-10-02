import { SignJWT, jwtVerify } from "jose";
import type { Role } from "@prisma/client";

export type SessionClaims = {
  userId: string;
  role: Role;
};

export async function signSession(userId: string, role: Role, secret: string, ttl = "7d") {
  return new SignJWT({ role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(ttl)
    .sign(new TextEncoder().encode(secret));
}

export async function readSession(token: string, secret: string): Promise<SessionClaims | null> {
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    if (typeof payload.sub !== "string" || (payload.role !== "GUEST" && payload.role !== "ADMIN")) {
      return null;
    }
    return { userId: payload.sub, role: payload.role };
  } catch {
    return null;
  }
}
