import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged, merge } from 'rxjs';
import { AppError, PageMeta } from '../../../core/models/api.models';
import { Application } from '../../../core/models/domain.models';
import { AdminApiService } from '../../../core/services/admin-api.service';
import { ToastService } from '../../../core/services/toast.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { LabelPipe, TimeAgoPipe } from '../../../shared/pipes/labels.pipes';
import { downloadCv } from './cv-download';

@Component({
  selector: 'app-application-list',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, IconComponent, PaginationComponent, LabelPipe, TimeAgoPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="admin-page">
      <div class="admin-head">
        <div>
          <h1>Candidate applications</h1>
          <p>Registrations and job applications submitted on the website.</p>
        </div>
      </div>

      @if (jobFilter()) {
        <div class="alert alert--info">
          <app-icon name="filter" />
          <p>Showing applications for one job. <a [routerLink]="[]" (click)="clearJob()">Show all applications</a></p>
        </div>
      }

      <section class="panel">
        <div class="toolbar toolbar--apps">
          <input class="input" type="search" [formControl]="search" placeholder="Search name, email, mobile or category" aria-label="Search applications" />
          <select class="select" [formControl]="status" aria-label="Filter by status">
            <option value="">All statuses</option>
            @for (s of statuses; track s) {
              <option [value]="s">{{ s | label }}</option>
            }
          </select>
          <select class="select" [formControl]="source" aria-label="Filter by type">
            <option value="">All types</option>
            <option value="job_application">Job applications</option>
            <option value="registration">General registrations</option>
          </select>
        </div>

        @if (loading()) {
          <div class="panel__body"><div class="skeleton" style="height: 240px"></div></div>
        } @else if (items().length) {
          <div class="table-wrap">
            <table class="table">
              <thead>
                <tr>
                  <th scope="col">Candidate</th>
                  <th scope="col">Applied for</th>
                  <th scope="col">Experience</th>
                  <th scope="col">Status</th>
                  <th scope="col">Received</th>
                  <th scope="col"><span class="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                @for (a of items(); track a.id) {
                  <tr>
                    <td class="td-main">
                      <a class="cell-title" [routerLink]="['/admin/applications', a.id]">{{ a.candidate.fullName }}</a>
                      <span class="cell-sub">{{ a.candidate.mobile }} · {{ a.candidate.email }}</span>
                    </td>
                    <td data-label="Applied for">
                      <div>{{ a.job ? a.job.title : 'General registration' }}
                      <span class="cell-sub">{{ a.candidate.preferredCategory }} · {{ a.candidate.preferredCountry }}</span></div>
                    </td>
                    <td data-label="Experience">{{ a.candidate.experienceYears }} yrs</td>
                    <td data-label="Status"><span class="badge badge--{{ a.status }}">{{ a.status | label }}</span></td>
                    <td data-label="Received">{{ a.createdAt | timeAgo }}</td>
                    <td data-label="">
                      <div class="cell-actions">
                        @if (a.candidate.hasCv) {
                          <button type="button" class="icon-btn" (click)="download(a)" aria-label="Download CV" title="Download CV"><app-icon name="download" [size]="16" /></button>
                        }
                        <a class="icon-btn" [routerLink]="['/admin/applications', a.id]" aria-label="View details" title="View"><app-icon name="eye" [size]="16" /></a>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          <div class="admin-pager">
            <span>{{ meta()?.total }} applications</span>
            <app-pagination [meta]="meta()" (pageChange)="load($event)" />
          </div>
        } @else {
          <div class="admin-empty">
            <app-icon name="users" [size]="32" />
            <p>{{ hasFilters() ? 'No applications match your filters.' : 'No applications have been received yet.' }}</p>
          </div>
        }
      </section>
    </div>
  `,
  styles: `@media (min-width: 768px) { .toolbar--apps { grid-template-columns: minmax(0, 1fr) 180px 200px; } }`,
})
export class ApplicationListComponent implements OnInit {
  private readonly api = inject(AdminApiService);
  private readonly toast = inject(ToastService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly statuses = ['new', 'reviewed', 'shortlisted', 'rejected', 'hired'];
  protected readonly search = new FormControl('', { nonNullable: true });
  protected readonly status = new FormControl('', { nonNullable: true });
  protected readonly source = new FormControl('', { nonNullable: true });
  protected readonly items = signal<Application[]>([]);
  protected readonly meta = signal<PageMeta | null>(null);
  protected readonly loading = signal(true);
  protected readonly jobFilter = signal<number | null>(null);

  ngOnInit(): void {
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((p) => {
      this.jobFilter.set(Number(p.get('jobId')) || null);
      this.load(1);
    });
    merge(this.search.valueChanges.pipe(debounceTime(300), distinctUntilChanged()), this.status.valueChanges, this.source.valueChanges)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.load(1));
  }

  hasFilters(): boolean {
    return !!(this.search.value || this.status.value || this.source.value || this.jobFilter());
  }

  clearJob(): void {
    this.router.navigate([], { queryParams: {} });
  }

  load(page: number): void {
    this.loading.set(true);
    this.api
      .applications({ page, limit: 20, search: this.search.value, status: this.status.value, source: this.source.value, jobId: this.jobFilter() })
      .subscribe({
        next: (res) => {
          this.items.set(res.items);
          this.meta.set(res.meta);
          this.loading.set(false);
        },
        error: (e: AppError) => {
          this.loading.set(false);
          this.toast.error(e.message);
        },
      });
  }

  download(a: Application): void {
    downloadCv(this.api, this.toast, a);
  }
}
