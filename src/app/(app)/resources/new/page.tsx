import { requireAdmin } from "@/lib/session";
import { ResourceForm } from "@/components/resource-form";
import { createResourceAction } from "../actions";

export default async function NewResourcePage() {
  await requireAdmin();

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-900">New resource</h1>
      <p className="mb-6 text-sm text-slate-600">Add a room or piece of equipment that people can reserve.</p>
      <ResourceForm action={createResourceAction} cancelHref="/resources" />
    </div>
  );
}