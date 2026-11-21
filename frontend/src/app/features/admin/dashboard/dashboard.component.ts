import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DashboardSummary } from '../../../core/models/domain.models';
import { AdminApiService } from '../../../core/services/admin-api.service';
import { AuthService } from '../../../core/services/auth.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { LabelPipe, TimeAgoPipe } from '../../../shared/pipes/labels.pipes';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, DatePipe, IconComponent, LabelPipe, TimeAgoPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private readonly api = inject(AdminApiService);
  protected readonly auth = inject(AuthService);

  protected readonly data = signal<DashboardSummary | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly hover = signal<number | null>(null);
  protected readonly isManager = computed(() => this.auth.hasRole('super_admin', 'admin'));

  protected readonly tiles = computed(() => {
    const t = this.data()?.totals;
    if (!t) return [];
    const all = [
      { label: 'Total jobs', value: t.totalJobs, note: 'All non-deleted vacancies', link: '/admin/jobs', manager: false },
      { label: 'Active jobs', value: t.activeJobs, note: 'Published and open', link: '/admin/jobs', manager: false },
      { label: 'Total applications', value: t.totalApplications, note: `${t.applicationsLast7Days} in the last 7 days`, link: '/admin/applications', manager: true },
      { label: 'New applications', value: t.newApplications, note: 'Awaiting review', link: '/admin/applications', manager: true, highlight: t.newApplications > 0 },
      { label: 'Employer enquiries', value: t.employerEnquiries, note: `${t.newEmployerEnquiries} new`, link: '/admin/employer-enquiries', manager: true, highlight: t.newEmployerEnquiries > 0 },
      { label: 'Contact messages', value: t.contactMessages, note: `${t.newContactMessages} unread`, link: '/admin/messages', manager: true, highlight: t.newContactMessages > 0 },
    ];
    return this.isManager() ? all : all.filter((x) => !x.manager);
  });

  /** Bar chart geometry for the 14-day application trend. */
  protected readonly chart = computed(() => {
    const trend = this.data()?.applicationTrend ?? [];
    const max = Math.max(1, ...trend.map((d) => d.count));
    // Round the axis maximum up to a clean number.
    const step = max <= 4 ? 1 : max <= 10 ? 2 : Math.ceil(max / 5);
    const top = Math.ceil(max / step) * step;
    const ticks: number[] = [];
    for (let v = 0; v <= top; v += step) ticks.push(v);
    return {
      top,
      ticks,
      bars: trend.map((d) => ({ ...d, pct: (d.count / top) * 100 })),
      total: trend.reduce((a, d) => a + d.count, 0),
    };
  });

  ngOnInit(): void {
    this.api.dashboard().subscribe({
      next: (d) => this.data.set(d),
      error: (e) => this.error.set(e.message),
    });
  }

  protected activityText(a: DashboardSummary['recentActivity'][number]): string {
    const entities: Record<string, string> = {
      job: 'a job',
      application: 'an application',
      employer_enquiry: 'an employer enquiry',
      contact_enquiry: 'a contact message',
      gallery: 'a gallery image',
      settings: 'the website settings',
    };
    const verbs: Record<string, string> = {
      create: 'created',
      update: 'updated',
      delete: 'deleted',
      status_published: 'published',
      status_draft: 'unpublished',
      status_closed: 'closed',
    };
    const who = a.adminName ?? 'An admin';
    if (a.action === 'login') return `${who} signed in`;
    if (a.action === 'logout') return `${who} signed out`;
    if (a.action === 'change_password') return `${who} changed their password`;
    if (a.action === 'download_cv') return `${who} downloaded a candidate CV`;
    const entity = entities[a.entityType] ?? a.entityType.replace(/_/g, ' ');
    return `${who} ${verbs[a.action] ?? a.action.replace(/_/g, ' ')} ${entity}`;
  }
}
