import { ChangeDetectionStrategy, Component, ElementRef, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { AppError } from '../../../core/models/api.models';
import { applyServerErrors, focusFirstInvalid, PHONE_PATTERN } from '../../../core/services/form-utils';
import { PublicApiService } from '../../../core/services/public-api.service';
import { FieldErrorComponent } from '../field-error/field-error.component';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [ReactiveFormsModule, FieldErrorComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.Default,
  template: `
    @if (success(); as msg) {
      <div class="alert alert--success" role="status">
        <app-icon name="check-circle" />
        <div>
          <p><strong>Message sent.</strong> {{ msg }}</p>
          <button type="button" class="btn btn--outline btn--sm" (click)="success.set(null)">Send another message</button>
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
          <div class="field">
            <label class="label" for="ct-name">Your name<span class="req">*</span></label>
            <input id="ct-name" class="input" formControlName="name" autocomplete="name" />
            <app-field-error [control]="form.controls.name" label="Name" />
          </div>
          <div class="field">
            <label class="label" for="ct-email">Email<span class="req">*</span></label>
            <input id="ct-email" class="input" type="email" formControlName="email" autocomplete="email" />
            <app-field-error [control]="form.controls.email" label="Email" />
          </div>
          <div class="field">
            <label class="label" for="ct-phone">Phone<span class="opt">(optional)</span></label>
            <input id="ct-phone" class="input" type="tel" inputmode="tel" formControlName="phone" autocomplete="tel" />
            <app-field-error [control]="form.controls.phone" label="Phone number" />
          </div>
          <div class="field">
            <label class="label" for="ct-subject">Subject<span class="req">*</span></label>
            <input id="ct-subject" class="input" formControlName="subject" />
            <app-field-error [control]="form.controls.subject" label="Subject" />
          </div>
          <div class="field span-2">
            <label class="label" for="ct-message">Message<span class="req">*</span></label>
            <textarea id="ct-message" class="textarea" rows="5" formControlName="message"></textarea>
            <app-field-error [control]="form.controls.message" label="Message" />
          </div>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn--lg" [disabled]="submitting()">
            @if (submitting()) {
              <span class="spinner" aria-hidden="true"></span> Sending…
            } @else {
              Send message
            }
          </button>
        </div>
      </form>
    }
  `,
})
export class ContactFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(PublicApiService);
  private readonly host = inject(ElementRef<HTMLElement>);

  protected readonly submitting = signal(false);
  protected readonly success = signal<string | null>(null);
  protected readonly error = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(120)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.pattern(PHONE_PATTERN)],
    subject: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(160)]],
    message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(5000)]],
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
      .submitContact({ ...v, phone: v.phone || null })
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: (res) => {
          this.success.set(res.message);
          this.form.reset();
        },
        error: (err: AppError) => {
          applyServerErrors(this.form, err);
          this.error.set(err.message);
        },
      });
  }
}
