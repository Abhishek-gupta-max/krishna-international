export type JobStatus = 'draft' | 'published' | 'closed';
export type EmploymentType = 'full_time' | 'contract' | 'part_time';
export type ApplicationStatus = 'new' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired';
export type EmployerEnquiryStatus = 'new' | 'in_progress' | 'closed';
export type ContactStatus = 'new' | 'read' | 'replied' | 'archived';
export type GalleryCategory = 'recruitment' | 'workforce' | 'events' | 'office';
export type AdminRole = 'super_admin' | 'admin' | 'editor';

export interface Job {
  id: number;
  slug: string;
  title: string;
  country: string;
  city: string | null;
  industry: string;
  employmentType: EmploymentType;
  experience: string;
  salary: string | null;
  vacancies: number | null;
  description: string;
  requirements: string;
  benefits: string | null;
  isFeatured: boolean;
  applicationDeadline: string | null;
  publishedAt: string | null;
  // admin-only
  status?: JobStatus;
  applicationsCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface JobFilters {
  countries: string[];
  industries: string[];
}

export interface Candidate {
  id: number;
  fullName: string;
  mobile: string;
  email: string;
  qualification: string;
  experienceYears: number;
  currentLocation: string | null;
  preferredCountry: string;
  preferredCategory: string;
  passportAvailable: boolean | null;
  hasCv: boolean;
  cvOriginalName: string | null;
  cvSize: number | null;
}

export interface Application {
  id: number;
  source: 'job_application' | 'registration';
  status: ApplicationStatus;
  coverNote: string | null;
  adminNotes: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
  job: { id: number; title: string; country: string; slug: string } | null;
  candidate: Candidate;
}

export interface EmployerEnquiry {
  id: number;
  status: EmployerEnquiryStatus;
  manpowerRequirements: string;
  employeesRequired: number;
  message: string | null;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
  employer: {
    id: number;
    companyName: string;
    contactPerson: string;
    email: string;
    phone: string;
    country: string;
    industry: string;
  };
}

export interface ContactEnquiry {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: ContactStatus;
  createdAt: string;
  updatedAt: string;
}

export interface GalleryItem {
  id: number;
  title: string;
  caption: string | null;
  category: GalleryCategory;
  imageUrl: string;
  thumbUrl: string;
  width: number | null;
  height: number | null;
  sortOrder?: number;
  isPublished?: boolean;
  createdAt?: string;
}

export interface Testimonial {
  name: string;
  role?: string;
  quote: string;
}

/** Public settings returned by GET /settings/public. */
export interface SiteSettings {
  company_name: string;
  contact_person: string;
  email: string;
  phone_primary: string;
  phone_alternate: string;
  whatsapp_number: string;
  whatsapp_number_alt: string;
  whatsapp_number_alt2: string;
  address: string;
  business_type: string;
  registration_number: string;
  registration_authority: string;
  registered_owner: string;
  office_hours: string;
  map_query: string;
  facebook_url: string;
  instagram_url: string;
  linkedin_url: string;
  youtube_url: string;
  hero_title: string;
  hero_subtitle: string;
  about_summary: string;
  about_body: string;
  vision: string;
  mission: string;
  objectives: string[];
  management_intro: string;
  testimonials: Testimonial[];
  meta_description: string;
}

export interface Admin {
  id: number;
  name: string;
  email: string;
  role: AdminRole;
  lastLoginAt: string | null;
}

export interface DashboardSummary {
  totals: {
    totalJobs: number;
    activeJobs: number;
    totalApplications: number;
    newApplications: number;
    applicationsLast7Days: number;
    employerEnquiries: number;
    newEmployerEnquiries: number;
    contactMessages: number;
    newContactMessages: number;
  };
  applicationTrend: { date: string; count: number }[];
  recentApplications: Application[];
  recentEnquiries: EmployerEnquiry[];
  recentActivity: { id: number; action: string; entityType: string; entityId: number | null; adminName: string | null; createdAt: string }[];
}

export type SettingsGroups = Record<string, Record<string, { value: unknown; type: 'string' | 'text' | 'json' | 'boolean'; updatedAt: string }>>;
