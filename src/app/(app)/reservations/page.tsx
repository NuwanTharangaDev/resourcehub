import Link from "next/link";
import { Plus } from "lucide-react";
import { ReservationStatus } from "@prisma/client";
import { requireUser } from "@/lib/session";
import { formatDateTime, isValidDate } from "@/lib/dates";
import { canCancel } from "@/lib/permissions";
import { inputClass, primaryButton, secondaryButton } from "@/lib/ui";
import { listReservations, markFinishedReservations } from "@/services/reservation-service";
import { listResourceOptions } from "@/services/resource-service";
import { StatusBadge } from "@/components/badges";
import { CancelReservationButton } from "@/components/cancel-reservation-button";
import { Pagination, parsePage } from "@/components/pagination";

type SearchParams = Promise<{
  q?: string;
  resource?: string;
  status?: string;
  date?: string;
  when?: string;
  mine?: string;
  page?: string;
}>;

export default async function ReservationsPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await requireUser();
  const { q, resource, status, date, when, mine, page } = await searchParams;

  await markFinishedReservations();

  const statusFilter = Object.values(ReservationStatus).find((item) => item === status);
  const whenFilter = when === "upcoming" || when === "past" ? when : undefined;
  const dateFilter = isValidDate(date) ? date : undefined;

  const [result, resources] = await Promise.all([
    listReservations({
      search: q?.trim() || undefined,
      resourceId: resource || undefined,
      status: statusFilter,
      date: dateFilter,
      when: whenFilter,
      userId: mine === "1" ? user.id : undefined,
      page: parsePage(page),
    }),
    listResourceOptions(),
  ]);

  const isFiltered = Boolean(q || resource || status || date || when || mine);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reservations</h1>
          <p className="text-sm text-slate-600">Everything that is booked, with the newest changes applied straight away.</p>
        </div>
        <Link href="/reservations/new" className={primaryButton}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          New reservation
        </Link>
      </div>

      <form className="mb-4 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label htmlFor="q" className="mb-1 block text-xs font-medium text-slate-700">Search title</label>
          <input id="q" name="q" defaultValue={q} className={inputClass} />
        </div>
        <div>
          <label htmlFor="resource" className="mb-1 block text-xs font-medium text-slate-700">Resource</label>
          <select id="resource" name="resource" defaultValue={resource ?? ""} className={inputClass}>
            <option value="">All resources</option>
            {resources.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="status" className="mb-1 block text-xs font-medium text-slate-700">Status</label>
          <select id="status" name="status" defaultValue={status ?? ""} className={inputClass}>
            <option value="">Any status</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
        <div>
          <label htmlFor="date" className="mb-1 block text-xs font-medium text-slate-700">Date</label>
          <input id="date" name="date" type="date" defaultValue={dateFilter ?? ""} className={inputClass} />
        </div>
        <div>
          <label htmlFor="when" className="mb-1 block text-xs font-medium text-slate-700">Show</label>
          <select id="when" name="when" defaultValue={when ?? ""} className={inputClass}>
            <option value="">All</option>
            <option value="upcoming">Upcoming</option>
            <option value="past">Previous</option>
          </select>
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 pb-2 text-sm text-slate-700">
            <input type="checkbox" name="mine" value="1" defaultChecked={mine === "1"} className="h-4 w-4" />
            Only my reservations
          </label>
        </div>
        <div className="flex items-end gap-2 sm:col-span-2">
          <button type="submit" className={primaryButton}>
            Filter
          </button>
          {isFiltered && (
            <Link href="/reservations" className={secondaryButton}>
              Clear
            </Link>
          )}
        </div>
      </form>

      {result.items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="font-medium text-slate-900">{isFiltered ? "No reservations match your filters" : "No reservations yet"}</p>
          <p className="mt-1 text-sm text-slate-600">
            {isFiltered ? "Try a different search or clear the filters." : "Book a resource to see it listed here."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-700">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Title</th>
                <th scope="col" className="px-4 py-3 font-medium">Resource</th>
                <th scope="col" className="px-4 py-3 font-medium">When</th>
                <th scope="col" className="px-4 py-3 font-medium">Booked by</th>
                <th scope="col" className="px-4 py-3 font-medium">Status</th>
                <th scope="col" className="px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {result.items.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3">
                    <Link href={`/reservations/${item.id}`} className="font-medium text-blue-700 hover:underline">
                      {item.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{item.resource.name}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                    {formatDateTime(item.startAt)}
                    <br />
                    <span className="text-slate-600">to {formatDateTime(item.endAt)}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{item.user.name}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="px-4 py-3">{canCancel(item, user) ? <CancelReservationButton id={item.id} /> : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination
        page={result.page}
        totalPages={result.totalPages}
        basePath="/reservations"
        params={{ q, resource, status, date: dateFilter, when: whenFilter, mine }}
      />
    </div>
  );
}