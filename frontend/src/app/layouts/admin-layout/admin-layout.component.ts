import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { AdminRole } from '../../core/models/domain.models';
import { AuthService } from '../../core/services/auth.service';
import { SettingsService } from '../../core/services/settings.service';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { LogoComponent } from '../../shared/components/logo/logo.component';
import { LabelPipe } from '../../shared/pipes/labels.pipes';

interface NavItem {
  path: string;
  label: string;
  icon: string;
  roles?: AdminRole[];
}

const MANAGERS: AdminRole[] = ['super_admin', 'admin'];

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, IconComponent, LogoComponent, LabelPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss',
})
export class AdminLayoutComponent implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly settings = inject(SettingsService);
  protected readonly sidebarOpen = signal(false);

  private readonly allSections: { title: string; items: NavItem[] }[] = [
    {
      title: 'Overview',
      items: [{ path: '/admin/dashboard', label: 'Dashboard', icon: 'dashboard' }],
    },
    {
      title: 'Recruitment',
      items: [
        { path: '/admin/jobs', label: 'Jobs', icon: 'briefcase' },
        { path: '/admin/applications', label: 'Applications', icon: 'users', roles: MANAGERS },
        { path: '/admin/employer-enquiries', label: 'Employer enquiries', icon: 'building', roles: MANAGERS },
        { path: '/admin/messages', label: 'Contact messages', icon: 'inbox', roles: MANAGERS },
      ],
    },
    {
      title: 'Website',
      items: [
        { path: '/admin/gallery', label: 'Gallery', icon: 'image' },
        { path: '/admin/content', label: 'Website content', icon: 'layout', roles: MANAGERS },
        { path: '/admin/settings', label: 'Company settings', icon: 'settings', roles: MANAGERS },
      ],
    },
    {
      title: 'Account',
      items: [{ path: '/admin/password', label: 'Change password', icon: 'lock' }],
    },
  ];

  protected readonly sections = computed(() => {
    const role = this.auth.admin()?.role;
    return this.allSections
      .map((s) => ({ ...s, items: s.items.filter((i) => !i.roles || (role && i.roles.includes(role))) }))
      .filter((s) => s.items.length);
  });

  constructor() {
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(inject(DestroyRef))
      )
      .subscribe(() => this.sidebarOpen.set(false));
  }

  ngOnInit(): void {
    this.settings.load();
    // Refresh role/name in case they changed since sign-in.
    this.auth.refreshProfile().subscribe({ error: () => undefined });
  }

  logout(): void {
    this.auth.logout().subscribe({
      complete: () => this.router.navigate(['/admin/login']),
      error: () => this.router.navigate(['/admin/login']),
    });
  }
}
