import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SERVICES } from '../../../core/models/reference-data';
import { SettingsService } from '../../../core/services/settings.service';
import { NAV_LINKS } from '../header/header.component';
import { IconComponent } from '../icon/icon.component';
import { LogoComponent } from '../logo/logo.component';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, IconComponent, LogoComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let s = site.settings();
    <footer class="footer">
      <div class="container footer__grid">
        <div class="footer__about">
          <app-logo variant="light" />
          <p>{{ s.about_summary }}</p>
          @if (site.socialLinks().length) {
            <ul class="footer__social" aria-label="Social media">
              @for (l of site.socialLinks(); track l.name) {
                <li>
                  <a [href]="l.url" target="_blank" rel="noopener noreferrer" [attr.aria-label]="l.name">
                    <app-icon [name]="l.icon" [size]="18" />
                  </a>
                </li>
              }
            </ul>
          }
        </div>

        <nav aria-label="Footer">
          <h2 class="footer__title">Company</h2>
          <ul class="footer__links">
            @for (link of links; track link.path) {
              <li><a [routerLink]="link.path">{{ link.label }}</a></li>
            }
          </ul>
        </nav>

        <div>
          <h2 class="footer__title">Services</h2>
          <ul class="footer__links">
            @for (svc of services; track svc.slug) {
              <li><a routerLink="/services" [fragment]="svc.slug">{{ svc.title }}</a></li>
            }
          </ul>
        </div>

        <div>
          <h2 class="footer__title">Contact</h2>
          <ul class="footer__contact">
            <li><app-icon name="pin" [size]="18" /><span>{{ s.address }}</span></li>
            <li>
              <app-icon name="phone" [size]="18" />
              <span>
                <a [href]="site.phoneHref()">{{ s.phone_primary }}</a><br />
                @if (s.phone_alternate) {
                  <a [href]="site.altPhoneHref()">{{ s.phone_alternate }}</a>
                }
              </span>
            </li>
            <li><app-icon name="mail" [size]="18" /><a [href]="'mailto:' + s.email">{{ s.email }}</a></li>
            @if (s.office_hours) {
              <li><app-icon name="clock" [size]="18" /><span>{{ s.office_hours }}</span></li>
            }
          </ul>
        </div>
      </div>

      <div class="footer__bottom">
        <div class="container footer__bottom-inner">
          <p>© {{ year }} {{ s.company_name }}. All rights reserved.</p>
          <p>{{ s.registration_authority }} · Reg. No. {{ s.registration_number }}</p>
        </div>
      </div>
    </footer>
  `,
  styles: `
    .footer { background: var(--navy-950); color: rgba(255,255,255,.7); font-size: var(--fs-sm); }
    .footer__grid {
      display: grid; gap: var(--sp-7) var(--sp-6);
      padding-block: var(--sp-8) var(--sp-7);
      grid-template-columns: 1fr;
    }
    @media (min-width: 640px) { .footer__grid { grid-template-columns: 1fr 1fr; } }
    @media (min-width: 1024px) { .footer__grid { grid-template-columns: 1.4fr 0.8fr 1.1fr 1.2fr; } }
    .footer__about p { margin: var(--sp-5) 0 0; max-width: 360px; line-height: 1.7; }
    .footer__title {
      margin-bottom: var(--sp-5); font-family: var(--font-sans); font-size: var(--fs-xs); font-weight: 600;
      letter-spacing: .14em; text-transform: uppercase; color: var(--gold-300);
    }
    .footer__links, .footer__contact, .footer__social { list-style: none; margin: 0; padding: 0; }
    .footer__links { display: grid; gap: var(--sp-3); }
    .footer a { color: rgba(255,255,255,.78); text-decoration: none; }
    .footer a:hover { color: #fff; text-decoration: underline; }
    .footer__contact { display: grid; gap: var(--sp-4); }
    .footer__contact li { display: grid; grid-template-columns: 18px 1fr; gap: var(--sp-3); line-height: 1.6; overflow-wrap: anywhere; }
    .footer__contact app-icon { color: var(--gold-300); }
    .footer__contact li > :first-child { margin-top: 3px; }
    .footer__social { display: flex; gap: var(--sp-2); margin-top: var(--sp-5); }
    .footer__social a {
      display: inline-flex; align-items: center; justify-content: center; width: 38px; height: 38px;
      border: 1px solid rgba(255,255,255,.2); border-radius: var(--radius);
    }
    .footer__social a:hover { border-color: var(--gold-300); color: var(--gold-300); text-decoration: none; }
    .footer__bottom { border-top: 1px solid rgba(255,255,255,.1); }
    .footer__bottom-inner {
      display: flex; flex-wrap: wrap; justify-content: space-between; gap: var(--sp-2) var(--sp-5);
      padding-block: var(--sp-5); font-size: var(--fs-xs); color: rgba(255,255,255,.55);
    }
    .footer__bottom p { margin: 0; }
  `,
})
export class FooterComponent {
  protected readonly site = inject(SettingsService);
  protected readonly links = NAV_LINKS;
  protected readonly services = SERVICES;
  protected readonly year = new Date().getFullYear();
}
