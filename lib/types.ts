export type Status = "OPEN" | "IN_PROGRESS" | "DONE";
export type Priority = "LOW" | "MEDIUM" | "HIGH";

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