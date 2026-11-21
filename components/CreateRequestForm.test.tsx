import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createRequestAction } from "@/lib/actions";
import { CreateRequestForm } from "./CreateRequestForm";

// The real action runs on the server and calls the API; here we only test the browser-side rules
vi.mock("@/lib/actions", () => ({ createRequestAction: vi.fn(async () => ({})) }));

afterEach(() => {
  cleanup();          // remove the rendered form between tests
  vi.clearAllMocks(); // reset the call count on the spy
});

function submitWithTitle(title: string) {
  render(<CreateRequestForm />);
  fireEvent.change(screen.getByLabelText("Title"), { target: { value: title } });
  fireEvent.change(screen.getByLabelText("Priority"), { target: { value: "HIGH" } });
  fireEvent.click(screen.getByRole("button", { name: "Create request" }));
}

describe("CreateRequestForm", () => {
  it("blocks submission when the title is empty", () => {
    submitWithTitle("");
    expect(screen.getByText("Title is required.")).toBeTruthy();
    expect(createRequestAction).not.toHaveBeenCalled();
  });

  it("blocks submission when the title is over 100 characters", () => {
    submitWithTitle("a".repeat(101));
    expect(screen.getByText("Title must be 100 characters or fewer.")).toBeTruthy();
    expect(createRequestAction).not.toHaveBeenCalled();
  });

  it("submits when the input is valid", async () => {
    submitWithTitle("Printer on level 3 not connecting");
    await waitFor(() => expect(createRequestAction).toHaveBeenCalledTimes(1));
  });
});