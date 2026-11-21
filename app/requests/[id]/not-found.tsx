import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto w-full max-w-3xl space-y-3 p-4 text-center sm:p-8">
      <h1 className="text-xl font-semibold">Request not found</h1>
      <p className="text-zinc-500">There is no service request with this ID.</p>
      <Link href="/" className="text-blue-600 hover:underline">Back to all requests</Link>
    </main>
  );
}