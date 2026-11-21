import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse, Paged } from '../models/api.models';
import { Job, JobFilters } from '../models/domain.models';
import { API, toFormData, toPaged, toParams, unwrap } from './api.utils';

export interface JobQuery {
  page?: number;
  limit?: number;
  search?: string;
  country?: string;
  industry?: string;
  featured?: boolean;
}

export interface CandidatePayload {
  fullName: string;
  mobile: string;
  email: string;
  qualification: string;
  experienceYears: number;
  currentLocation?: string | null;
  preferredCountry: string;
  preferredCategory: string;
  passportAvailable?: boolean | null;
  jobId?: number | null;
  coverNote?: string | null;
  consent: boolean;
}

export interface EmployerPayload {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  country: string;
  industry: string;
  manpowerRequirements: string;
  employeesRequired: number;
  message?: string | null;
}

export interface ContactPayload {
  name: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
}

/** Endpoints used by the public website. */
@Injectable({ providedIn: 'root' })
export class PublicApiService {
  private readonly http = inject(HttpClient);

  jobs(query: JobQuery): Observable<Paged<Job>> {
    return this.http.get<ApiResponse<Job[]>>(`${API}/jobs`, { params: toParams({ ...query }) }).pipe(toPaged());
  }

  jobFilters(): Observable<JobFilters> {
    return this.http.get<ApiResponse<JobFilters>>(`${API}/jobs/filters`).pipe(unwrap());
  }

  job(slug: string): Observable<Job> {
    return this.http.get<ApiResponse<Job>>(`${API}/jobs/${encodeURIComponent(slug)}`).pipe(unwrap());
  }

  submitApplication(payload: CandidatePayload, cv: File | null): Observable<ApiResponse<{ applicationId: number }>> {
    const body = toFormData({ ...payload }, { field: 'cv', file: cv });
    return this.http.post<ApiResponse<{ applicationId: number }>>(`${API}/applications`, body);
  }

  submitEmployerEnquiry(payload: EmployerPayload): Observable<ApiResponse<{ enquiryId: number }>> {
    return this.http.post<ApiResponse<{ enquiryId: number }>>(`${API}/employer-enquiries`, payload);
  }

  submitContact(payload: ContactPayload): Observable<ApiResponse<{ enquiryId: number }>> {
    return this.http.post<ApiResponse<{ enquiryId: number }>>(`${API}/contact`, payload);
  }
}
