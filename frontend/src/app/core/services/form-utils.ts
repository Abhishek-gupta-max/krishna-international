import { AbstractControl, FormGroup } from '@angular/forms';
import { AppError } from '../models/api.models';

/** Map server-side field errors (422) onto reactive form controls. */
export function applyServerErrors(form: FormGroup, err: AppError): void {
  for (const e of err.errors ?? []) {
    const control = form.get(e.field);
    if (control) {
      control.setErrors({ ...(control.errors ?? {}), server: e.message });
      control.markAsTouched();
    }
  }
}

/** Human readable message for the first error on a control. */
export function errorMessage(control: AbstractControl | null, label = 'This field'): string | null {
  if (!control || !control.errors || !(control.touched || control.dirty)) return null;
  const e = control.errors;
  if (e['server']) return e['server'];
  if (e['required']) return `${label} is required.`;
  if (e['email']) return 'Enter a valid email address.';
  if (e['minlength']) return `${label} must be at least ${e['minlength'].requiredLength} characters.`;
  if (e['maxlength']) return `${label} must be at most ${e['maxlength'].requiredLength} characters.`;
  if (e['min']) return `${label} must be at least ${e['min'].min}.`;
  if (e['max']) return `${label} must be at most ${e['max'].max}.`;
  if (e['pattern']) return `Enter a valid ${label.toLowerCase()}.`;
  if (e['mismatch']) return 'Passwords do not match.';
  return `${label} is invalid.`;
}

export const PHONE_PATTERN = /^\+?[0-9][0-9\s-]{6,18}$/;

/** Focus the first invalid field so keyboard and mobile users land on the problem. */
export function focusFirstInvalid(host: HTMLElement): void {
  setTimeout(() => {
    const el = host.querySelector<HTMLElement>('.ng-invalid:not(form):not(fieldset), .is-invalid input');
    el?.focus();
  });
}
