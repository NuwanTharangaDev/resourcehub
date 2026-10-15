import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/session";
import { getResource } from "@/services/resource-service";
import { ResourceForm } from "@/components/resource-form";
import { updateResourceAction } from "../../actions";

export default async function EditResourcePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const resource = await getResource(id);
  if (!resource) notFound();

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-900">Edit {resource.name}</h1>
      <p className="mb-6 text-sm text-slate-600">Changes apply immediately. Existing reservations are not affected.</p>
      <ResourceForm
        action={updateResourceAction.bind(null, resource.id)}
        resource={resource}
        cancelHref={`/resources/${resource.id}`}
      />
    </div>
  );
}