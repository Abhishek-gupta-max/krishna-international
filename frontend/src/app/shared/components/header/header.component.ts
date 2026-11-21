import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, HostListener, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
import { SettingsService } from '../../../core/services/settings.service';
import { IconComponent } from '../icon/icon.component';
import { LogoComponent } from '../logo/logo.component';

export const NAV_LINKS = [
  { path: '/', label: 'Home', exact: true },
  { path: '/about', label: 'About' },
  { path: '/services', label: 'Services' },
  { path: '/jobs', label: 'Jobs' },
  { path: '/employers', label: 'Employers' },
  { path: '/candidates', label: 'Candidates' },
  { path: '/contact', label: 'Contact' },
];

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, IconComponent, LogoComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  protected readonly site = inject(SettingsService);
  private readonly host = inject(ElementRef<HTMLElement>);
  protected readonly links = NAV_LINKS;
  protected readonly menuOpen = signal(false);
  protected readonly scrolled = signal(false);

  constructor() {
    inject(Router)
      .events.pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(inject(DestroyRef))
      )
      .subscribe(() => this.setMenu(false));
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled.set(window.scrollY > 8);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.setMenu(false);
  }

  toggleMenu(): void {
    this.setMenu(!this.menuOpen());
  }

  private setMenu(open: boolean): void {
    if (open) {
      // Position the drawer directly below the header, whether or not the top bar is in view.
      const bottom = this.host.nativeElement.querySelector('.header')?.getBoundingClientRect().bottom ?? 0;
      document.documentElement.style.setProperty('--nav-top', `${Math.round(bottom)}px`);
    }
    this.menuOpen.set(open);
    document.body.style.overflow = open ? 'hidden' : '';
  }
}
