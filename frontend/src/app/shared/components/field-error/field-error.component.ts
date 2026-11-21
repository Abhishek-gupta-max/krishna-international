import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { errorMessage } from '../../../core/services/form-utils';

/** Shows the validation message for a control once it has been touched. */
@Component({
  selector: 'app-field-error',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Default,
  template: `@if (message) {
    <span class="error-text" role="alert" [id]="id()">{{ message }}</span>
  }`,
})
export class FieldErrorComponent {
  readonly control = input.required<AbstractControl | null>();
  readonly label = input('This field');
  readonly id = input<string | null>(null);

  get message(): string | null {
    return errorMessage(this.control(), this.label());
  }
}
