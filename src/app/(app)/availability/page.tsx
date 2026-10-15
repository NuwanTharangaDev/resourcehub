import Link from "next/link";
import { requireUser } from "@/lib/session";
import { formatTime, todayInColombo } from "@/lib/dates";
import { availabilitySchema } from "@/lib/validations";
import { categoryLabels, inputClass, primaryButton } from "@/lib/ui";
import { getAvailability } from "@/services/reservation-service";
import { Field } from "@/components/field";

type SearchParams = Promise<{ date?: string; startTime?: string; endTime?: string; category?: string }>;

export default async function AvailabilityPage({ searchParams }: { searchParams: SearchParams }) {
  await requireUser();
  const params = await searchParams;

  const input = {
    date: params.date || todayInColombo(),
    startTime: params.startTime || "09:00",
    endTime: params.endTime || "10:00",
    category: params.category || undefined,
  };

  const parsed = availabilitySchema.safeParse(input);
  const errors = parsed.success ? {} : parsed.error.flatten().fieldErrors;
  const results = parsed.success ? await getAvailability(parsed.data) : [];
  const freeCount = results.filter((item) => item.available).length;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Availability</h1>
      <p className="mb-6 text-sm text-slate-600">Pick a date and time to see which resources are free. Times are in Sri Lanka time.</p>

      <form className="mb-6 grid gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-5 lg:items-start">
        <Field label="Date" name="date" error={errors.date?.[0]}>
          <input id="date" name="date" type="date" defaultValue={input.date} className={inputClass} />
        </Field>
        <Field label="Start time" name="startTime" error={errors.startTime?.[0]}>
          <input id="startTime" name="startTime" type="time" defaultValue={input.startTime} className={inputClass} />
        </Field>
        <Field label="End time" name="endTime" error={errors.endTime?.[0]}>
          <input id="endTime" name="endTime" type="time" defaultValue={input.endTime} className={inputClass} />
        </Field>
        <Field label="Category" name="category" error={errors.category?.[0] && "Choose a valid category"}>
          <select id="category" name="category" defaultValue={params.category ?? ""} className={inputClass}>
            <option value="">All categories</option>
            {Object.entries(categoryLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </Field>
        <div className="lg:pt-6">
          <button type="submit" className={`${primaryButton} w-full`}>
            Check availability
          </button>
        </div>
      </form>

      {parsed.success && (
        <>
          <p className="mb-3 text-sm text-slate-700" role="status">
            {freeCount} of {results.length} resources are available for this time.
          </p>

          {results.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-600">
              No active resources found for this category.
            </div>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((item) => (
                <li key={item.id} className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h2 className="font-semibold text-slate-900">{item.name}</h2>
                      <p className="text-sm text-slate-600">
                        {categoryLabels[item.category]} · {item.location}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        item.available ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {item.available ? "Available" : "Unavailable"}
                    </span>
                  </div>

                  <div className="mt-3 text-sm">
                    {item.reservations.length === 0 ? (
                      <p className="text-slate-600">No bookings that day.</p>
                    ) : (
                      <>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-600">Booked that day</p>
                        <ul className="mt-1 space-y-1 text-slate-700">
                          {item.reservations.map((booking) => (
                            <li key={booking.id}>
                              {formatTime(booking.startAt)} to {formatTime(booking.endAt)} · {booking.title}
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>

                  {item.available && (
                    <Link
                      href={`/reservations/new?resourceId=${item.id}`}
                      className="mt-4 inline-block text-sm font-medium text-blue-700 hover:underline"
                    >
                      Book this resource
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}