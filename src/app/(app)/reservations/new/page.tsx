import Link from "next/link";
import { requireUser } from "@/lib/session";
import { todayInColombo } from "@/lib/dates";
import { listActiveResources } from "@/services/resource-service";
import { ReservationForm } from "@/components/reservation-form";

export default async function NewReservationPage({
  searchParams,
}: {
  searchParams: Promise<{ resourceId?: string }>;
}) {
  await requireUser();
  const { resourceId } = await searchParams;
  const resources = await listActiveResources();

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-900">New reservation</h1>
      <p className="mb-6 text-sm text-slate-600">
        Not sure what is free? Check the{" "}
        <Link href="/availability" className="text-blue-700 underline">
          availability page
        </Link>{" "}
        first.
      </p>

      {resources.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
          There are no active resources to book yet.
        </p>
      ) : (
        <ReservationForm
          resources={resources}
          defaultResourceId={resources.find((resource) => resource.id === resourceId)?.id}
          today={todayInColombo()}
        />
      )}
    </div>
  );
}