import Link from "next/link";
import { secondaryButton } from "@/lib/ui";

export function parsePage(value?: string) {
  const page = parseInt(value ?? "1", 10) || 1;
  return Math.min(Math.max(page, 1), 10000);
}

type PaginationProps = {
  page: number;
  totalPages: number;
  basePath: string;
  params: Record<string, string | undefined>;
};

export function Pagination({ page, totalPages, basePath, params }: PaginationProps) {
  if (totalPages <= 1) return null;

  function href(target: number) {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value) query.set(key, value);
    }
    query.set("page", String(target));
    return `${basePath}?${query}`;
  }

  return (
    <nav aria-label="Pagination" className="mt-4 flex items-center justify-between text-sm">
      {page > 1 ? (
        <Link href={href(page - 1)} className={secondaryButton}>
          Previous
        </Link>
      ) : (
        <span />
      )}
      <span className="text-slate-600">
        Page {page} of {totalPages}
      </span>
      {page < totalPages ? (
        <Link href={href(page + 1)} className={secondaryButton}>
          Next
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}