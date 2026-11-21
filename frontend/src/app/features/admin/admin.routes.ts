import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/auth.guard';

const managers = roleGuard('super_admin', 'admin');

export const ADMIN_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.component').then((m) => m.DashboardComponent),
    title: 'Dashboard | Admin',
  },
  {
    path: 'jobs',
    loadComponent: () => import('./job-management/job-list/admin-job-list.component').then((m) => m.AdminJobListComponent),
    title: 'Jobs | Admin',
  },
  {
    path: 'jobs/new',
    loadComponent: () => import('./job-management/job-form/job-form.component').then((m) => m.JobFormComponent),
    title: 'New job | Admin',
  },
  {
    path: 'jobs/:id/edit',
    loadComponent: () => import('./job-management/job-form/job-form.component').then((m) => m.JobFormComponent),
    title: 'Edit job | Admin',
  },
  {
    path: 'applications',
    canActivate: [managers],
    loadComponent: () => import('./applications/application-list.component').then((m) => m.ApplicationListComponent),
    title: 'Applications | Admin',
  },
  {
    path: 'applications/:id',
    canActivate: [managers],
    loadComponent: () => import('./applications/application-detail.component').then((m) => m.ApplicationDetailComponent),
    title: 'Application | Admin',
  },
  {
    path: 'employer-enquiries',
    canActivate: [managers],
    loadComponent: () => import('./enquiries/employer-enquiries.component').then((m) => m.EmployerEnquiriesComponent),
    title: 'Employer enquiries | Admin',
  },
  {
    path: 'messages',
    canActivate: [managers],
    loadComponent: () => import('./enquiries/contact-messages.component').then((m) => m.ContactMessagesComponent),
    title: 'Contact messages | Admin',
  },
  {
    path: 'gallery',
    loadComponent: () => import('./gallery/gallery-manager.component').then((m) => m.GalleryManagerComponent),
    title: 'Gallery | Admin',
  },
  {
    path: 'content',
    canActivate: [managers],
    loadComponent: () => import('./settings/content-settings.component').then((m) => m.ContentSettingsComponent),
    title: 'Website content | Admin',
  },
  {
    path: 'settings',
    canActivate: [managers],
    loadComponent: () => import('./settings/company-settings.component').then((m) => m.CompanySettingsComponent),
    title: 'Company settings | Admin',
  },
  {
    path: 'password',
    loadComponent: () => import('./settings/change-password.component').then((m) => m.ChangePasswordComponent),
    title: 'Change password | Admin',
  },
];
