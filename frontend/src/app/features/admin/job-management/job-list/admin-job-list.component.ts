import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged, merge } from 'rxjs';
import { AppError, PageMeta } from '../../../../core/models/api.models';
import { Job, JobStatus } from '../../../../core/models/domain.models';
import { AdminApiService } from '../../../../core/services/admin-api.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import { ConfirmService } from '../../../../shared/components/confirm-dialog/confirm.service';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { LabelPipe } from '../../../../shared/pipes/labels.pipes';

@Component({
  selector: 'app-admin-job-list',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, DatePipe, IconComponent, PaginationComponent, LabelPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="admin-page">
      <div class="admin-head">
        <div>
          <h1>Jobs</h1>
          <p>Create vacancies, publish them to the website and close them when filled.</p>
        </div>
        <a routerLink="/admin/jobs/new" class="btn btn--sm"><app-icon name="plus" [size]="16" /> Add new job</a>
      </div>

      <section class="panel">
        <div class="toolbar">
          <input class="input" type="search" [formControl]="search" placeholder="Search title, country or industry" aria-label="Search jobs" />
          <select class="select" [formControl]="status" aria-label="Filter by status">
            <option value="">All statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="closed">Closed</option>
          </select>
          <span class="muted">{{ meta()?.total ?? 0 }} jobs</span>
        </div>

        @if (loading()) {
          <div class="panel__body"><div class="skeleton" style="height: 220px"></div></div>
        } @else if (jobs().length) {
          <div class="table-wrap">
            <table class="table">
              <thead>
                <tr>
                  <th scope="col">Job</th>
                  <th scope="col">Industry</th>
                  <th scope="col">Status</th>
                  <th scope="col">Applications</th>
                  <th scope="col">Updated</th>
                  <th scope="col"><span class="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                @for (j of jobs(); track j.id) {
                  <tr>
                    <td class="td-main">
                      <a class="cell-title" [routerLink]="['/admin/jobs', j.id, 'edit']">{{ j.title }}</a>
                      <span class="cell-sub">{{ j.city ? j.city + ', ' : '' }}{{ j.country }}{{ j.isFeatured ? ' · Featured' : '' }}</span>
                    </td>
                    <td data-label="Industry">{{ j.industry }}</td>
                    <td data-label="Status"><span class="badge badge--{{ j.status }}">{{ j.status | label }}</span></td>
                    <td data-label="Applications">
                      @if (canSeeApplications && j.applicationsCount) {
                        <a [routerLink]="'/admin/applications'" [queryParams]="{ jobId: j.id }">{{ j.applicationsCount }}</a>
                      } @else {
                        {{ j.applicationsCount }}
                      }
                    </td>
                    <td data-label="Updated">{{ j.updatedAt | date: 'd MMM y' }}</td>
                    <td data-label="">
                      <div class="cell-actions">
                        @if (j.status === 'published') {
                          <button type="button" class="btn btn--outline btn--sm" (click)="setStatus(j, 'draft')" [disabled]="busy() === j.id">Unpublish</button>
                        } @else {
                          <button type="button" class="btn btn--sm" (click)="setStatus(j, 'published')" [disabled]="busy() === j.id">Publish</button>
                        }
                        @if (j.status === 'published') {
                          <a class="icon-btn" [href]="'/jobs/' + j.slug" target="_blank" rel="noopener" aria-label="View on website" title="View on website"><app-icon name="external" [size]="16" /></a>
                        }
                        <a class="icon-btn" [routerLink]="['/admin/jobs', j.id, 'edit']" aria-label="Edit job" title="Edit"><app-icon name="edit" [size]="16" /></a>
                        @if (canDelete) {
                          <button type="button" class="icon-btn icon-btn--danger" (click)="remove(j)" aria-label="Delete job" title="Delete"><app-icon name="trash" [size]="16" /></button>
                        }
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          <div class="admin-pager">
            <span>Page {{ meta()?.page }} of {{ meta()?.totalPages }}</span>
            <app-pagination [meta]="meta()" (pageChange)="load($event)" />
          </div>
        } @else {
          <div class="admin-empty">
            <app-icon name="briefcase" [size]="32" />
            <p>{{ search.value || status.value ? 'No jobs match your filters.' : 'No jobs yet. Add your first vacancy to publish it on the website.' }}</p>
            @if (!search.value && !status.value) {
              <a routerLink="/admin/jobs/new" class="btn btn--sm">Add new job</a>
            }
          </div>
        }
      </section>
    </div>
  `,
  styles: `.muted { font-size: var(--fs-sm); color: var(--grey-500); white-space: nowrap; }`,
})
export class AdminJobListComponent implements OnInit {
  private readonly api = inject(AdminApiService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly auth = inject(AuthService);

  protected readonly search = new FormControl('', { nonNullable: true });
  protected readonly status = new FormControl('', { nonNullable: true });
  protected readonly jobs = signal<Job[]>([]);
  protected readonly meta = signal<PageMeta | null>(null);
  protected readonly loading = signal(true);
  protected readonly busy = signal<number | null>(null);
  protected readonly canDelete = this.auth.hasRole('super_admin', 'admin');
  protected readonly canSeeApplications = this.canDelete;

  ngOnInit(): void {
    this.load(1);
    merge(this.search.valueChanges.pipe(debounceTime(300), distinctUntilChanged()), this.status.valueChanges)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.load(1));
  }

  load(page: number): void {
    this.loading.set(true);
    this.api.jobs({ page, limit: 20, search: this.search.value, status: this.status.value }).subscribe({
      next: (res) => {
        this.jobs.set(res.items);
        this.meta.set(res.meta);
        this.loading.set(false);
      },
      error: (e: AppError) => {
        this.loading.set(false);
        this.toast.error(e.message);
      },
    });
  }

  setStatus(job: Job, status: JobStatus): void {
    this.busy.set(job.id);
    this.api.setJobStatus(job.id, status).subscribe({
      next: (updated) => {
        this.jobs.update((list) => list.map((j) => (j.id === job.id ? { ...j, ...updated } : j)));
        this.toast.success(status === 'published' ? `“${job.title}” is now live on the website.` : `“${job.title}” has been unpublished.`);
        this.busy.set(null);
      },
      error: (e: AppError) => {
        this.toast.error(e.message);
        this.busy.set(null);
      },
    });
  }

  async remove(job: Job): Promise<void> {
    const ok = await this.confirm.ask({
      title: 'Delete this job?',
      message: `“${job.title}” will be removed from the website and the admin list. Existing applications are kept.`,
      confirmLabel: 'Delete job',
      danger: true,
    });
    if (!ok) return;
    this.api.deleteJob(job.id).subscribe({
      next: () => {
        this.toast.success('Job deleted.');
        this.load(this.meta()?.page ?? 1);
      },
      error: (e: AppError) => this.toast.error(e.message),
    });
  }
}
