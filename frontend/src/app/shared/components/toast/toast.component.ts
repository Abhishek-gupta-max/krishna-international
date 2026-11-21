import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService } from '../../../core/services/toast.service';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-toasts',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="toasts" aria-live="polite" aria-atomic="false">
      @for (t of toast.toasts(); track t.id) {
        <div class="toast toast--{{ t.type }}" role="status">
          <app-icon [name]="t.type === 'success' ? 'check-circle' : t.type === 'error' ? 'alert' : 'info'" [size]="20" />
          <span>{{ t.message }}</span>
          <button type="button" (click)="toast.dismiss(t.id)" aria-label="Dismiss"><app-icon name="close" [size]="16" /></button>
        </div>
      }
    </div>
  `,
  styles: `
    .toasts { position: fixed; top: 16px; right: 16px; left: 16px; z-index: 1000; display: grid; justify-items: end; gap: 8px; pointer-events: none; }
    .toast {
      display: flex; align-items: flex-start; gap: 10px; width: min(380px, 100%); padding: 12px 14px;
      background: #fff; border: 1px solid var(--color-border); border-left: 3px solid; border-radius: var(--radius);
      box-shadow: var(--shadow-lg); font-size: var(--fs-sm); line-height: 1.45; pointer-events: auto;
      animation: toast-in 180ms var(--ease);
    }
    .toast span { flex: 1; padding-top: 1px; }
    .toast--success { border-left-color: var(--color-success); } .toast--success app-icon:first-child { color: var(--color-success); }
    .toast--error { border-left-color: var(--color-danger); } .toast--error app-icon:first-child { color: var(--color-danger); }
    .toast--info { border-left-color: var(--color-info); } .toast--info app-icon:first-child { color: var(--color-info); }
    .toast button { display: inline-flex; padding: 2px; border: 0; background: none; color: var(--grey-500); cursor: pointer; }
    @keyframes toast-in { from { opacity: 0; transform: translateY(-6px); } }
  `,
})
export class ToastComponent {
  protected readonly toast = inject(ToastService);
}
