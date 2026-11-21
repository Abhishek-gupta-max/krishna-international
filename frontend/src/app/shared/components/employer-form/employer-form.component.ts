import { ChangeDetectionStrategy, Component, ElementRef, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { AppError } from '../../../core/models/api.models';
import { INDUSTRIES } from '../../../core/models/reference-data';
import { applyServerErrors, focusFirstInvalid, PHONE_PATTERN } from '../../../core/services/form-utils';
import { PublicApiService } from '../../../core/services/public-api.service';
import { SettingsService } from '../../../core/services/settings.service';
import { FieldErrorComponent } from '../field-error/field-error.component';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-employer-form',
  standalone: true,
  imports: [ReactiveFormsModule, FieldErrorComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.Default,
  template: `
    @if (success(); as msg) {
      <div class="alert alert--success" role="status">
        <app-icon name="check-circle" />
        <div>
          <p><strong>Requirement received.</strong> {{ msg }}</p>
          <p>For urgent requirements, call <a [href]="site.phoneHref()">{{ site.settings().phone_primary }}</a>.</p>
          <button type="button" class="btn btn--outline btn--sm" (click)="success.set(null)">Send another requirement</button>
        </div>
      </div>
    } @else {
      <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
        @if (error()) {
          <div class="alert alert--error" role="alert" style="margin-bottom: var(--sp-5)">
            <app-icon name="alert" /><p>{{ error() }}</p>
          </div>
        }
        <div class="form-grid">
          <p class="form-legend">Company details</p>
          <div class="field">
            <label class="label" for="e-company">Company name<span class="req">*</span></label>
            <input id="e-company" class="input" formControlName="companyName" autocomplete="organization" />
            <app-field-error [control]="form.controls.companyName" label="Company name" />
          </div>
          <div class="field">
            <label class="label" for="e-person">Contact person<span class="req">*</span></label>
            <input id="e-person" class="input" formControlName="contactPerson" autocomplete="name" />
            <app-field-error [control]="form.controls.contactPerson" label="Contact person" />
          </div>
          <div class="field">
            <label class="label" for="e-email">Business email<span class="req">*</span></label>
            <input id="e-email" class="input" type="email" formControlName="email" autocomplete="email" />
            <app-field-error [control]="form.controls.email" label="Email" />
          </div>
          <div class="field">
            <label class="label" for="e-phone">Phone / WhatsApp<span class="req">*</span></label>
            <input id="e-phone" class="input" type="tel" inputmode="tel" formControlName="phone" autocomplete="tel" placeholder="Include country code" />
            <app-field-error [control]="form.controls.phone" label="Phone number" />
          </div>
          <div class="field">
            <label class="label" for="e-country">Country<span class="req">*</span></label>
            <input id="e-country" class="input" formControlName="country" autocomplete="country-name" />
            <app-field-error [control]="form.controls.country" label="Country" />
          </div>
          <div class="field">
            <label class="label" for="e-industry">Industry<span class="req">*</span></label>
            <select id="e-industry" class="select" formControlName="industry">
              <option value="" disabled>Select industry</option>
              @for (i of industries; track i) {
                <option [value]="i">{{ i }}</option>
              }
            </select>
            <app-field-error [control]="form.controls.industry" label="Industry" />
          </div>

          <p class="form-legend">Requirement</p>
          <div class="field span-2">
            <label class="label" for="e-req">Manpower requirements<span class="req">*</span></label>
            <textarea id="e-req" class="textarea" rows="4" formControlName="manpowerRequirements"
              placeholder="Positions, number per position, experience, salary range and contract terms"></textarea>
            <app-field-error [control]="form.controls.manpowerRequirements" label="Manpower requirements" />
          </div>
          <div class="field">
            <label class="label" for="e-count">Number of employees required<span class="req">*</span></label>
            <input id="e-count" class="input" type="number" min="1" inputmode="numeric" formControlName="employeesRequired" />
            <app-field-error [control]="form.controls.employeesRequired" label="Number of employees" />
          </div>
          <div class="field span-2">
            <label class="label" for="e-msg">Additional message<span class="opt">(optional)</span></label>
            <textarea id="e-msg" class="textarea" rows="3" formControlName="message"
              placeholder="Joining date, interview preferences, accommodation and other details"></textarea>
          </div>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn--lg" [disabled]="submitting()">
            @if (submitting()) {
              <span class="spinner" aria-hidden="true"></span> Sending…
            } @else {
              Send requirement
            }
          </button>
          <span class="hint">Our team will contact you to discuss the requirement.</span>
        </div>
      </form>
    }
  `,
})
export class EmployerFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(PublicApiService);
  private readonly host = inject(ElementRef<HTMLElement>);
  protected readonly site = inject(SettingsService);
  protected readonly industries = INDUSTRIES;

  protected readonly submitting = signal(false);
  protected readonly success = signal<string | null>(null);
  protected readonly error = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    companyName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(160)]],
    contactPerson: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(120)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(PHONE_PATTERN)]],
    country: ['', [Validators.required, Validators.maxLength(80)]],
    industry: ['', Validators.required],
    manpowerRequirements: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(5000)]],
    employeesRequired: [null as number | null, [Validators.required, Validators.min(1), Validators.max(100000)]],
    message: ['', Validators.maxLength(5000)],
  });

  submit(): void {
    this.error.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      focusFirstInvalid(this.host.nativeElement);
      return;
    }
    const v = this.form.getRawValue();
    this.submitting.set(true);
    this.api
      .submitEmployerEnquiry({ ...v, employeesRequired: Number(v.employeesRequired), message: v.message || null })
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: (res) => {
          this.success.set(res.message);
          this.form.reset();
          this.host.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        },
        error: (err: AppError) => {
          applyServerErrors(this.form, err);
          this.error.set(err.message);
        },
      });
  }
}
