"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PRIORITIES, STATUSES } from "@/lib/types";

export function Filters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function update(key: "status" | "priority", value: string) {
    const params = new URLSearchParams(searchParams); // gets the original is read-only
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page"); // helps going back to page 1
    router.push(`${pathname}?${params}`);
  }

  return (
    <div className="flex flex-wrap gap-3">
      <label className="flex flex-col text-sm text-zinc-600">
        Status
        <select
          className="mt-1 rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900"
          value={searchParams.get("status") ?? ""}
          onChange={(e) => update("status", e.target.value)}
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s.replace("_", " ")}</option>
          ))}
        </select>
      </label>

      <label className="flex flex-col text-sm text-zinc-600">
        Priority
        <select
          className="mt-1 rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900"
          value={searchParams.get("priority") ?? ""}
          onChange={(e) => update("priority", e.target.value)}
        >
          <option value="">All priorities</option>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </label>
    </div>
  );
}