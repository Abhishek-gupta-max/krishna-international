import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SERVICES } from '../../core/models/reference-data';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { RevealDirective } from '../../shared/directives/reveal.directive';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [RouterLink, PageHeaderComponent, IconComponent, RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header
      title="Our Services"
      image="service-construction"
      intro="Recruitment support across trades and industries — from a single specialist to a full project team."
    />

    <nav class="svc-index" aria-label="Services on this page">
      <div class="container">
        <ul>
          @for (svc of services; track svc.slug) {
            <li><a routerLink="/services" [fragment]="svc.slug">{{ svc.title }}</a></li>
          }
        </ul>
      </div>
    </nav>

    @for (svc of services; track svc.slug; let i = $index; let odd = $odd) {
      <section class="section" [class.section--alt]="odd" [id]="svc.slug" [attr.aria-labelledby]="svc.slug + '-title'">
        <div class="container split" [class.split--reverse]="odd">
          <div class="media-frame media-frame--4x3" appReveal>
            <img
              [src]="'assets/images/' + svc.image + '-800.webp'"
              [srcset]="'assets/images/' + svc.image + '-800.webp 800w, assets/images/' + svc.image + '-1600.webp 1600w'"
              sizes="(min-width: 992px) 560px, 100vw"
              [alt]="svc.title"
              loading="lazy"
              width="800"
              height="533"
            />
          </div>
          <div appReveal>
            <p class="eyebrow">Service {{ (i + 1).toString().padStart(2, '0') }}</p>
            <h2 [id]="svc.slug + '-title'">{{ svc.title }}</h2>
            <p class="lead">{{ svc.summary }}</p>
            <p>{{ svc.body }}</p>
            <h3 class="svc-sub">{{ i === 0 || i === 7 ? 'What we handle' : 'Typical roles' }}</h3>
            <ul class="svc-roles">
              @for (r of svc.roles; track r) {
                <li>{{ r }}</li>
              }
            </ul>
            <a routerLink="/employers" class="link-arrow">Discuss this requirement <app-icon name="arrow" /></a>
          </div>
        </div>
      </section>
    }

    <section class="section section--navy section--tight">
      <div class="container closing">
        <div>
          <h2>Have a requirement that is not listed?</h2>
          <p style="margin: 0; color: rgba(255,255,255,.75)">Tell us about it — we will let you know honestly whether we can help.</p>
        </div>
        <a routerLink="/employers" class="btn btn--gold btn--lg">Submit an enquiry</a>
      </div>
    </section>
  `,
  styles: `
    .svc-index { border-bottom: 1px solid var(--color-border); background: #fff; }
    .svc-index ul { display: flex; gap: var(--sp-2) var(--sp-5); margin: 0; padding: var(--sp-4) 0; list-style: none; overflow-x: auto; scrollbar-width: thin; }
    .svc-index a { display: block; padding: 4px 0; font-size: var(--fs-sm); font-weight: 500; color: var(--grey-600); text-decoration: none; white-space: nowrap; }
    .svc-index a { position: relative; transition: color var(--dur) var(--ease); }
    .svc-index a::after { content: ''; position: absolute; left: 0; right: 0; bottom: -2px; height: 2px; border-radius: 2px; background: var(--gold-500); transform: scaleX(0); transform-origin: left; transition: transform var(--dur) var(--ease); }
    .svc-index a:hover { color: var(--navy-900); }
    .svc-index a:hover::after { transform: scaleX(1); }
    .svc-sub { margin: var(--sp-5) 0 var(--sp-3); font-family: var(--font-sans); font-size: var(--fs-xs); font-weight: 600; letter-spacing: .12em; text-transform: uppercase; color: var(--grey-500); }
    .svc-roles { display: flex; flex-wrap: wrap; gap: var(--sp-2); margin: 0 0 var(--sp-6); padding: 0; list-style: none; }
    .svc-roles li {
      padding: 6px 14px; border: 1px solid var(--color-border); border-radius: var(--radius-pill); background: #fff; font-size: var(--fs-sm);
      transition: background-color var(--dur) var(--ease), border-color var(--dur) var(--ease), color var(--dur) var(--ease), transform var(--dur) var(--ease);
    }
    .svc-roles li:hover { background: var(--gold-100); border-color: var(--gold-300); color: var(--navy-900); transform: translateY(-2px); }
    .closing { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: var(--sp-5); }
    .closing h2 { margin-bottom: var(--sp-2); }
  `,
})
export class ServicesComponent {
  protected readonly services = SERVICES;
}
