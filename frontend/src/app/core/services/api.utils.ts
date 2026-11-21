import { HttpParams } from '@angular/common/http';
import { map, OperatorFunction } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, Paged } from '../models/api.models';

export const API = environment.apiUrl;

/** Build HttpParams from an object, skipping empty values. */
export function toParams(obj: Record<string, unknown>): HttpParams {
  let params = new HttpParams();
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === null || value === '') continue;
    params = params.set(key, String(value));
  }
  return params;
}

export const unwrap = <T>(): OperatorFunction<ApiResponse<T>, T> => map((res) => res.data);

export const toPaged = <T>(): OperatorFunction<ApiResponse<T[]>, Paged<T>> =>
  map((res) => ({
    items: res.data,
    meta: res.meta ?? { page: 1, limit: res.data.length, total: res.data.length, totalPages: 1 },
  }));

/** Resolve a server-relative media path (e.g. /uploads/gallery/x.webp) to a full URL. */
export function mediaUrl(path: string): string {
  return path.startsWith('http') ? path : `${environment.mediaUrl}${path}`;
}

/** Convert a plain object to multipart FormData (for file uploads). */
export function toFormData(obj: Record<string, unknown>, file?: { field: string; file: File | null }): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === null) continue;
    fd.append(key, String(value));
  }
  if (file?.file) fd.append(file.field, file.file, file.file.name);
  return fd;
}
