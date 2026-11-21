import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { AppError } from '../../../core/models/api.models';
import { AuthService } from '../../../core/services/auth.service';
import { applyServerErrors } from '../../../core/services/form-utils';
import { ToastService } from '../../../core/services/toast.service';
import { FieldErrorComponent } from '../../../shared/components/field-error/field-error.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';

function matchValidator(group: AbstractControl): ValidationErrors | null {
  const pass = group.get('newPassword')?.value;
  const confirm = group.get('confirmPassword');
  if (confirm && confirm.value && pass !== confirm.value) {
    confirm.setErrors({ ...(confirm.errors ?? {}), mismatch: true });
  } else if (confirm?.hasError('mismatch')) {
    const { mismatch, ...rest } = confirm.errors ?? {};
    confirm.setErrors(Object.keys(rest).length ? rest : null);
  }
  return null;
}

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [ReactiveFormsModule, FieldErrorComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.Default,
  template: `
    <div class="admin-page" style="max-width: 560px">
      <div class="admin-head">
        <div>
          <h1>Change password</h1>
          <p>Changing your password signs you out on all other devices.</p>
        </div>
      </div>
      <form class="panel" [formGroup]="form" (ngSubmit)="submit()" novalidate>
        <div class="panel__body" style="display: grid; gap: 18px">
          <div class="field">
            <label class="label" for="p-current">Current password</label>
            <input id="p-current" class="input" type="password" formControlName="currentPassword" autocomplete="current-password" />
            <app-field-error [control]="form.controls.currentPassword" label="Current password" />
          </div>
          <div class="field">
            <label class="label" for="p-new">New password</label>
            <input id="p-new" class="input" type="password" formControlName="newPassword" autocomplete="new-password" />
            <span class="hint">At least 10 characters, including letters and numbers.</span>
            <app-field-error [control]="form.controls.newPassword" label="New password" />
          </div>
          <div class="field">
            <label class="label" for="p-confirm">Confirm new password</label>
            <input id="p-confirm" class="input" type="password" formControlName="confirmPassword" autocomplete="new-password" />
            <app-field-error [control]="form.controls.confirmPassword" label="Confirmation" />
          </div>
        </div>
        <div class="admin-pager" style="justify-content: flex-end">
          <button type="submit" class="btn" [disabled]="saving()">
            @if (saving()) {
              <span class="spinner" aria-hidden="true"></span>
            } @else {
              <app-icon name="lock" [size]="16" />
            }
            Update password
          </button>
        </div>
      </form>
    </div>
  `,
})
export class ChangePasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  protected readonly saving = signal(false);

  protected readonly form = this.fb.nonNullable.group(
    {
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(10), Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d).+$/)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: matchValidator }
  );

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { currentPassword, newPassword } = this.form.getRawValue();
    this.saving.set(true);
    this.auth
      .changePassword(currentPassword, newPassword)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.form.reset();
          this.toast.success('Password updated. Other sessions have been signed out.');
        },
        error: (e: AppError) => {
          applyServerErrors(this.form, e);
          this.toast.error(e.message);
        },
      });
  }
}
