import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Badge } from "@/components/Badge";
import { StatusTransition } from "@/components/StatusTransition";
import { ApiRequestError, getRequest } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import type { ServiceRequestDetail } from "@/lib/types";

function DetailSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading request">
      <div className="h-8 w-2/3 animate-pulse rounded-md bg-zinc-100" />
      <div className="h-24 animate-pulse rounded-md bg-zinc-100" />
      <div className="h-32 animate-pulse rounded-md bg-zinc-100" />
    </div>
  );
}

async function RequestDetail({ params }: { params: PageProps<"/requests/[id]">["params"] }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound(); // "/requests/abc" never reaches the API

  let request: ServiceRequestDetail;
  try {
    request = await getRequest(id);
  } catch (e) {
    if (e instanceof ApiRequestError && e.status === 404) notFound();
    const message = e instanceof ApiRequestError ? e.message : "Could not load this request. Please try again.";
    return (
      <p role="alert" className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">{message}</p>
    );
  }

  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <h1 className="break-words text-2xl font-semibold">{request.title}</h1>
        <div className="flex flex-wrap gap-2">
          <Badge value={request.priority} />
          <Badge value={request.status} />
        </div>
      </header>

      <dl className="grid gap-4 text-sm sm:grid-cols-2">
        <div className="sm:col-span-2">
          <dt className="text-zinc-500">Description</dt>
          <dd className="mt-1 whitespace-pre-wrap">{request.description || "No description."}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">Created</dt>
          <dd className="mt-1">{formatDateTime(request.createdAt)}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">Last updated</dt>
          <dd className="mt-1">{formatDateTime(request.updatedAt)}</dd>
        </div>
        {request.resolutionNote && (
          <div className="sm:col-span-2">
            <dt className="text-zinc-500">Resolution note</dt>
            <dd className="mt-1 whitespace-pre-wrap">{request.resolutionNote}</dd>
          </div>
        )}
      </dl>

      <StatusTransition id={request.id} status={request.status} priority={request.priority} />

      <section className="space-y-3">
        <h2 className="font-medium">History</h2>
        {/* The API already returns history newest first */}
        <ol className="space-y-4 border-l-2 border-zinc-200">
          {request.history.map((h) => (
            <li key={h.id} className="pl-4">
              <p className="text-sm font-medium">
                {h.fromStatus
                  ? `${h.fromStatus.replace("_", " ")} → ${h.toStatus.replace("_", " ")}`
                  : `Created as ${h.toStatus.replace("_", " ")}`}
              </p>
              <p className="text-xs text-zinc-500">{formatDateTime(h.changedAt)}</p>
              {h.note && <p className="mt-1 text-sm text-zinc-700">{h.note}</p>}
            </li>
          ))}
        </ol>
      </section>
    </article>
  );
}

export default function RequestPage({ params }: PageProps<"/requests/[id]">) {
  return (
    <main className="mx-auto w-full max-w-3xl space-y-6 p-4 sm:p-8">
      <Link href="/" className="text-sm text-zinc-500 hover:underline">← Back to requests</Link>
      <Suspense fallback={<DetailSkeleton />}>
        <RequestDetail params={params} />
      </Suspense>
    </main>
  );
}