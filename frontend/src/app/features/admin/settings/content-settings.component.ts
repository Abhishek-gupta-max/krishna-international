import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormArray, FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { AppError } from '../../../core/models/api.models';
import { SettingsGroups, Testimonial } from '../../../core/models/domain.models';
import { AdminApiService } from '../../../core/services/admin-api.service';
import { SettingsService } from '../../../core/services/settings.service';
import { ToastService } from '../../../core/services/toast.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-content-settings',
  standalone: true,
  imports: [ReactiveFormsModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.Default,
  templateUrl: './content-settings.component.html',
  styles: `
    .save-bar { position: sticky; bottom: 0; display: flex; align-items: center; gap: 16px; padding: 14px 0; background: var(--grey-50); }
    .list-row { display: flex; gap: 8px; align-items: flex-start; }
    .list-row .input { flex: 1; }
    .t-card { display: grid; gap: 10px; padding: 16px; border: 1px solid var(--color-border); border-radius: var(--radius); background: var(--grey-25); }
    .t-card__head { display: flex; justify-content: space-between; align-items: center; font-size: var(--fs-xs); font-weight: 600; color: var(--grey-500); text-transform: uppercase; letter-spacing: .08em; }
    .stack-sm { display: grid; gap: 10px; }
  `,
})
export class ContentSettingsComponent implements OnInit {
  private readonly api = inject(AdminApiService);
  private readonly toast = inject(ToastService);
  private readonly site = inject(SettingsService);
  private readonly fb = inject(FormBuilder);

  protected readonly loading = signal(true);
  protected readonly saving = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    hero_title: ['', [Validators.required, Validators.maxLength(120)]],
    hero_subtitle: ['', [Validators.required, Validators.maxLength(400)]],
    about_summary: ['', [Validators.required, Validators.maxLength(600)]],
    about_body: [''],
    vision: [''],
    mission: [''],
    management_intro: [''],
    meta_description: ['', Validators.maxLength(300)],
    objectives: this.fb.array<FormControl<string>>([]),
    testimonials: this.fb.array<ReturnType<ContentSettingsComponent['testimonialGroup']>>([]),
  });

  get objectives(): FormArray<FormControl<string>> {
    return this.form.controls.objectives;
  }

  get testimonials() {
    return this.form.controls.testimonials;
  }

  ngOnInit(): void {
    this.api.settings().subscribe({
      next: (g) => this.patch(g),
      error: (e: AppError) => {
        this.loading.set(false);
        this.toast.error(e.message);
      },
    });
  }

  private testimonialGroup(t: Partial<Testimonial> = {}) {
    return this.fb.nonNullable.group({
      name: [t.name ?? '', [Validators.required, Validators.maxLength(120)]],
      role: [t.role ?? '', Validators.maxLength(120)],
      quote: [t.quote ?? '', [Validators.required, Validators.maxLength(600)]],
    });
  }

  private patch(groups: SettingsGroups): void {
    const c = groups['content'] ?? {};
    const seo = groups['seo'] ?? {};
    const str = (v: unknown) => (typeof v === 'string' ? v : '');
    this.form.patchValue({
      hero_title: str(c['hero_title']?.value),
      hero_subtitle: str(c['hero_subtitle']?.value),
      about_summary: str(c['about_summary']?.value),
      about_body: str(c['about_body']?.value),
      vision: str(c['vision']?.value),
      mission: str(c['mission']?.value),
      management_intro: str(c['management_intro']?.value),
      meta_description: str(seo['meta_description']?.value),
    });
    this.objectives.clear();
    for (const o of (c['objectives']?.value as string[]) ?? []) this.objectives.push(this.fb.nonNullable.control(o));
    this.testimonials.clear();
    for (const t of (c['testimonials']?.value as Testimonial[]) ?? []) this.testimonials.push(this.testimonialGroup(t));
    this.form.markAsPristine();
    this.loading.set(false);
  }

  addObjective(): void {
    this.objectives.push(this.fb.nonNullable.control(''));
    this.form.markAsDirty();
  }

  removeObjective(i: number): void {
    this.objectives.removeAt(i);
    this.form.markAsDirty();
  }

  addTestimonial(): void {
    this.testimonials.push(this.testimonialGroup());
    this.form.markAsDirty();
  }

  removeTestimonial(i: number): void {
    this.testimonials.removeAt(i);
    this.form.markAsDirty();
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.error('Please complete the required fields.');
      return;
    }
    const v = this.form.getRawValue();
    const settings = {
      ...v,
      objectives: v.objectives.map((o) => o.trim()).filter(Boolean),
      testimonials: v.testimonials.map((t) => ({ name: t.name.trim(), role: t.role.trim(), quote: t.quote.trim() })),
    };
    this.saving.set(true);
    this.api
      .saveSettings(settings)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (g) => {
          this.patch(g);
          this.site.reload();
          this.toast.success('Website content saved.');
        },
        error: (e: AppError) => this.toast.error(e.message),
      });
  }
}
