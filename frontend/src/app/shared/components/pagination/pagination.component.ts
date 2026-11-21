import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { PageMeta } from '../../../core/models/api.models';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (meta(); as m) {
      @if (m.totalPages > 1) {
        <nav class="pagination" aria-label="Pagination">
          <button type="button" (click)="go(m.page - 1)" [disabled]="m.page <= 1" aria-label="Previous page">
            <app-icon name="arrow-left" [size]="16" />
          </button>
          @for (p of pages(); track $index) {
            @if (p === 0) {
              <span class="pagination-info">…</span>
            } @else {
              <button type="button" [class.is-active]="p === m.page" [attr.aria-current]="p === m.page ? 'page' : null" (click)="go(p)">{{ p }}</button>
            }
          }
          <button type="button" (click)="go(m.page + 1)" [disabled]="m.page >= m.totalPages" aria-label="Next page">
            <app-icon name="arrow" [size]="16" />
          </button>
        </nav>
      }
    }
  `,
})
export class PaginationComponent {
  readonly meta = input<PageMeta | null>(null);
  readonly pageChange = output<number>();

  /** Page numbers with 0 as an ellipsis marker, e.g. [1, 0, 4, 5, 6, 0, 12]. */
  readonly pages = computed(() => {
    const m = this.meta();
    if (!m) return [];
    const { page, totalPages: n } = m;
    const set = new Set([1, n, page - 1, page, page + 1].filter((p) => p >= 1 && p <= n));
    const sorted = [...set].sort((a, b) => a - b);
    const out: number[] = [];
    sorted.forEach((p, i) => {
      if (i > 0 && p - sorted[i - 1] > 1) out.push(0);
      out.push(p);
    });
    return out;
  });

  go(page: number): void {
    const m = this.meta();
    if (m && page >= 1 && page <= m.totalPages && page !== m.page) this.pageChange.emit(page);
  }
}
