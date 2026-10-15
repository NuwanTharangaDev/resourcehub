import type { ReservationStatus } from "@prisma/client";

const statusStyles: Record<ReservationStatus, { pill: string; dot: string }> = {
  CONFIRMED: { pill: "bg-green-50 text-green-800 ring-green-600/20", dot: "bg-green-600" },
  CANCELLED: { pill: "bg-red-50 text-red-800 ring-red-600/20", dot: "bg-red-600" },
  COMPLETED: { pill: "bg-slate-100 text-slate-800 ring-slate-500/20", dot: "bg-slate-500" },
};

function Badge({ label, pill, dot }: { label: string; pill: string; dot: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${pill}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} aria-hidden="true" />
      {label}
    </span>
  );
}

export function StatusBadge({ status }: { status: ReservationStatus }) {
  const label = status.charAt(0) + status.slice(1).toLowerCase();
  return <Badge label={label} {...statusStyles[status]} />;
}

export function ActiveBadge({ active }: { active: boolean }) {
  return active ? (
    <Badge label="Active" pill="bg-green-50 text-green-800 ring-green-600/20" dot="bg-green-600" />
  ) : (
    <Badge label="Inactive" pill="bg-slate-100 text-slate-800 ring-slate-500/20" dot="bg-slate-500" />
  );
}