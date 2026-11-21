"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ApiRequestError, createRequest } from "./api";
import type { Priority } from "./types";
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