import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse, Paged } from '../models/api.models';
import {
  Application,
  ApplicationStatus,
  ContactEnquiry,
  ContactStatus,
  DashboardSummary,
  EmployerEnquiry,
  EmployerEnquiryStatus,
  GalleryItem,
  Job,
  JobStatus,
  SettingsGroups,
} from '../models/domain.models';
import { API, toFormData, toPaged, toParams, unwrap } from './api.utils';

export interface ListQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  [key: string]: unknown;
}

export type JobInput = Omit<Job, 'id' | 'slug' | 'publishedAt' | 'applicationsCount' | 'createdAt' | 'updatedAt'>;

/** Endpoints used by the admin panel. All require an authenticated session. */
@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${API}/admin`;

  // Dashboard
  dashboard(): Observable<DashboardSummary> {
    return this.http.get<ApiResponse<DashboardSummary>>(`${this.base}/dashboard`).pipe(unwrap());
  }

  // Jobs
  jobs(q: ListQuery): Observable<Paged<Job>> {
    return this.http.get<ApiResponse<Job[]>>(`${this.base}/jobs`, { params: toParams(q) }).pipe(toPaged());
  }
  job(id: number): Observable<Job> {
    return this.http.get<ApiResponse<Job>>(`${this.base}/jobs/${id}`).pipe(unwrap());
  }
  createJob(input: JobInput): Observable<Job> {
    return this.http.post<ApiResponse<Job>>(`${this.base}/jobs`, input).pipe(unwrap());
  }
  updateJob(id: number, input: JobInput): Observable<Job> {
    return this.http.put<ApiResponse<Job>>(`${this.base}/jobs/${id}`, input).pipe(unwrap());
  }
  setJobStatus(id: number, status: JobStatus): Observable<Job> {
    return this.http.patch<ApiResponse<Job>>(`${this.base}/jobs/${id}/status`, { status }).pipe(unwrap());
  }
  deleteJob(id: number): Observable<unknown> {
    return this.http.delete(`${this.base}/jobs/${id}`);
  }

  // Applications
  applications(q: ListQuery): Observable<Paged<Application>> {
    return this.http.get<ApiResponse<Application[]>>(`${this.base}/applications`, { params: toParams(q) }).pipe(toPaged());
  }
  application(id: number): Observable<Application> {
    return this.http.get<ApiResponse<Application>>(`${this.base}/applications/${id}`).pipe(unwrap());
  }
  updateApplication(id: number, body: { status?: ApplicationStatus; adminNotes?: string }): Observable<Application> {
    return this.http.patch<ApiResponse<Application>>(`${this.base}/applications/${id}`, body).pipe(unwrap());
  }
  deleteApplication(id: number): Observable<unknown> {
    return this.http.delete(`${this.base}/applications/${id}`);
  }
  downloadCv(id: number): Observable<Blob> {
    return this.http.get(`${this.base}/applications/${id}/cv`, { responseType: 'blob' });
  }

  // Employer enquiries
  employerEnquiries(q: ListQuery): Observable<Paged<EmployerEnquiry>> {
    return this.http.get<ApiResponse<EmployerEnquiry[]>>(`${this.base}/employer-enquiries`, { params: toParams(q) }).pipe(toPaged());
  }
  employerEnquiry(id: number): Observable<EmployerEnquiry> {
    return this.http.get<ApiResponse<EmployerEnquiry>>(`${this.base}/employer-enquiries/${id}`).pipe(unwrap());
  }
  updateEmployerEnquiry(id: number, body: { status?: EmployerEnquiryStatus; adminNotes?: string }): Observable<EmployerEnquiry> {
    return this.http.patch<ApiResponse<EmployerEnquiry>>(`${this.base}/employer-enquiries/${id}`, body).pipe(unwrap());
  }
  deleteEmployerEnquiry(id: number): Observable<unknown> {
    return this.http.delete(`${this.base}/employer-enquiries/${id}`);
  }

  // Contact messages
  contactEnquiries(q: ListQuery): Observable<Paged<ContactEnquiry>> {
    return this.http.get<ApiResponse<ContactEnquiry[]>>(`${this.base}/contact-enquiries`, { params: toParams(q) }).pipe(toPaged());
  }
  contactEnquiry(id: number): Observable<ContactEnquiry> {
    return this.http.get<ApiResponse<ContactEnquiry>>(`${this.base}/contact-enquiries/${id}`).pipe(unwrap());
  }
  updateContactEnquiry(id: number, status: ContactStatus): Observable<ContactEnquiry> {
    return this.http.patch<ApiResponse<ContactEnquiry>>(`${this.base}/contact-enquiries/${id}`, { status }).pipe(unwrap());
  }
  deleteContactEnquiry(id: number): Observable<unknown> {
    return this.http.delete(`${this.base}/contact-enquiries/${id}`);
  }

  // Gallery
  gallery(): Observable<GalleryItem[]> {
    return this.http.get<ApiResponse<GalleryItem[]>>(`${this.base}/gallery`).pipe(unwrap());
  }
  uploadGalleryImage(meta: Record<string, unknown>, file: File): Observable<GalleryItem> {
    return this.http.post<ApiResponse<GalleryItem>>(`${this.base}/gallery`, toFormData(meta, { field: 'image', file })).pipe(unwrap());
  }
  updateGalleryItem(id: number, body: Partial<GalleryItem>): Observable<GalleryItem> {
    return this.http.patch<ApiResponse<GalleryItem>>(`${this.base}/gallery/${id}`, body).pipe(unwrap());
  }
  deleteGalleryItem(id: number): Observable<unknown> {
    return this.http.delete(`${this.base}/gallery/${id}`);
  }

  // Settings
  settings(): Observable<SettingsGroups> {
    return this.http.get<ApiResponse<SettingsGroups>>(`${this.base}/settings`).pipe(unwrap());
  }
  saveSettings(settings: Record<string, unknown>): Observable<SettingsGroups> {
    return this.http.put<ApiResponse<SettingsGroups>>(`${this.base}/settings`, { settings }).pipe(unwrap());
  }
}
