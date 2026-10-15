import Link from "next/link";
import { Plus } from "lucide-react";
import { requireUser } from "@/lib/session";
import { categories } from "@/lib/validations";
import { categoryLabels, inputClass, primaryButton, secondaryButton } from "@/lib/ui";
import { listResources } from "@/services/resource-service";
import { ActiveBadge } from "@/components/badges";
import { Pagination, parsePage } from "@/components/pagination";

type SearchParams = Promise<{ q?: string; category?: string; status?: string; page?: string }>;

export default async function ResourcesPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await requireUser();
  const { q, category, status, page } = await searchParams;

  const result = await listResources({
    search: q?.trim() || undefined,
    category: categories.find((item) => item === category),
    status: status === "active" || status === "inactive" ? status : undefined,
    page: parsePage(page),
  });

  const isFiltered = Boolean(q || category || status);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Resources</h1>
          <p className="text-sm text-slate-600">Rooms, equipment and other shared items that can be reserved.</p>
        </div>
        {user.role === "ADMIN" && (
          <Link href="/resources/new" className={primaryButton}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            New resource
          </Link>
        )}
      </div>

      <form className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <div className="min-w-48 flex-1">
          <label htmlFor="q" className="sr-only">
            Search by name
          </label>
          <input id="q" name="q" defaultValue={q} placeholder="Search by name" className={inputClass} />
        </div>
        <div>
          <label htmlFor="category" className="sr-only">
            Category
          </label>
          <select id="category" name="category" defaultValue={category ?? ""} className={inputClass}>
            <option value="">All categories</option>
            {Object.entries(categoryLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="status" className="sr-only">
            Status
          </label>
          <select id="status" name="status" defaultValue={status ?? ""} className={inputClass}>
            <option value="">Any status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <button type="submit" className={primaryButton}>
          Filter
        </button>
        {isFiltered && (
          <Link href="/resources" className={secondaryButton}>
            Clear
          </Link>
        )}
      </form>

      {result.items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="font-medium text-slate-900">{isFiltered ? "No resources match your filters" : "No resources yet"}</p>
          <p className="mt-1 text-sm text-slate-600">
            {isFiltered
              ? "Try a different search or clear the filters."
              : user.role === "ADMIN"
                ? "Add the first resource to start taking reservations."
                : "An administrator needs to add resources first."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-700">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Name</th>
                <th scope="col" className="px-4 py-3 font-medium">Category</th>
                <th scope="col" className="px-4 py-3 font-medium">Location</th>
                <th scope="col" className="px-4 py-3 font-medium">Capacity</th>
                <th scope="col" className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {result.items.map((resource) => (
                <tr key={resource.id}>
                  <td className="px-4 py-3">
                    <Link href={`/resources/${resource.id}`} className="font-medium text-blue-700 hover:underline">
                      {resource.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{categoryLabels[resource.category]}</td>
                  <td className="px-4 py-3 text-slate-700">{resource.location}</td>
                  <td className="px-4 py-3 text-slate-700">{resource.capacity ?? "-"}</td>
                  <td className="px-4 py-3">
                    <ActiveBadge active={resource.isActive} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={result.page} totalPages={result.totalPages} basePath="/resources" params={{ q, category, status }} />
    </div>
  );
}