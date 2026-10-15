import type { ReservationStatus } from "@prisma/client";

const statusStyles: Record<ReservationStatus, string> = {
  CONFIRMED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  COMPLETED: "bg-slate-200 text-slate-800",
};

export function StatusBadge({ status }: { status: ReservationStatus }) {
  const label = status.charAt(0) + status.slice(1).toLowerCase();
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[status]}`}>
      {label}
    </span>
  );
}

export function ActiveBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
        active ? "bg-green-100 text-green-800" : "bg-slate-200 text-slate-800"
      }`}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}