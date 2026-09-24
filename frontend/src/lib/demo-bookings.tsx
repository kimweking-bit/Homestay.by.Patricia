"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { demoBookings as seedBookings, type BookingStatus } from "@/lib/mock-data";

type DemoBooking = (typeof seedBookings)[number];

type DemoBookingsContextValue = {
  bookings: DemoBooking[];
  setStatus: (id: string, status: BookingStatus) => void;
};

const DemoBookingsContext = createContext<DemoBookingsContextValue | null>(null);

export function DemoBookingsProvider({ children }: { children: ReactNode }) {
  const [bookings, setBookings] = useState(seedBookings);

  const value = useMemo(
    () => ({
      bookings,
      setStatus(id: string, status: BookingStatus) {
        setBookings((current) => current.map((booking) => (booking.id === id ? { ...booking, status } : booking)));
      },
    }),
    [bookings],
  );

  return <DemoBookingsContext.Provider value={value}>{children}</DemoBookingsContext.Provider>;
}

export function useDemoBookings() {
  const context = useContext(DemoBookingsContext);
  if (!context) {
    throw new Error("useDemoBookings must be used within DemoBookingsProvider");
  }
  return context;
}
