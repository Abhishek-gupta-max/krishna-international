import { ChangeDetectionStrategy, Component, ElementRef, inject, input, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AppError } from '../../../../core/models/api.models';
import { JobStatus } from '../../../../core/models/domain.models';
import { DESTINATION_COUNTRIES, INDUSTRIES } from '../../../../core/models/reference-data';
import { AdminApiService, JobInput } from '../../../../core/services/admin-api.service';
import { applyServerErrors, focusFirstInvalid } from '../../../../core/services/form-utils';
import { ToastService } from '../../../../core/services/toast.service';
import { FieldErrorComponent } from '../../../../shared/components/field-error/field-error.component';
import { IconComponent } from '../../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-job-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, FieldErrorComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.Default,
  templateUrl: './job-form.component.html',
})
export class JobFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(AdminApiService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly host = inject(ElementRef<HTMLElement>);

  /** Route param (absent when creating). */
  readonly id = input<string>();

  protected readonly countries = DESTINATION_COUNTRIES.filter((c) => c !== 'Other');
  protected readonly industries = INDUSTRIES;
  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly currentStatus = signal<JobStatus | null>(null);
  protected readonly slug = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(150)]],
    country: ['', [Validators.required, Validators.maxLength(80)]],
    city: ['', Validators.maxLength(80)],
    industry: ['', Validators.required],
    employmentType: ['contract' as JobInput['employmentType'], Validators.required],
    experience: ['', [Validators.required, Validators.maxLength(80)]],
    salary: ['', Validators.maxLength(120)],
    vacancies: [null as number | null, [Validators.min(1), Validators.max(10000)]],
    description: ['', [Validators.required, Validators.minLength(20)]],
    requirements: ['', [Validators.required, Validators.minLength(5)]],
    benefits: [''],
    applicationDeadline: [''],
    isFeatured: [false],
  });

  get isEdit(): boolean {
    return !!this.id();
  }

  ngOnInit(): void {
    const id = Number(this.id());
    if (!id) return;
    this.loading.set(true);
    this.api.job(id).subscribe({
      next: (job) => {
        this.form.patchValue({
          title: job.title,
          country: job.country,
          city: job.city ?? '',
          industry: job.industry,
          employmentType: job.employmentType,
          experience: job.experience,
          salary: job.salary ?? '',
          vacancies: job.vacancies,
          description: job.description,
          requirements: job.requirements,
          benefits: job.benefits ?? '',
          applicationDeadline: job.applicationDeadline ? String(job.applicationDeadline).slice(0, 10) : '',
          isFeatured: job.isFeatured,
        });
        this.currentStatus.set(job.status ?? 'draft');
        this.slug.set(job.slug);
        this.loading.set(false);
      },
      error: (e: AppError) => {
        this.loading.set(false);
        this.error.set(e.message);
      },
    });
  }

  save(status: JobStatus): void {
    this.error.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      focusFirstInvalid(this.host.nativeElement);
      return;
    }
    const v = this.form.getRawValue();
    const payload: JobInput = {
      ...v,
      city: v.city || null,
      salary: v.salary || null,
      vacancies: v.vacancies ? Number(v.vacancies) : null,
      benefits: v.benefits || null,
      applicationDeadline: v.applicationDeadline || null,
      status,
    };

    this.saving.set(true);
    const req = this.isEdit ? this.api.updateJob(Number(this.id()), payload) : this.api.createJob(payload);
    req.pipe(finalize(() => this.saving.set(false))).subscribe({
      next: (job) => {
        this.toast.success(
          status === 'published' ? `“${job.title}” saved and published.` : status === 'closed' ? `“${job.title}” saved as closed.` : `“${job.title}” saved as draft.`
        );
        this.router.navigate(['/admin/jobs']);
      },
      error: (e: AppError) => {
        applyServerErrors(this.form, e);
        this.error.set(e.message);
      },
    });
  }
}
