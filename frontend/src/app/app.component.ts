import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router, RouterOutlet } from '@angular/router';
import { SeoService } from './core/services/seo.service';
import { ConfirmDialogComponent } from './shared/components/confirm-dialog/confirm-dialog.component';
import { RouteProgressComponent } from './shared/components/route-progress/route-progress.component';
import { ToastComponent } from './shared/components/toast/toast.component';

/**
 * How long the full-screen loader (see #preloader in index.html) stays visible, in milliseconds.
 * Shown on the first visit and on every page change on the public site (not in the admin panel).
 * Change this one number to make the loader shorter or longer.
 */
const LOADER_MIN_MS = 1000;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastComponent, ConfirmDialogComponent, RouteProgressComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<app-route-progress /><router-outlet /><app-toasts /><app-confirm-dialog />`,
})
export class AppComponent implements OnInit {
  private readonly seo = inject(SeoService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  private shownAt = 0; // performance.now() when the loader was last shown
  private hideTimer: ReturnType<typeof setTimeout> | null = null;
  private currentPath = '';
  private firstNavigation = true;

  ngOnInit(): void {
    this.seo.init();
    this.shownAt = 0; // the loader is visible from the very start of the page load

    this.router.events.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((e) => {
      if (e instanceof NavigationStart) {
        const path = this.pathOf(e.url);
        // Skip the first load (already showing), admin pages, and same-page links (#fragment / ?query)
        if (!this.firstNavigation && path !== this.currentPath && !path.startsWith('/admin')) this.showLoader();
      } else if (e instanceof NavigationEnd || e instanceof NavigationCancel || e instanceof NavigationError) {
        if (e instanceof NavigationEnd) this.currentPath = this.pathOf(e.urlAfterRedirects);
        this.firstNavigation = false;
        this.scheduleHide();
      }
    });
  }

  private pathOf(url: string): string {
    return url.split(/[?#]/)[0] || '/';
  }

  private loader(): HTMLElement | null {
    return document.getElementById('preloader');
  }

  private showLoader(): void {
    const el = this.loader();
    if (!el) return;
    if (this.hideTimer) clearTimeout(this.hideTimer);
    this.hideTimer = null;
    el.classList.remove('is-hidden');
    this.shownAt = performance.now();
  }

  /** Hide once the page is ready AND the loader has been up for at least LOADER_MIN_MS. */
  private scheduleHide(): void {
    const el = this.loader();
    if (!el || el.classList.contains('is-hidden')) return;
    if (this.hideTimer) clearTimeout(this.hideTimer);
    const isAdmin = this.currentPath.startsWith('/admin');
    const remaining = isAdmin ? 0 : Math.max(0, LOADER_MIN_MS - (performance.now() - this.shownAt));
    this.hideTimer = setTimeout(() => {
      this.hideTimer = null;
      requestAnimationFrame(() => el.classList.add('is-hidden'));
    }, remaining);
  }
}
