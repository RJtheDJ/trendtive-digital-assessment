export const STATUSES = ["OPEN", "IN_PROGRESS", "DONE"] as const;
export const PRIORITIES = ["LOW", "MEDIUM", "HIGH"] as const;

export type Status = (typeof STATUSES)[number];
export type Priority = (typeof PRIORITIES)[number];

export interface StatusHistoryItem{
    id: number;
    fromStatus: Status | null;
    toStatus: Status;
    note: string | null;
    changedAt: string; // ISO 8601 date string
}

export interface ServiceRequest {
  id: number;
  title: string;
  description: string | null;
  priority: Priority;
  status: Status;
  resolutionNote: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceRequestDetail extends ServiceRequest {
  history: StatusHistoryItem[]; 
}

export interface PaginatedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface ApiError {
  error: string;   
  message: string; 
  status: number;
}

// What the List page reads
export interface ListQuery {
  status?: Status;
  priority?: Priority;
  page: number;
}