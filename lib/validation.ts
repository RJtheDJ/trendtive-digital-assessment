import { PRIORITIES } from "./types";

export const TITLE_MAX = 100;
export const DESCRIPTION_MAX = 1000;

export type FieldErrors = Partial<Record<"title" | "description" | "priority", string>>;

export function validateRequest(input: { title: string; description: string; priority: string }): FieldErrors {
  const errors: FieldErrors = {};
  const title = input.title.trim();

  if (!title) errors.title = "Title is required.";
  else if (title.length > TITLE_MAX) errors.title = `Title must be ${TITLE_MAX} characters or fewer.`;

  if (input.description.trim().length > DESCRIPTION_MAX)
    errors.description = `Description must be ${DESCRIPTION_MAX} characters or fewer.`;

  if (!PRIORITIES.some((p) => p === input.priority)) errors.priority = "Choose a priority.";

  return errors;
}