import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, debounceTime, distinctUntilChanged, map, of, switchMap, tap } from 'rxjs';
import { PageMeta } from '../../../core/models/api.models';
import { Job, JobFilters } from '../../../core/models/domain.models';
import { PublicApiService } from '../../../core/services/public-api.service';
import { SettingsService } from '../../../core/services/settings.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { JobCardComponent } from '../../../shared/components/job-card/job-card.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-job-list',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, PageHeaderComponent, JobCardComponent, PaginationComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './job-list.component.html',
  styleUrl: './job-list.component.scss',
})
export class JobListComponent implements OnInit {
  private readonly api = inject(PublicApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly site = inject(SettingsService);

  protected readonly search = new FormControl('', { nonNullable: true });
  protected readonly country = new FormControl('', { nonNullable: true });
  protected readonly industry = new FormControl('', { nonNullable: true });

  protected readonly jobs = signal<Job[]>([]);
  protected readonly meta = signal<PageMeta | null>(null);
  protected readonly filters = signal<JobFilters>({ countries: [], industries: [] });
  protected readonly loading = signal(true);
  protected readonly failed = signal(false);

  ngOnInit(): void {
    this.api
      .jobFilters()
      .pipe(catchError(() => of({ countries: [], industries: [] })))
      .subscribe((f) => this.filters.set(f));

    // URL query params are the single source of truth, so filtered results are shareable.
    this.route.queryParamMap
      .pipe(
        map((p) => ({
          search: p.get('search') ?? '',
          country: p.get('country') ?? '',
          industry: p.get('industry') ?? '',
          page: Math.max(1, Number(p.get('page')) || 1),
        })),
        tap((q) => {
          this.search.setValue(q.search, { emitEvent: false });
          this.country.setValue(q.country, { emitEvent: false });
          this.industry.setValue(q.industry, { emitEvent: false });
          this.loading.set(true);
          this.failed.set(false);
        }),
        switchMap((q) =>
          this.api.jobs({ ...q, limit: 12 }).pipe(
            catchError(() => {
              this.failed.set(true);
              return of({ items: [] as Job[], meta: null });
            })
          )
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((res) => {
        this.jobs.set(res.items);
        this.meta.set(res.meta);
        this.loading.set(false);
      });

    this.search.valueChanges
      .pipe(debounceTime(350), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((search) => this.navigate({ search }));
    this.country.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((country) => this.navigate({ country }));
    this.industry.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((industry) => this.navigate({ industry }));
  }

  protected get hasFilters(): boolean {
    return !!(this.search.value || this.country.value || this.industry.value);
  }

  protected clear(): void {
    this.router.navigate([], { queryParams: {} });
  }

  protected goToPage(page: number): void {
    this.navigate({ page }, false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private navigate(params: Record<string, string | number>, resetPage = true): void {
    const queryParams: Record<string, string | number | null> = { ...params };
    for (const k of Object.keys(queryParams)) if (queryParams[k] === '') queryParams[k] = null;
    if (resetPage) queryParams['page'] = null;
    this.router.navigate([], { queryParams, queryParamsHandling: 'merge' });
  }
}
