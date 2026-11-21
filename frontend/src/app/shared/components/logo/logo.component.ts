import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Company monogram + wordmark. `variant="light"` for dark backgrounds. */
@Component({
  selector: 'app-logo',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="logo" [class.logo--light]="variant() === 'light'" [class.logo--compact]="compact()">
      <svg class="logo__mark" viewBox="0 0 64 64" aria-hidden="true">
        <rect width="64" height="64" rx="4" class="logo__bg" />
        <path d="M18 14h7v13.6L37 14h8.6L33.4 27.6 46.2 47h-8.6l-9.4-14.2-3.2 3.5V47h-7z" class="logo__k" />
        <rect x="18" y="51" width="28" height="3" class="logo__bar" />
      </svg>
      <span class="logo__text">
        <span class="logo__name">Krishna International</span>
        <span class="logo__sub">Overseas Services</span>
      </span>
    </span>
  `,
  styles: `
    .logo { display: inline-flex; align-items: center; gap: 12px; color: var(--navy-900); }
    .logo__mark { width: 44px; height: 44px; flex: none; }
    .logo__bg { fill: var(--navy-900); }
    .logo__k { fill: #fff; }
    .logo__bar { fill: var(--gold-500); }
    .logo__text { display: flex; flex-direction: column; line-height: 1.1; }
    .logo__name { font-family: var(--font-serif); font-size: 1.1875rem; font-weight: 600; letter-spacing: -0.01em; white-space: nowrap; }
    .logo__sub { margin-top: 4px; font-size: 0.625rem; font-weight: 600; letter-spacing: 0.22em; text-transform: uppercase; color: var(--gold-600); white-space: nowrap; }
    .logo--light { color: #fff; }
    .logo--light .logo__bg { fill: #fff; }
    .logo--light .logo__k { fill: var(--navy-900); }
    .logo--light .logo__sub { color: var(--gold-300); }
    .logo--compact .logo__mark { width: 36px; height: 36px; }
    .logo--compact .logo__name { font-size: 1rem; }
    @media (max-width: 380px) {
      .logo__mark { width: 36px; height: 36px; }
      .logo__name { font-size: 1rem; }
      .logo__sub { font-size: 0.5625rem; letter-spacing: 0.16em; }
    }
  `,
})
export class LogoComponent {
  readonly variant = input<'dark' | 'light'>('dark');
  readonly compact = input(false);
}
