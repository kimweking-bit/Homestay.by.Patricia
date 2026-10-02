import type { BookingStatus } from "@/lib/mock-data";
import { bookingStatusLabel } from "@/lib/status";
import { cn } from "@/lib/cn";

const statusClassName: Record<BookingStatus, string> = {
  PENDING: "status-pending",
  REQUESTED: "status-pending",
  REVIEWING: "status-pending",
  CONFIRMED: "status-confirmed",
  REJECTED: "status-rejected",
  DECLINED: "status-rejected",
  CANCELLED: "status-cancelled",
};

export function StatusBadge({ status }: { status: BookingStatus }) {
  return <span className={cn("status-badge", statusClassName[status])}>{bookingStatusLabel[status]}</span>;
}
