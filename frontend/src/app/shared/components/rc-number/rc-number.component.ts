import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * Shows a registration number such as "B-3411/UP/PER/100/5/11417/2026" so that it only
 * wraps after a slash (never after the "B-"). Copying still yields the plain number.
 */
@Component({
  selector: 'app-rc-number',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `@for (part of parts(); track $index) {<span class="part">{{ part }}{{ $last ? '' : '/' }}</span>@if (!$last) {<wbr />}}`,
  styles: `.part { white-space: nowrap; }`,
})
export class RcNumberComponent {
  readonly value = input.required<string>();
  protected readonly parts = computed(() => (this.value() || '').split('/'));
}
