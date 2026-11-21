import { PRIORITIES, type Priority, type Status } from "./types";

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

//OPEN -> IN_PROGRESS -> DONE (null = no next step).
export const NEXT_STATUS: Record<Status, Status | null> = {
  OPEN: "IN_PROGRESS",
  IN_PROGRESS: "DONE",
  DONE: null,
};

export function needsResolutionNote(priority: Priority, nextStatus: Status) {
  return priority === "HIGH" && nextStatus === "DONE";
}