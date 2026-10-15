import { requireUser } from "@/lib/session";

export default async function DashboardPage() {
  const user = await requireUser();
  return <h1 className="text-2xl font-bold text-slate-900">Welcome, {user.name}</h1>;
}