export const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/30";

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:opacity-60";

export const primaryButton = `${buttonBase} bg-blue-600 text-white hover:bg-blue-700`;
export const secondaryButton = `${buttonBase} border border-slate-300 bg-white text-slate-700 hover:bg-slate-50`;

export const categoryLabels: Record<string, string> = {
  ROOM: "Room",
  EQUIPMENT: "Equipment",
  VEHICLE: "Vehicle",
  OTHER: "Other",
};