import type { Priority, Status } from "@/lib/types";

const COLORS: Record<Status | Priority, string> = {
  OPEN: "bg-blue-50 text-blue-700",
  IN_PROGRESS: "bg-amber-50 text-amber-700",
  DONE: "bg-green-50 text-green-700",
  LOW: "bg-zinc-100 text-zinc-600",
  MEDIUM: "bg-orange-50 text-orange-700",
  HIGH: "bg-red-50 text-red-700",
};

export function Badge({ value }: { value: Status | Priority }) {
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${COLORS[value]}`}>
      {value.replace("_", " ")}
    </span>
  );
}