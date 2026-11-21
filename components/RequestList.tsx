import Link from "next/link";
import { ApiRequestError, listRequests } from "@/lib/api";
import type { ListQuery, PaginatedResponse, ServiceRequest } from "@/lib/types";
import { Badge } from "./Badge";

const PAGE_SIZE = 10;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

// Builds a URL for another page while keeping the current filters
function pageHref(query: ListQuery, page: number) {
  const params = new URLSearchParams();
  if (query.status) params.set("status", query.status);
  if (query.priority) params.set("priority", query.priority);
  if (page > 0) params.set("page", String(page));
  return `/?${params}`;
}

export async function RequestList({ query }: { query: ListQuery }) {
  let data: PaginatedResponse<ServiceRequest>;
  try {
    data = await listRequests({ ...query, size: PAGE_SIZE });
  } catch (e) {
    const message = e instanceof ApiRequestError ? e.message : "Could not load requests. Please try again.";
    return (
      <p role="alert" className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {message}
      </p>
    );
  }

  if (data.content.length === 0) {
    const filtered = query.status || query.priority || query.page > 0;
    return (
      <div className="rounded-md border border-dashed border-zinc-300 p-10 text-center">
        <p className="font-medium">{filtered ? "No requests match these filters." : "No requests yet."}</p>
        {filtered && (
          <Link href="/" className="mt-2 inline-block text-sm text-blue-600 hover:underline">
            Clear filters
          </Link>
        )}
      </div>
    );
  }

  const isFirst = data.page === 0;
  const isLast = data.page >= data.totalPages - 1;

  return (
    <div>
      <table className="w-full text-left text-sm">
        <thead className="border-b border-zinc-200 text-zinc-500">
          <tr>
            <th className="py-2 font-medium">Title</th>
            <th className="py-2 font-medium">Priority</th>
            <th className="py-2 font-medium">Status</th>
            <th className="py-2 font-medium">Created</th>
          </tr>
        </thead>
        <tbody>
          {data.content.map((r) => (
            <tr key={r.id} className="border-b border-zinc-100 hover:bg-zinc-50">
              <td className="py-3 pr-4">
                <Link href={`/requests/${r.id}`} className="font-medium hover:underline">{r.title}</Link>
              </td>
              <td className="py-3 pr-4"><Badge value={r.priority} /></td>
              <td className="py-3 pr-4"><Badge value={r.status} /></td>
              <td className="py-3 text-zinc-500">{formatDate(r.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <nav className="mt-4 flex items-center justify-between text-sm" aria-label="Pagination">
        {isFirst ? <span className="text-zinc-300">← Previous</span>
                 : <Link href={pageHref(query, data.page - 1)} className="hover:underline">← Previous</Link>}
        <span className="text-zinc-500">
          Page {data.page + 1} of {data.totalPages} · {data.totalElements} requests
        </span>
        {isLast ? <span className="text-zinc-300">Next →</span>
                : <Link href={pageHref(query, data.page + 1)} className="hover:underline">Next →</Link>}
      </nav>
    </div>
  );
}