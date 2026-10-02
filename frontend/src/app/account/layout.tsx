import type { ReactNode } from "react";
import { SessionGate } from "@/components/shared/session-gate";

export default function AccountLayout({ children }: { children: ReactNode }) {
  return <SessionGate>{children}</SessionGate>;
}
