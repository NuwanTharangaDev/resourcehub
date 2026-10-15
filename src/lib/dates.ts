const zone = "Asia/Colombo";

export function colomboToDate(date: string, time: string) {
  return new Date(`${date}T${time}:00+05:30`);
}

export function dayRange(date: string) {
  const start = colomboToDate(date, "00:00");
  return { start, end: new Date(start.getTime() + 24 * 60 * 60 * 1000) };
}

export function todayInColombo() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: zone }).format(new Date());
}

export function addDays(date: string, days: number) {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: zone,
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}