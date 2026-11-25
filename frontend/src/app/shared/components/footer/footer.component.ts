import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SERVICES } from '../../../core/models/reference-data';
import { SettingsService } from '../../../core/services/settings.service';
import { NAV_LINKS } from '../header/header.component';
import { IconComponent } from '../icon/icon.component';
import { LogoComponent } from '../logo/logo.component';
import { RcNumberComponent } from '../rc-number/rc-number.component';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, IconComponent, LogoComponent, RcNumberComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let s = site.settings();
    <footer class="footer">
      <img
        class="footer__bg"
        src="assets/images/service-overseas-1600.webp"
        srcset="assets/images/service-overseas-800.webp 800w, assets/images/service-overseas-1600.webp 1600w"
        sizes="100vw"
        alt=""
        loading="lazy"
        decoding="async"
        aria-hidden="true"
      />

      <!-- Call-to-action strip -->
      <div class="container">
        <div class="footer__cta">
          <div>
            <p class="footer__cta-eyebrow">Employers &amp; job seekers</p>
            <h2 class="footer__cta-title">Hiring workers, or looking for work abroad?</h2>
            <p class="footer__cta-text">Share your requirement or register your profile — our team in Gorakhpur will get back to you.</p>
          </div>
          <div class="footer__cta-actions">
            <a routerLink="/employers" class="btn btn--gold">Hire Manpower</a>
            <a routerLink="/candidates" class="btn btn--outline-light">Register as Candidate</a>
            <a [href]="site.whatsappLink('general')" target="_blank" rel="noopener noreferrer" class="footer__cta-wa" aria-label="Chat on WhatsApp">
              <app-icon name="whatsapp" [size]="22" />
            </a>
          </div>
        </div>
      </div>

      <div class="container footer__grid">
        <div class="footer__about">
          <a routerLink="/" class="footer__brand" aria-label="Krishna International Overseas Services — Home">
            <app-logo variant="light" />
          </a>
          <p>{{ s.about_summary }}</p>
          <div class="footer__reg">
            <app-icon name="shield" [size]="18" />
            @if (s.mea_rc_number) {
              <span>Approved by MEA · Recruiting Agent · RC No. <app-rc-number [value]="s.mea_rc_number" /></span>
            } @else {
              <span>Registered establishment · Reg. No. {{ s.registration_number }}</span>
            }
          </div>
          @if (s.mea_rc_number && s.mea_rc_document_url) {
            <a class="footer__cert" [href]="s.mea_rc_document_url" target="_blank" rel="noopener">
              View MEA approval certificate <app-icon name="external" [size]="14" />
            </a>
          }
          @if (site.socialLinks().length) {
            <ul class="footer__social" aria-label="Social media">
              @for (l of site.socialLinks(); track l.name) {
                <li>
                  <a [href]="l.url" target="_blank" rel="noopener noreferrer" [attr.aria-label]="l.name" [title]="l.name">
                    <app-icon [name]="l.icon" [size]="18" />
                  </a>
                </li>
              }
            </ul>
          }
        </div>

        <nav aria-label="Footer">
          <h2 class="footer__title">Quick links</h2>
          <ul class="footer__links footer__links--cols">
            @for (link of links; track link.path) {
              <li><a [routerLink]="link.path"><span class="footer__chev"><app-icon name="chevron" [size]="14" /></span>{{ link.label }}</a></li>
            }
          </ul>
        </nav>

        <div>
          <h2 class="footer__title">Services</h2>
          <ul class="footer__links">
            @for (svc of services; track svc.slug) {
              <li><a routerLink="/services" [fragment]="svc.slug"><span class="footer__chev"><app-icon name="chevron" [size]="14" /></span>{{ svc.title }}</a></li>
            }
          </ul>
        </div>

        <div>
          <h2 class="footer__title">Get in touch</h2>
          <ul class="footer__contact">
            <li>
              <span class="footer__icon"><app-icon name="pin" [size]="18" /></span>
              <div>
                <span class="footer__label">Office</span>
                <span>{{ s.address }}</span>
              </div>
            </li>
            <li>
              <span class="footer__icon"><app-icon name="phone" [size]="18" /></span>
              <div>
                <span class="footer__label">Call</span>
                <a [href]="site.phoneHref()">{{ s.phone_primary }}</a>
                @if (s.phone_alternate) {
                  <a [href]="site.altPhoneHref()">{{ s.phone_alternate }}</a>
                }
              </div>
            </li>
            <li>
              <span class="footer__icon"><app-icon name="mail" [size]="18" /></span>
              <div>
                <span class="footer__label">Email</span>
                <a [href]="'mailto:' + s.email">{{ s.email }}</a>
              </div>
            </li>
            <li>
              <span class="footer__icon footer__icon--wa"><app-icon name="whatsapp" [size]="18" /></span>
              <div>
                <span class="footer__label">WhatsApp</span>
                <a [href]="site.whatsappLink('general')" target="_blank" rel="noopener noreferrer">Chat with us</a>
              </div>
            </li>
            @if (s.office_hours) {
              <li>
                <span class="footer__icon"><app-icon name="clock" [size]="18" /></span>
                <div>
                  <span class="footer__label">Office hours</span>
                  <span>{{ s.office_hours }}</span>
                </div>
              </li>
            }
          </ul>
        </div>
      </div>

      <div class="footer__bottom">
        <div class="container footer__bottom-inner">
          <p>© {{ year }} {{ s.company_name }}. All rights reserved.</p>
          <p class="footer__bottom-reg">
            @if (s.mea_rc_number) {
              MEA RC No. <app-rc-number [value]="s.mea_rc_number" /> ·
            }
            {{ s.registration_authority }} · Reg. No. {{ s.registration_number }}
          </p>
          <button type="button" class="footer__top" (click)="toTop()" aria-label="Back to top">
            Back to top <span class="footer__top-arrow"><app-icon name="arrow" [size]="14" /></span>
          </button>
        </div>
      </div>
    </footer>
  `,
  styles: `
    .footer {
      position: relative; isolation: isolate; overflow: hidden;
      background: var(--navy-950); color: rgba(255,255,255,.72); font-size: var(--fs-sm);
    }
    /* Background photo + layered navy overlay keeps text readable */
    .footer__bg {
      position: absolute; inset: 0; z-index: -2; width: 100%; height: 100%;
      object-fit: cover; object-position: center 40%; opacity: .9;
    }
    .footer::after {
      content: ''; position: absolute; inset: 0; z-index: -1;
      background:
        linear-gradient(90deg, rgba(6,20,39,.55) 0%, rgba(6,20,39,.15) 60%, rgba(6,20,39,.35) 100%),
        linear-gradient(180deg, rgba(11,37,69,.55) 0%, rgba(6,20,39,.84) 38%, rgba(6,20,39,.95) 70%, rgba(6,20,39,.98) 100%);
    }
    .footer::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, var(--gold-500), var(--gold-300) 40%, transparent); }

    /* CTA strip */
    .footer__cta {
      display: grid; gap: var(--sp-5); align-items: center;
      margin-top: clamp(2.5rem, 2rem + 2vw, 3.5rem);
      padding: clamp(1.5rem, 1rem + 2vw, 2.25rem) clamp(1.25rem, .75rem + 2vw, 2.5rem);
      border: 1px solid rgba(216,196,160,.22); border-radius: var(--radius-lg);
      background: linear-gradient(120deg, rgba(255,255,255,.08), rgba(255,255,255,.02));
      backdrop-filter: blur(8px);
      box-shadow: 0 24px 48px -24px rgba(0,0,0,.5);
    }
    @media (min-width: 992px) { .footer__cta { grid-template-columns: 1fr auto; gap: var(--sp-7); } }
    .footer__cta-eyebrow { margin: 0 0 var(--sp-2); font-size: var(--fs-xs); font-weight: 600; letter-spacing: .14em; text-transform: uppercase; color: var(--gold-300); }
    .footer__cta-title { margin: 0 0 var(--sp-2); font-size: var(--fs-xl); color: #fff; }
    .footer__cta-text { margin: 0; max-width: 560px; color: rgba(255,255,255,.72); line-height: 1.65; }
    .footer__cta-actions { display: flex; flex-wrap: wrap; align-items: center; gap: var(--sp-3); }
    .footer .footer__cta-actions .btn { text-decoration: none; }
    .footer .footer__cta-actions .btn--gold { color: var(--navy-950); }
    .footer .footer__cta-actions .btn--outline-light { color: #fff; }
    .footer .footer__cta-actions .btn--outline-light:hover { color: var(--navy-900); }
    .footer .footer__cta-wa {
      display: inline-flex; align-items: center; justify-content: center; width: 48px; height: 48px;
      border-radius: 50%; background: #1f8f4e; color: #fff;
      transition: background-color var(--dur) var(--ease), transform var(--dur) var(--ease);
    }
    .footer .footer__cta-wa:hover { background: #18733f; color: #fff; text-decoration: none; transform: translateY(-2px); }
    @media (max-width: 479.98px) {
      .footer__cta-actions .btn { flex: 1 1 100%; }
      .footer .footer__cta-wa { display: none; } /* floating WhatsApp button covers this on phones */
    }

    .footer__grid {
      display: grid; gap: var(--sp-7) var(--sp-6);
      padding-block: clamp(3rem, 2.5rem + 2vw, 4.5rem) var(--sp-7);
      grid-template-columns: 1fr;
    }
    @media (min-width: 640px) { .footer__grid { grid-template-columns: 1fr 1fr; } }
    @media (min-width: 1100px) { .footer__grid { grid-template-columns: 1.35fr .75fr 1.15fr 1.25fr; gap: var(--sp-6); } }

    .footer a { color: rgba(255,255,255,.8); text-decoration: none; transition: color var(--dur) var(--ease); }
    .footer a:hover { color: var(--gold-300); }

    /* Brand column */
    .footer__brand { display: inline-block; border-radius: var(--radius); }
    .footer__about p { margin: var(--sp-5) 0 var(--sp-5); max-width: 380px; line-height: 1.75; }
    .footer__reg {
      display: inline-flex; align-items: flex-start; gap: var(--sp-2); max-width: 100%;
      padding: 8px 14px; border: 1px solid rgba(216,196,160,.25); border-radius: var(--radius-pill);
      background: rgba(176,141,87,.1); font-size: var(--fs-xs); color: var(--gold-300);
    }
    .footer__reg span { overflow-wrap: anywhere; }
    .footer .footer__cert { display: flex; align-items: center; gap: 6px; margin-top: var(--sp-3); font-size: var(--fs-xs); font-weight: 600; color: var(--gold-300); }
    .footer .footer__cert:hover { color: #fff; text-decoration: underline; }
    .footer__social { display: flex; gap: var(--sp-2); margin: var(--sp-5) 0 0; padding: 0; list-style: none; }
    .footer .footer__social a {
      display: inline-flex; align-items: center; justify-content: center; width: 42px; height: 42px;
      border: 1px solid rgba(255,255,255,.16); border-radius: 50%; background: rgba(255,255,255,.05); color: #fff;
      transition: background-color var(--dur) var(--ease), border-color var(--dur) var(--ease), color var(--dur) var(--ease), transform var(--dur) var(--ease);
    }
    .footer .footer__social a:hover { border-color: var(--gold-500); background: var(--gold-500); color: var(--navy-950); transform: translateY(-3px); }

    /* Column titles with a short gold rule */
    .footer__title {
      position: relative; margin-bottom: var(--sp-5); padding-bottom: var(--sp-3);
      font-family: var(--font-sans); font-size: var(--fs-sm); font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: #fff;
    }
    .footer__title::after { content: ''; position: absolute; left: 0; bottom: 0; width: 32px; height: 2px; border-radius: 2px; background: var(--gold-500); }

    /* Link lists */
    .footer__links, .footer__contact { list-style: none; margin: 0; padding: 0; }
    .footer__links { display: grid; gap: var(--sp-3); }
    @media (max-width: 639.98px) { .footer__links--cols { grid-template-columns: 1fr 1fr; } }
    .footer__links a { display: inline-flex; align-items: center; gap: 6px; transition: color var(--dur) var(--ease), transform var(--dur) var(--ease); }
    .footer__chev { display: inline-flex; color: var(--gold-500); opacity: .7; transition: transform var(--dur) var(--ease), opacity var(--dur) var(--ease); }
    .footer__links a:hover { transform: translateX(3px); }
    .footer__links a:hover .footer__chev { opacity: 1; transform: translateX(2px); }

    /* Contact list with icon tiles */
    .footer__contact { display: grid; gap: var(--sp-4); }
    .footer__contact li { display: grid; grid-template-columns: 38px 1fr; gap: var(--sp-3); align-items: start; line-height: 1.55; }
    .footer__contact li > div { display: flex; flex-direction: column; min-width: 0; overflow-wrap: anywhere; }
    .footer__icon {
      display: inline-flex; align-items: center; justify-content: center; width: 38px; height: 38px;
      border: 1px solid rgba(216,196,160,.2); border-radius: 10px; background: rgba(176,141,87,.12); color: var(--gold-300);
    }
    .footer__icon--wa { border-color: rgba(37,211,102,.25); background: rgba(31,143,78,.2); color: #5fd28f; }
    .footer__label { margin-bottom: 1px; font-size: .6875rem; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; color: rgba(255,255,255,.5); }
    .footer__contact a { font-weight: 500; color: #fff; }

    /* Bottom bar */
    .footer__bottom { border-top: 1px solid rgba(255,255,255,.1); background: rgba(0,0,0,.28); }
    .footer__bottom-inner {
      display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: var(--sp-3) var(--sp-5);
      padding-block: var(--sp-5); font-size: var(--fs-xs); color: rgba(255,255,255,.55);
    }
    .footer__bottom p { margin: 0; }
    .footer__top {
      display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px;
      border: 1px solid rgba(255,255,255,.18); border-radius: var(--radius-pill); background: transparent;
      font-size: var(--fs-xs); font-weight: 600; color: rgba(255,255,255,.8); cursor: pointer;
      transition: background-color var(--dur) var(--ease), color var(--dur) var(--ease), border-color var(--dur) var(--ease);
    }
    .footer__top-arrow { display: inline-flex; transform: rotate(-90deg); }
    .footer__top:hover { background: var(--gold-500); border-color: var(--gold-500); color: var(--navy-950); }
    @media (max-width: 767.98px) {
      .footer__bottom-inner { flex-direction: column; align-items: flex-start; }
      /* keep clear of the floating WhatsApp button */
      .footer__bottom-inner { padding-bottom: calc(var(--sp-5) + 64px); }
    }
  `,
})
export class FooterComponent {
  protected readonly site = inject(SettingsService);
  protected readonly links = NAV_LINKS;
  protected readonly services = SERVICES;
  protected readonly year = new Date().getFullYear();

  toTop(): void {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  }
}
