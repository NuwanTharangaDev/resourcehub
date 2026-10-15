import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/session";
import { formatDateTime } from "@/lib/dates";
import { canCancel } from "@/lib/permissions";
import { secondaryButton } from "@/lib/ui";
import { getReservation } from "@/services/reservation-service";
import { StatusBadge } from "@/components/badges";
import { CancelReservationButton } from "@/components/cancel-reservation-button";

export default async function ReservationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const reservation = await getReservation(id);
  if (!reservation) notFound();

  const details = [
    ["Resource", reservation.resource.name],
    ["Starts", formatDateTime(reservation.startAt)],
    ["Ends", formatDateTime(reservation.endAt)],
    ["Booked by", user.role === "ADMIN" ? `${reservation.user.name} (${reservation.user.email})` : reservation.user.name],
    ["Created", formatDateTime(reservation.createdAt)],
    ["Last updated", formatDateTime(reservation.updatedAt)],
  ];

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{reservation.title}</h1>
          <div className="mt-1">
            <StatusBadge status={reservation.status} />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/reservations" className={secondaryButton}>
            Back to list
          </Link>
          {canCancel(reservation, user) && <CancelReservationButton id={reservation.id} />}
        </div>
      </div>

      <dl className="grid gap-4 rounded-xl border border-slate-200 bg-white p-6 sm:grid-cols-2">
        {details.map(([label, text]) => (
          <div key={label}>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-600">{label}</dt>
            <dd className="mt-1 text-sm text-slate-900">{text}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}