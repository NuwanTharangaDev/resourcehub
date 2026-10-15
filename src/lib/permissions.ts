import type { ReservationStatus, Role } from "@prisma/client";

type CancelCheck = { status: ReservationStatus; startAt: Date; userId: string };

export function canCancel(reservation: CancelCheck, user: { id: string; role: Role }) {
  return (
    reservation.status === "CONFIRMED" &&
    reservation.startAt > new Date() &&
    (user.role === "ADMIN" || reservation.userId === user.id)
  );
}