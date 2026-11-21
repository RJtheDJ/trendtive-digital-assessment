import Link from "next/link";
import { CreateRequestForm } from "@/components/CreateRequestForm";

export default function NewRequestPage() {
  return (
    <main className="mx-auto w-full max-w-2xl space-y-6 p-4 sm:p-8">
      <Link href="/" className="text-sm text-zinc-500 hover:underline">← Back to requests</Link>
      <h1 className="text-2xl font-semibold">New service request</h1>
      <CreateRequestForm />
    </main>
  );
}