import { Suspense } from "react";
import { Filters } from "@/components/Filters";
import { RequestList } from "@/components/RequestList";
import { PRIORITIES, STATUSES, type ListQuery } from "@/lib/types";

type SearchParams = Awaited<PageProps<"/">["searchParams"]>;

// The URL is user input: only accept known values, fall back to defaults otherwise
function parseQuery(sp: SearchParams): ListQuery {
  return {
    status: STATUSES.find((s) => s === sp.status),
    priority: PRIORITIES.find((p) => p === sp.priority),
    page: Math.max(0, Math.floor(Number(sp.page)) || 0),
  };
}

function ListSkeleton() {
  return (
    <div className="space-y-2" aria-busy="true" aria-label="Loading requests">
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="h-11 animate-pulse rounded-md bg-zinc-100" />
      ))}
    </div>
  );
}

async function Results({ searchParams }: { searchParams: PageProps<"/">["searchParams"] }) {
  const query = parseQuery(await searchParams);
  // A new key on every filter/page change remounts the boundary, so the skeleton shows again
  return (
    <Suspense key={JSON.stringify(query)} fallback={<ListSkeleton />}>
      <RequestList query={query} />
    </Suspense>
  );
}

export default function Home({ searchParams }: PageProps<"/">) {
  return (
    <main className="mx-auto w-full max-w-5xl space-y-6 p-4 sm:p-8">
      <h1 className="text-2xl font-semibold">Service requests</h1>
      <Suspense fallback={<div className="h-16" />}>
        <Filters />
      </Suspense>
      <Suspense fallback={<ListSkeleton />}>
        <Results searchParams={searchParams} />
      </Suspense>
    </main>
  );
}