import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationCancel, NavigationEnd, NavigationError, Router, RouterOutlet } from '@angular/router';
import { filter, take } from 'rxjs';
import { SeoService } from './core/services/seo.service';
import { ConfirmDialogComponent } from './shared/components/confirm-dialog/confirm-dialog.component';
import { RouteProgressComponent } from './shared/components/route-progress/route-progress.component';
import { ToastComponent } from './shared/components/toast/toast.component';

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

  ngOnInit(): void {
    this.seo.init();

    // Fade out the initial page loader (see index.html) once the first page has rendered.
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd || e instanceof NavigationCancel || e instanceof NavigationError),
        take(1),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => requestAnimationFrame(() => this.hidePreloader()));
    // Safety net: never leave the loader up if navigation stalls.
    setTimeout(() => this.hidePreloader(), 8000);
  }

  private hidePreloader(): void {
    const el = document.getElementById('preloader');
    if (!el || el.classList.contains('is-hidden')) return;
    el.classList.add('is-hidden');
    setTimeout(() => el.remove(), 500);
  }
}
