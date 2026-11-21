"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ApiRequestError, createRequest, updateStatus } from "./api";
import { STATUSES, type Priority } from "./types";
import { validateRequest, type FieldErrors } from "./validation";

export type CreateState = { errors?: FieldErrors; message?: string };

export async function createRequestAction(_prev: CreateState, formData: FormData): Promise<CreateState> {
  const input = {
    title: String(formData.get("title") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    priority: String(formData.get("priority") ?? ""),
  };

  // Checker for a request that is invalid. 
  const errors = validateRequest(input);
  if (Object.keys(errors).length > 0) return { errors };

  let id: number;
  try {
    const created = await createRequest({
      title: input.title,
      description: input.description || undefined, 
      priority: input.priority as Priority,         
    });
    id = created.id;
  } catch (e) {
    return { message: e instanceof ApiRequestError ? e.message : "Could not create the request. Please try again." };
  }

  revalidatePath("/"); // the list now has a new item
  redirect(`/requests/${id}`); // redirect works by throwing
}

export type TransitionState = { message?: string };

export async function updateStatusAction(_prev: TransitionState, formData: FormData): Promise<TransitionState> {
  const id = Number(formData.get("id"));
  const status = STATUSES.find((s) => s === formData.get("status"));
  const note = String(formData.get("resolutionNote") ?? "").trim();

  // only pass a real id and a real status to the API
  if (!Number.isInteger(id) || id <= 0 || !status) return { message: "Invalid request." };

  try {
    await updateStatus(id, { status, resolutionNote: note || undefined });
  } catch (e) {
    if (!(e instanceof ApiRequestError)) return { message: "Could not update the status. Please try again." };
    // If status was changed elsewhere (e.g. another tab)
    // Refresh so the page shows the real status
    if (e.code === "INVALID_TRANSITION") revalidatePath(`/requests/${id}`);
    return { message: e.message };
  }

  revalidatePath(`/requests/${id}`); // re-render the detail page with the new status + history
  revalidatePath("/");               // list shows status too
  return {};
}