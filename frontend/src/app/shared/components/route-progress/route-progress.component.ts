import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router } from '@angular/router';

/**
 * Thin gold bar at the top of the window while a page (lazy chunk) is loading.
 * Shown only if navigation takes longer than ~120ms, so fast page changes don't flicker.
 */
@Component({
  selector: 'app-route-progress',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="bar" [class.is-loading]="state() === 'loading'" [class.is-done]="state() === 'done'" aria-hidden="true"></div>`,
  styles: `
    .bar {
      position: fixed; top: 0; left: 0; z-index: 1500; height: 3px; width: 0; opacity: 0; pointer-events: none;
      background: linear-gradient(90deg, var(--gold-500), var(--gold-300));
      box-shadow: 0 0 10px rgba(176, 141, 87, .6);
    }
    .bar.is-loading { opacity: 1; width: 80%; transition: width 6s cubic-bezier(.1, .7, .2, 1), opacity .15s ease; }
    .bar.is-done { opacity: 0; width: 100%; transition: width .2s ease, opacity .35s ease .2s; }
  `,
})
export class RouteProgressComponent {
  protected readonly state = signal<'idle' | 'loading' | 'done'>('idle');
  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    inject(Router)
      .events.pipe(takeUntilDestroyed(inject(DestroyRef)))
      .subscribe((e) => {
        if (e instanceof NavigationStart) {
          this.clear();
          this.timer = setTimeout(() => this.state.set('loading'), 120);
        } else if (e instanceof NavigationEnd || e instanceof NavigationCancel || e instanceof NavigationError) {
          this.clear();
          if (this.state() === 'loading') {
            this.state.set('done');
            this.timer = setTimeout(() => this.state.set('idle'), 600);
          }
        }
      });
  }

  private clear(): void {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
  }
}
