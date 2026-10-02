"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { apiErrorMessage } from "@/services/api-client";
import { listAdminBookings, updateBookingStatus, type ApiBookingStatus } from "@/services/api/bookings";

export default function AdminBookingsPage() {
  const queryClient = useQueryClient();
  const bookings = useQuery({ queryKey: ["admin-bookings"], queryFn: listAdminBookings });
  const mutation = useMutation({
    mutationFn: ({ reference, status }: { reference: string; status: ApiBookingStatus }) =>
      updateBookingStatus(reference, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-bookings"] }),
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Reservations</h1>
      <p className="type-small mt-1 text-[var(--muted)]">Review and update guest booking requests.</p>
      {mutation.isError ? (
        <p className="mt-4 text-[var(--color-danger)]" role="alert">
          {apiErrorMessage(mutation.error, "The reservation could not be updated.")}
        </p>
      ) : null}
      {bookings.isPending ? <p className="mt-8" role="status">Loading reservations...</p> : null}
      {bookings.isError ? (
        <p className="mt-8 text-[var(--color-danger)]" role="alert">
          {apiErrorMessage(bookings.error, "Reservations could not be loaded.")}
        </p>
      ) : null}
      {bookings.isSuccess && bookings.data.items.length === 0 ? (
        <p className="mt-8 border-t border-[var(--border)] pt-4 text-[var(--muted)]">No booking requests yet.</p>
      ) : null}

      {bookings.isSuccess && bookings.data.items.length > 0 ? (
        <div className="mt-8 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[var(--border)] text-[var(--muted)]">
              <tr>
                <th className="py-3 pr-4 font-semibold">Guest</th>
                <th className="py-3 pr-4 font-semibold">Stay</th>
                <th className="py-3 pr-4 font-semibold">Dates</th>
                <th className="py-3 pr-4 font-semibold">Status</th>
                <th className="py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.data.items.map((booking) => (
                <tr className="border-b border-[var(--border)] align-top" key={booking.bookingId}>
                  <td className="py-4 pr-4">
                    <p className="font-semibold">{booking.guestName}</p>
                    <p className="type-small text-[var(--muted)]">{booking.email}</p>
                    <p className="type-small mt-2 text-[var(--muted)]">{booking.request}</p>
                  </td>
                  <td className="py-4 pr-4">
                    {booking.propertyName}
                    <p className="type-small text-[var(--muted)]">{booking.guests} · {booking.price}</p>
                  </td>
                  <td className="py-4 pr-4 whitespace-nowrap">{booking.dates}</td>
                  <td className="py-4 pr-4"><StatusBadge status={booking.status} /></td>
                  <td className="py-4">
                    {booking.status === "REQUESTED" || booking.status === "REVIEWING" ? (
                      <div className="flex flex-wrap gap-2">
                        {booking.status === "REQUESTED" ? (
                          <Button
                            disabled={mutation.isPending}
                            onClick={() => mutation.mutate({ reference: booking.reference, status: "REVIEWING" })}
                            type="button"
                            variant="secondary"
                          >
                            Review
                          </Button>
                        ) : null}
                        <Button
                          disabled={mutation.isPending}
                          onClick={() => mutation.mutate({ reference: booking.reference, status: "CONFIRMED" })}
                          type="button"
                          variant="constructive"
                        >
                          Approve
                        </Button>
                        <Button
                          disabled={mutation.isPending}
                          onClick={() => mutation.mutate({ reference: booking.reference, status: "DECLINED" })}
                          type="button"
                          variant="destructive"
                        >
                          Decline
                        </Button>
                      </div>
                    ) : <p className="type-small text-[var(--muted)]">No action</p>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
