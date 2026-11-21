import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';
import { PublicLayoutComponent } from './layouts/public-layout/public-layout.component';

/**
 * Every feature page is lazy loaded. The admin panel is a separate lazy bundle
 * so public visitors never download admin code.
 */
export const routes: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent),
        data: { seo: {} },
      },
      {
        path: 'about',
        loadComponent: () => import('./features/about/about.component').then((m) => m.AboutComponent),
        data: {
          seo: {
            title: 'About Us',
            description: 'About Krishna International Overseas Services — a registered manpower supply firm in Gorakhpur, Uttar Pradesh.',
          },
        },
      },
      {
        path: 'services',
        loadComponent: () => import('./features/services/services.component').then((m) => m.ServicesComponent),
        data: {
          seo: {
            title: 'Our Services',
            description: 'Overseas manpower recruitment, skilled and unskilled workers, construction, industrial, hospitality, healthcare and technical recruitment.',
          },
        },
      },
      {
        path: 'jobs',
        loadComponent: () => import('./features/jobs/job-list/job-list.component').then((m) => m.JobListComponent),
        data: {
          seo: { title: 'Job Opportunities', description: 'Current overseas job vacancies. Search by country and industry and apply online.' },
        },
      },
      {
        path: 'jobs/:slug',
        loadComponent: () => import('./features/jobs/job-detail/job-detail.component').then((m) => m.JobDetailComponent),
        data: { seo: { title: 'Job Details' } },
      },
      {
        path: 'employers',
        loadComponent: () => import('./features/employers/employers.component').then((m) => m.EmployersComponent),
        data: {
          seo: { title: 'Hire Manpower', description: 'Share your manpower requirement with Krishna International Overseas Services.' },
        },
      },
      {
        path: 'candidates',
        loadComponent: () => import('./features/candidates/candidates.component').then((m) => m.CandidatesComponent),
        data: {
          seo: { title: 'Candidate Registration', description: 'Register your profile and upload your CV to be considered for overseas job opportunities.' },
        },
      },
      {
        path: 'gallery',
        loadComponent: () => import('./features/gallery/gallery.component').then((m) => m.GalleryComponent),
        data: { seo: { title: 'Gallery', description: 'Photographs of recruitment activities, workforce and company events.' } },
      },
      {
        path: 'contact',
        loadComponent: () => import('./features/contact/contact.component').then((m) => m.ContactComponent),
        data: {
          seo: { title: 'Contact Us', description: 'Contact Krishna International Overseas Services, Kudaghat, Gorakhpur. Phone +91 98719 62867.' },
        },
      },
    ],
  },
  {
    path: 'admin/login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/admin/login/login.component').then((m) => m.LoginComponent),
    data: { seo: { title: 'Admin Sign In', noindex: true } },
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    loadComponent: () => import('./layouts/admin-layout/admin-layout.component').then((m) => m.AdminLayoutComponent),
    loadChildren: () => import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
    data: { seo: { title: 'Admin', noindex: true } },
  },
  {
    path: '**',
    component: PublicLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./features/not-found/not-found.component').then((m) => m.NotFoundComponent),
        data: { seo: { title: 'Page Not Found', noindex: true } },
      },
    ],
  },
];

