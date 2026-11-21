import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { updateStatusAction } from "@/lib/actions";
import { StatusTransition } from "./StatusTransition";

vi.mock("@/lib/actions", () => ({ updateStatusAction: vi.fn(async () => ({})) }));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("StatusTransition", () => {
  it("requires a resolution note to close a HIGH priority request", () => {
    render(<StatusTransition id={1} status="IN_PROGRESS" priority="HIGH" />);
    fireEvent.click(screen.getByRole("button", { name: "Move to DONE" }));

    expect(screen.getByText("A resolution note is required to close a HIGH priority request.")).toBeTruthy();
    expect(updateStatusAction).not.toHaveBeenCalled();
  });

  it("closes a HIGH priority request once a note is given", async () => {
    render(<StatusTransition id={1} status="IN_PROGRESS" priority="HIGH" />);
    fireEvent.change(screen.getByLabelText(/resolution note/i), { target: { value: "Replaced the cable" } });
    fireEvent.click(screen.getByRole("button", { name: "Move to DONE" }));

    await waitFor(() => expect(updateStatusAction).toHaveBeenCalledTimes(1));
  });

  it("does not require a note for MEDIUM priority", async () => {
    render(<StatusTransition id={1} status="IN_PROGRESS" priority="MEDIUM" />);
    fireEvent.click(screen.getByRole("button", { name: "Move to DONE" }));

    await waitFor(() => expect(updateStatusAction).toHaveBeenCalledTimes(1));
  });

  it("offers only the next status: OPEN can move to IN PROGRESS, not DONE", () => {
    render(<StatusTransition id={1} status="OPEN" priority="HIGH" />);
    expect(screen.getByRole("button", { name: "Move to IN PROGRESS" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Move to DONE" })).toBeNull();
  });

  it("shows no transition button once a request is DONE", () => {
    render(<StatusTransition id={1} status="DONE" priority="HIGH" />);
    expect(screen.queryByRole("button")).toBeNull();
  });
});