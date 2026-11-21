import "server-only";
import type { ApiError, PaginatedResponse, Priority, ServiceRequest, ServiceRequestDetail, Status } from "./types";

// For any non-2xx response, throw an ApiRequestError with the status code and error message
export class ApiRequestError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${process.env.API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "X-Candidate": process.env.CANDIDATE_KEY ?? "",
      ...init?.headers,
    },
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as ApiError | null;
    throw new ApiRequestError(
      res.status,
      body?.error ?? "UNKNOWN_ERROR",
      body?.message ?? `Request failed with status ${res.status}`,
    );
  }
  return res.json() as Promise<T>;
}

export function listRequests(params: { status?: Status; priority?: Priority; page?: number; size?: number }) {
  const qs = new URLSearchParams();
  if (params.status) qs.set("status", params.status);
  if (params.priority) qs.set("priority", params.priority);
  qs.set("page", String(params.page ?? 0));
  qs.set("size", String(params.size ?? 10));
  return request<PaginatedResponse<ServiceRequest>>(`/api/requests?${qs}`);
}

export function getRequest(id: number | string) {
  return request<ServiceRequestDetail>(`/api/requests/${id}`);
}

export function createRequest(data: { title: string; description?: string; priority: Priority }) {
  return request<ServiceRequest>("/api/requests", { method: "POST", body: JSON.stringify(data) });
}

export function updateStatus(id: number | string, data: { status: Status; resolutionNote?: string }) {
  return request<ServiceRequest>(`/api/requests/${id}/status`, { method: "PATCH", body: JSON.stringify(data) });
}

export function resetData() {
  return request<unknown>("/api/reset", { method: "POST" });
}