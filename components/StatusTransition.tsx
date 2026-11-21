"use client";

import { useActionState, useState } from "react";
import { updateStatusAction, type TransitionState } from "@/lib/actions";
import type { Priority, Status } from "@/lib/types";
import { NEXT_STATUS, needsResolutionNote } from "@/lib/validation";

export function StatusTransition({ id, status, priority }: { id: number; status: Status; priority: Priority }) {
  const [state, formAction, pending] = useActionState(updateStatusAction, {} as TransitionState);
  const [note, setNote] = useState("");
  const [noteError, setNoteError] = useState("");

  const next = NEXT_STATUS[status];
  const noteRequired = next !== null && needsResolutionNote(priority, next);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (noteRequired && !note.trim()) {
      e.preventDefault(); // don't call the server without the required note
      setNoteError("A resolution note is required to close a HIGH priority request.");
    } else {
      setNoteError("");
    }
  }

  return (
    <section className="space-y-3 rounded-md border border-zinc-200 p-4">
      <h2 className="font-medium">Status</h2>

      {state.message && (
        <p role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {state.message}
        </p>
      )}

      {next === null ? (
        <p className="text-sm text-zinc-500">This request is done. Its status can no longer change.</p>
      ) : (
        <form action={formAction} onSubmit={handleSubmit} className="space-y-3">
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="status" value={next} />

          {next === "DONE" && (
            <div>
              <label htmlFor="resolutionNote" className="text-sm font-medium">
                Resolution note{" "}
                {noteRequired
                  ? <span className="text-red-600">(required for HIGH priority)</span>
                  : <span className="font-normal text-zinc-400">(optional)</span>}
              </label>
              <textarea
                id="resolutionNote"
                name="resolutionNote"
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                aria-invalid={!!noteError}
                aria-describedby="note-error"
                className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2"
              />
              {noteError && <p id="note-error" className="mt-1 text-sm text-red-600">{noteError}</p>}
            </div>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-md bg-zinc-900 px-4 py-2 text-white disabled:opacity-50 sm:w-auto"
          >
            {pending ? "Updating…" : `Move to ${next.replace("_", " ")}`}
          </button>
        </form>
      )}
    </section>
  );
}