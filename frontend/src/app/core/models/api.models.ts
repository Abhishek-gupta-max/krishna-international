/** Standard envelope returned by every API endpoint. */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: PageMeta;
  errors?: FieldError[];
}

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface FieldError {
  field: string;
  message: string;
}

export interface Paged<T> {
  items: T[];
  meta: PageMeta;
}

/** Normalised error thrown by the error interceptor. */
export interface AppError {
  status: number;
  message: string;
  errors?: FieldError[];
}
