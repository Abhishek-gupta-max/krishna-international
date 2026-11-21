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
    .page-header { position: relative; overflow: hidden; background: var(--navy-900); color: rgba(255,255,255,.82); }
    .page-header__img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: .18; filter: grayscale(.3); }
    .page-header__inner { position: relative; padding-block: clamp(2.75rem, 2rem + 3.5vw, 5rem); }
    .page-header h1 { max-width: 820px; margin: var(--sp-4) 0 var(--sp-3); color: #fff; }
    .page-header p { max-width: 680px; margin: 0; font-size: var(--fs-md); line-height: 1.7; }
    .page-header::after { content: ''; position: absolute; left: 0; right: 0; bottom: 0; height: 3px; background: var(--gold-500); }
    .crumbs { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; margin: 0; padding: 0; list-style: none; font-size: var(--fs-xs); letter-spacing: .02em; color: rgba(255,255,255,.65); }
    .crumbs li { display: inline-flex; align-items: center; gap: 6px; }
    .crumbs a { color: rgba(255,255,255,.75); text-decoration: none; }
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
