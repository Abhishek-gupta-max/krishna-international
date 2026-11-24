import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../icon/icon.component';

/** Inner-page banner with breadcrumb, title and short intro. */
@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [RouterLink, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="page-header" [class.page-header--image]="!!image()">
      @if (image(); as img) {
        <img class="page-header__img" [src]="'assets/images/' + img + '-1600.webp'" [srcset]="'assets/images/' + img + '-800.webp 800w, assets/images/' + img + '-1600.webp 1600w'" sizes="100vw" alt="" fetchpriority="high" />
      }
      <div class="container page-header__inner">
        <nav aria-label="Breadcrumb">
          <ol class="crumbs">
            <li><a routerLink="/">Home</a></li>
            @if (parent(); as p) {
              <li><app-icon name="chevron" [size]="14" /><a [routerLink]="p.path">{{ p.label }}</a></li>
            }
            <li aria-current="page"><app-icon name="chevron" [size]="14" />{{ crumb() || title() }}</li>
          </ol>
        </nav>
        <h1>{{ title() }}</h1>
        @if (intro()) {
          <p>{{ intro() }}</p>
        }
        <ng-content />
      </div>
    </section>
  `,
  styles: `
    .page-header { position: relative; isolation: isolate; overflow: hidden; background: var(--gradient-navy); color: rgba(255,255,255,.84); }
    .page-header__img { position: absolute; inset: 0; z-index: -2; width: 100%; height: 100%; object-fit: cover; object-position: center 40%; }
    .page-header--image::before {
      content: ''; position: absolute; inset: 0; z-index: -1;
      background: linear-gradient(90deg, rgba(6,20,39,.95) 0%, rgba(11,37,69,.86) 45%, rgba(11,37,69,.55) 100%);
    }
    @media (max-width: 767.98px) { .page-header--image::before { background: rgba(8,26,50,.86); } }
    /* Decorative gold rings on plain banners */
    .page-header:not(.page-header--image)::before {
      content: ''; position: absolute; z-index: -1; right: -120px; top: -140px; width: 380px; height: 380px;
      border-radius: 50%; border: 56px solid rgba(176,141,87,.08);
    }
    .page-header__inner { position: relative; padding-block: clamp(3rem, 2rem + 4vw, 5.5rem); }
    .page-header h1 { max-width: 820px; margin: var(--sp-5) 0 var(--sp-4); color: #fff; letter-spacing: -0.025em; text-wrap: balance; }
    .page-header p { max-width: 640px; margin: 0; font-size: clamp(1rem, .95rem + .3vw, 1.125rem); line-height: 1.7; color: rgba(255,255,255,.8); }
    .page-header::after { content: ''; position: absolute; left: 0; right: 0; bottom: 0; height: 3px; background: linear-gradient(90deg, var(--gold-500), var(--gold-300) 50%, transparent); }
    .crumbs {
      display: inline-flex; flex-wrap: wrap; align-items: center; gap: 6px; margin: 0; padding: 6px 14px; list-style: none;
      border: 1px solid rgba(255,255,255,.14); border-radius: var(--radius-pill); background: rgba(255,255,255,.06);
      backdrop-filter: blur(6px); font-size: var(--fs-xs); letter-spacing: .02em; color: var(--gold-300);
    }
    .crumbs li { display: inline-flex; align-items: center; gap: 6px; }
    .crumbs app-icon { color: rgba(255,255,255,.45); }
    .crumbs a { color: rgba(255,255,255,.8); text-decoration: none; }
    .crumbs a:hover { color: #fff; text-decoration: underline; }
  `,
})
export class PageHeaderComponent {
  readonly title = input.required<string>();
  readonly intro = input<string>('');
  readonly crumb = input<string>('');
  readonly image = input<string>('');
  readonly parent = input<{ path: string; label: string } | null>(null);
}
