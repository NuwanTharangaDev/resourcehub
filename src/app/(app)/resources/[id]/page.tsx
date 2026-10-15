import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/session";
import { formatDateTime } from "@/lib/dates";
import { categoryLabels, primaryButton, secondaryButton } from "@/lib/ui";
import { getResource } from "@/services/resource-service";
import { ActiveBadge } from "@/components/badges";
import { ConfirmButton } from "@/components/confirm-button";
import { toggleResourceAction } from "../actions";

export default async function ResourceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const resource = await getResource(id);
  if (!resource) notFound();

  const details = [
    ["Category", categoryLabels[resource.category]],
    ["Location", resource.location],
    ["Capacity", resource.capacity ?? "Not applicable"],
    ["Description", resource.description || "No description"],
  ];

  return (
    <div className="max-w-3xl">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{resource.name}</h1>
          <div className="mt-1">
            <ActiveBadge active={resource.isActive} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {resource.isActive && (
            <Link href={`/reservations/new?resourceId=${resource.id}`} className={primaryButton}>
              Book this resource
            </Link>
          )}
          {user.role === "ADMIN" && (
            <>
              <Link href={`/resources/${resource.id}/edit`} className={secondaryButton}>
                Edit
              </Link>
              <form action={toggleResourceAction.bind(null, resource.id, !resource.isActive)}>
                <ConfirmButton
                  className={secondaryButton}
                  message={
                    resource.isActive
                      ? "Deactivate this resource? Existing reservations are kept, but no new bookings can be made."
                      : "Reactivate this resource so it can be booked again?"
                  }
                >
                  {resource.isActive ? "Deactivate" : "Reactivate"}
                </ConfirmButton>
              </form>
            </>
          )}
        </div>
      </div>

      <dl className="mb-8 grid gap-4 rounded-xl border border-slate-200 bg-white p-6 sm:grid-cols-2">
        {details.map(([label, text]) => (
          <div key={label}>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-600">{label}</dt>
            <dd className="mt-1 text-sm text-slate-900">{text}</dd>
          </div>
        ))}
      </dl>

      <h2 className="mb-3 text-lg font-semibold text-slate-900">Upcoming reservations</h2>
      {resource.reservations.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
          Nothing booked yet.
        </p>
      ) : (
        <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
          {resource.reservations.map((reservation) => (
            <li key={reservation.id} className="px-4 py-3 text-sm">
              <p className="font-medium text-slate-900">{reservation.title}</p>
              <p className="text-slate-600">
                {formatDateTime(reservation.startAt)} to {formatDateTime(reservation.endAt)} · {reservation.user.name}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}