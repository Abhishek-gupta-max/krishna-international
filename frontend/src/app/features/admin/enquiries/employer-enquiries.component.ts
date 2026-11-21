import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, finalize, merge } from 'rxjs';
import { AppError, PageMeta } from '../../../core/models/api.models';
import { EmployerEnquiry, EmployerEnquiryStatus } from '../../../core/models/domain.models';
import { AdminApiService } from '../../../core/services/admin-api.service';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmService } from '../../../shared/components/confirm-dialog/confirm.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { LabelPipe, TimeAgoPipe } from '../../../shared/pipes/labels.pipes';
import { EncodeUriPipe } from '../../../shared/pipes/encode-uri.pipe';

@Component({
  selector: 'app-employer-enquiries',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe, IconComponent, PaginationComponent, LabelPipe, TimeAgoPipe, EncodeUriPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './employer-enquiries.component.html',
  styleUrl: './enquiries.scss',
})
export class EmployerEnquiriesComponent implements OnInit {
  private readonly api = inject(AdminApiService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly statuses: EmployerEnquiryStatus[] = ['new', 'in_progress', 'closed'];
  protected readonly search = new FormControl('', { nonNullable: true });
  protected readonly filter = new FormControl('', { nonNullable: true });
  protected readonly items = signal<EmployerEnquiry[]>([]);
  protected readonly meta = signal<PageMeta | null>(null);
  protected readonly loading = signal(true);
  protected readonly selected = signal<EmployerEnquiry | null>(null);
  protected readonly saving = signal(false);
  protected readonly status = new FormControl<EmployerEnquiryStatus>('new', { nonNullable: true });
  protected readonly notes = new FormControl('', { nonNullable: true });

  ngOnInit(): void {
    this.load(1);
    merge(this.search.valueChanges.pipe(debounceTime(300), distinctUntilChanged()), this.filter.valueChanges)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.load(1));
    const open = Number(this.route.snapshot.queryParamMap.get('open'));
    if (open) this.open(open);
  }

  load(page: number): void {
    this.loading.set(true);
    this.api.employerEnquiries({ page, limit: 15, search: this.search.value, status: this.filter.value }).subscribe({
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

  open(id: number): void {
    this.api.employerEnquiry(id).subscribe({
      next: (e) => {
        this.selected.set(e);
        this.status.setValue(e.status);
        this.notes.setValue(e.adminNotes ?? '');
        this.router.navigate([], { queryParams: { open: id }, replaceUrl: true });
        setTimeout(() => document.getElementById('enquiry-detail')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }));
      },
      error: (e: AppError) => this.toast.error(e.message),
    });
  }

  close(): void {
    this.selected.set(null);
    this.router.navigate([], { queryParams: {}, replaceUrl: true });
  }

  save(): void {
    const sel = this.selected();
    if (!sel) return;
    this.saving.set(true);
    this.api
      .updateEmployerEnquiry(sel.id, { status: this.status.value, adminNotes: this.notes.value })
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (e) => {
          this.selected.set(e);
          this.items.update((list) => list.map((i) => (i.id === e.id ? e : i)));
          this.toast.success('Enquiry updated.');
        },
        error: (e: AppError) => this.toast.error(e.message),
      });
  }

  async remove(): Promise<void> {
    const sel = this.selected();
    if (!sel) return;
    const ok = await this.confirm.ask({
      title: 'Delete this enquiry?',
      message: `The enquiry from ${sel.employer.companyName} will be removed.`,
      confirmLabel: 'Delete',
      danger: true,
    });
    if (!ok) return;
    this.api.deleteEmployerEnquiry(sel.id).subscribe({
      next: () => {
        this.toast.success('Enquiry deleted.');
        this.close();
        this.load(this.meta()?.page ?? 1);
      },
      error: (e: AppError) => this.toast.error(e.message),
    });
  }
}
