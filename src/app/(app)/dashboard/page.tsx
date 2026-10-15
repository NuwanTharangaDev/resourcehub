import Link from "next/link";
import { CalendarDays, CheckCircle2, Clock, Package, Plus } from "lucide-react";
import { requireUser } from "@/lib/session";
import { formatDateTime } from "@/lib/dates";
import { primaryButton, secondaryButton } from "@/lib/ui";
import { markFinishedReservations } from "@/services/reservation-service";
import { getDashboardData } from "@/services/dashboard-service";
import { StatusBadge } from "@/components/badges";

type StatCardProps = {
  label: string;
  value: string | number;
  note?: string;
  icon: React.ComponentType<{ className?: string }>;
};

function StatCard({ label, value, note, icon: Icon }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-600">{label}</p>
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
      {note && <p className="mt-1 text-xs text-slate-600">{note}</p>}
    </div>
  );
}

export default async function DashboardPage() {
  const user = await requireUser();
  await markFinishedReservations();
  const data = await getDashboardData();

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Welcome back, {user.name}</h1>
          <p className="text-sm text-slate-600">Here is what is happening with your shared resources.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/reservations/new" className={primaryButton}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            New reservation
          </Link>
          {user.role === "ADMIN" && (
            <Link href="/resources/new" className={secondaryButton}>
              Add resource
            </Link>
          )}
        </div>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Package} label="Active resources" value={data.activeResources} />
        <StatCard icon={CalendarDays} label="Reservations today" value={data.todayCount} note="Excluding cancelled" />
        <StatCard icon={Clock} label="Upcoming confirmed" value={data.upcomingCount} />
        <StatCard
          icon={CheckCircle2}
          label="Free right now"
          value={`${data.freeNow} of ${data.activeResources}`}
          note="Active resources with no booking in progress"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Upcoming reservations</h2>
          {data.upcoming.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">
              Nothing is booked yet.{" "}
              <Link href="/reservations/new" className="font-medium text-blue-700 underline">
                Create a reservation
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-600">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-medium">Title</th>
                    <th scope="col" className="px-4 py-3 font-medium">Resource</th>
                    <th scope="col" className="px-4 py-3 font-medium">Starts</th>
                    <th scope="col" className="px-4 py-3 font-medium">Booked by</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 [&>tr:hover]:bg-slate-50">
                  {data.upcoming.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3">
                        <Link href={`/reservations/${item.id}`} className="font-medium text-blue-700 hover:underline">
                          {item.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{item.resource.name}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-700">{formatDateTime(item.startAt)}</td>
                      <td className="px-4 py-3 text-slate-700">{item.user.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Recent activity</h2>
          {data.recent.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
              No activity yet.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white shadow-sm">
              {data.recent.map((item) => (
                <li key={item.id} className="px-4 py-3 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-slate-900">{item.title}</p>
                    <StatusBadge status={item.status} />
                  </div>
                  <p className="text-slate-600">
                    {item.resource.name} · {item.user.name}
                  </p>
                  <p className="text-xs text-slate-600">Updated {formatDateTime(item.updatedAt)}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}