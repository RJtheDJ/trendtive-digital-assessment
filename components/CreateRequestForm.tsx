"use client";

import { useActionState, useState } from "react";
import { createRequestAction, type CreateState } from "@/lib/actions";
import { PRIORITIES } from "@/lib/types";
import { DESCRIPTION_MAX, TITLE_MAX, validateRequest, type FieldErrors } from "@/lib/validation";

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return <p id={id} className="mt-1 text-sm text-red-600">{message}</p>;
}

const inputClass = "mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900";

export function CreateRequestForm() {
  const [state, formAction, pending] = useActionState(createRequestAction, {} as CreateState);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("");
  const [clientErrors, setClientErrors] = useState<FieldErrors>({});

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const found = validateRequest({ title, description, priority });
    setClientErrors(found);
    if (Object.keys(found).length > 0) e.preventDefault(); // invalid: never reaches the server
  }

  // Client errors win; otherwise show what the server returned
  const errors = Object.keys(clientErrors).length > 0 ? clientErrors : (state.errors ?? {});

  return (
    <form action={formAction} onSubmit={handleSubmit} className="space-y-5">
      {state.message && (
        <p role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {state.message}
        </p>
      )}

      <div>
        <label htmlFor="title" className="text-sm font-medium">Title</label>
        <input
          id="title"
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          aria-invalid={!!errors.title}
          aria-describedby="title-error"
          className={inputClass}
        />
        <div className="flex justify-between">
          <FieldError id="title-error" message={errors.title} />
          <span className={`ml-auto mt-1 text-xs ${title.length > TITLE_MAX ? "text-red-600" : "text-zinc-400"}`}>
            {title.length}/{TITLE_MAX}
          </span>
        </div>
      </div>

      <div>
        <label htmlFor="description" className="text-sm font-medium">
          Description <span className="font-normal text-zinc-400">(optional)</span>
        </label>
        <textarea
          id="description"
          name="description"
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          aria-invalid={!!errors.description}
          aria-describedby="description-error"
          className={inputClass}
        />
        <div className="flex justify-between">
          <FieldError id="description-error" message={errors.description} />
          <span className={`ml-auto mt-1 text-xs ${description.length > DESCRIPTION_MAX ? "text-red-600" : "text-zinc-400"}`}>
            {description.length}/{DESCRIPTION_MAX}
          </span>
        </div>
      </div>

      <div>
        <label htmlFor="priority" className="text-sm font-medium">Priority</label>
        <select
          id="priority"
          name="priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          aria-invalid={!!errors.priority}
          aria-describedby="priority-error"
          className={inputClass}
        >
          <option value="">Choose a priority</option>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <FieldError id="priority-error" message={errors.priority} />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-zinc-900 px-4 py-2 text-white disabled:opacity-50 sm:w-auto"
      >
        {pending ? "Creating…" : "Create request"}
      </button>
    </form>
  );
}