import { ChangeDetectionStrategy, Component, effect, ElementRef, inject, viewChild } from '@angular/core';
import { ConfirmService } from './confirm.service';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <dialog #dlg class="dialog" (close)="confirm.close(false)" (cancel)="confirm.close(false)" aria-labelledby="confirm-title">
      @if (confirm.pending(); as p) {
        <h2 id="confirm-title">{{ p.title }}</h2>
        <p>{{ p.message }}</p>
        <div class="dialog__actions">
          <button type="button" class="btn btn--outline" (click)="confirm.close(false)">Cancel</button>
          <button type="button" class="btn" [class.btn--danger]="p.danger" (click)="confirm.close(true)">{{ p.confirmLabel || 'Confirm' }}</button>
        </div>
      }
    </dialog>
  `,
  styles: `
    .dialog { width: min(440px, calc(100vw - 32px)); padding: 24px; border: 1px solid var(--color-border); border-radius: var(--radius-lg); box-shadow: var(--shadow-lg); }
    .dialog::backdrop { background: rgba(6, 20, 39, .45); }
    .dialog h2 { font-family: var(--font-sans); font-size: 1.125rem; margin-bottom: 8px; }
    .dialog p { color: var(--grey-600); font-size: var(--fs-sm); }
    .dialog__actions { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 8px; margin-top: 20px; }
  `,
})
export class ConfirmDialogComponent {
  protected readonly confirm = inject(ConfirmService);
  private readonly dlg = viewChild.required<ElementRef<HTMLDialogElement>>('dlg');

  constructor() {
    effect(() => {
      const el = this.dlg().nativeElement;
      if (this.confirm.pending() && !el.open) el.showModal();
      if (!this.confirm.pending() && el.open) el.close();
    });
  }
}
