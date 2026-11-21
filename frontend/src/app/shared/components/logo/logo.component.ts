import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Company logo badge + wordmark. `variant="light"` for dark backgrounds. */
@Component({
  selector: 'app-logo',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="logo" [class.logo--light]="variant() === 'light'" [class.logo--compact]="compact()">
      <img
        class="logo__mark"
        src="assets/images/brand/logo-96.webp"
        srcset="assets/images/brand/logo-96.webp 96w, assets/images/brand/logo-160.webp 160w, assets/images/brand/logo-320.webp 320w"
        sizes="(max-width: 380px) 44px, 56px"
        width="56"
        height="56"
        alt=""
        decoding="async"
      />
      <span class="logo__text">
        <span class="logo__name">Krishna International</span>
        <span class="logo__sub">Overseas Services</span>
      </span>
    </span>
  `,
  styles: `
    .logo { display: inline-flex; align-items: center; gap: 12px; color: var(--navy-900); }
    .logo__mark { width: 56px; height: 56px; flex: none; border-radius: 50%; }
    .logo__text { display: flex; flex-direction: column; line-height: 1.1; }
    .logo__name { font-family: var(--font-serif); font-size: 1.1875rem; font-weight: 600; letter-spacing: -0.01em; white-space: nowrap; }
    .logo__sub { margin-top: 4px; font-size: 0.625rem; font-weight: 600; letter-spacing: 0.22em; text-transform: uppercase; color: var(--gold-600); white-space: nowrap; }
    .logo--light { color: #fff; }
    .logo--light .logo__sub { color: var(--gold-300); }
    .logo--compact .logo__mark { width: 44px; height: 44px; }
    .logo--compact .logo__name { font-size: 1rem; }
    @media (max-width: 380px) {
      .logo__mark { width: 44px; height: 44px; }
      .logo__name { font-size: 1rem; }
      .logo__sub { font-size: 0.5625rem; letter-spacing: 0.16em; }
    }
  `,
})
export class LogoComponent {
  readonly variant = input<'dark' | 'light'>('dark');
  readonly compact = input(false);
}
