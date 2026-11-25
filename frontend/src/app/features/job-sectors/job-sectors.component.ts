import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { JOB_CATEGORIES, SECTORS } from '../../core/models/reference-data';
import { SettingsService } from '../../core/services/settings.service';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { RevealDirective } from '../../shared/directives/reveal.directive';

/**
 * Job Sectors page: a light, text-first layout — wave strip, large heading with a short
 * accent rule, then the trades and industry sectors we recruit for as simple lists.
 */
@Component({
  selector: 'app-job-sectors',
  standalone: true,
  imports: [RouterLink, IconComponent, RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Decorative wave strip under the header -->
    <div class="wave" aria-hidden="true">
      <svg viewBox="0 0 1440 90" preserveAspectRatio="none">
        <path class="wave__back" d="M0 0h1440v58c-120 14-260 26-420 20S700 50 540 52 240 74 0 62z" />
        <path class="wave__front" d="M0 0h1440v34c-180 22-330 30-500 18S640 26 480 34 200 58 0 40z" />
      </svg>
      <p class="wave__note container">
        <app-icon name="shield" [size]="16" />
        @if (site.settings().mea_rc_number) {
          MEA Registered Recruiting Agent · RC No. {{ site.settings().mea_rc_number }}
        } @else {
          Registered establishment · Reg. No. {{ site.settings().registration_number }}
        }
      </p>
    </div>

    <section class="sectors-page">
      <div class="container">
        <nav aria-label="Breadcrumb" class="crumbs">
          <a routerLink="/">Home</a>
          <app-icon name="chevron" [size]="14" />
          <span aria-current="page">Job Sectors</span>
        </nav>

        <h1 class="title">Job Sectors</h1>
        <span class="rule" aria-hidden="true"></span>

        <div class="body" appReveal>
          <h2 class="subtitle">Job sectors and trades we cover</h2>
          <p>
            We recruit skilled, semi-skilled and unskilled workers from India for employers abroad — from individual tradespeople to complete
            project teams.
          </p>
          <p>
            Our team understands the manpower needs of each industry and screens candidates against the actual job, so employers receive
            suitable profiles within the agreed time.
          </p>

          <p class="lead-in">We recruit for the following trades and job roles:</p>
          <ul class="list list--cols">
            @for (role of roles; track role) {
              <li>{{ role }}</li>
            }
          </ul>

          <p class="lead-in">In terms of industry sectors, we cover:</p>
          <ul class="list list--sectors">
            @for (sec of sectors; track sec.name) {
              <li>
                <strong>{{ sec.name }}</strong>
                <span>{{ sec.note }}</span>
              </li>
            }
            <li class="list__more"><strong>&amp; more…</strong><span>Tell us your requirement</span></li>
          </ul>
        </div>

        <div class="cta-row" appReveal>
          <a routerLink="/candidates" class="btn btn--outline btn--lg">Register as Candidate</a>
          <a routerLink="/employers" class="btn btn--gold btn--lg">Hire Manpower <app-icon name="arrow" [size]="18" /></a>
        </div>
      </div>
    </section>
  `,
  styles: `
    /* ---------- Wave strip ---------- */
    .wave { position: relative; height: clamp(56px, 4vw + 36px, 90px); background: #fff; overflow: hidden; }
    .wave svg { position: absolute; inset: 0; width: 100%; height: 100%; }
    .wave__back { fill: var(--gold-100); }
    .wave__front { fill: var(--navy-100); }
    .wave__note {
      position: relative; display: flex; align-items: center; gap: 8px; height: 60%;
      margin: 0 auto; font-size: var(--fs-sm); font-weight: 600; color: var(--navy-800); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .wave__note app-icon { color: var(--gold-600); }
    @media (max-width: 575.98px) { .wave__note { font-size: var(--fs-xs); } }

    /* ---------- Page body ---------- */
    .sectors-page { padding-block: clamp(2rem, 1.5rem + 3vw, 4rem) clamp(3.5rem, 2.5rem + 4vw, 6rem); background: #fff; }
    .sectors-page .container { max-width: calc(1080px + var(--gutter) * 2); }

    .crumbs { display: flex; align-items: center; gap: 6px; margin-bottom: var(--sp-5); font-size: var(--fs-xs); color: var(--grey-500); }
    .crumbs a { color: var(--grey-600); text-decoration: none; }
    .crumbs a:hover { color: var(--gold-600); text-decoration: underline; }

    .title { margin: 0; font-size: clamp(2.5rem, 1.6rem + 3.6vw, 3.75rem); font-weight: 700; letter-spacing: -0.025em; color: var(--navy-900); }
    .rule { display: block; width: 52px; height: 3px; margin: var(--sp-5) 0 clamp(2rem, 1.5rem + 2vw, 3.5rem); border-radius: 3px; background: var(--gold-500); }

    .body { max-width: 900px; padding-left: clamp(0rem, -1rem + 3vw, 1.75rem); }
    .subtitle { margin-bottom: var(--sp-3); font-size: clamp(1.25rem, 1.1rem + .5vw, 1.4375rem); font-weight: 500; letter-spacing: -0.01em; color: var(--ink); }
    .body > p { color: var(--grey-600); line-height: 1.75; }
    .lead-in { margin: var(--sp-6) 0 var(--sp-3); font-weight: 700; color: var(--grey-800) !important; }

    /* Lists: simple text bullets, gold markers */
    .list { margin: 0; padding: 0; list-style: none; display: grid; gap: 10px var(--sp-6); }
    .list li { position: relative; padding-left: 20px; color: var(--grey-800); line-height: 1.5; }
    .list li::before {
      content: ''; position: absolute; left: 2px; top: .55em; width: 7px; height: 7px; border-radius: 50%; background: var(--gold-500);
      transition: transform var(--dur) var(--ease);
    }
    .list li:hover::before { transform: scale(1.4); }
    .list--cols { grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); }
    @media (max-width: 479.98px) { .list--cols { grid-template-columns: 1fr 1fr; gap: 10px var(--sp-4); font-size: var(--fs-sm); } }
    .list--sectors { grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: var(--sp-4) var(--sp-6); }
    .list--sectors strong { display: block; font-weight: 600; color: var(--navy-900); }
    .list--sectors span { font-size: var(--fs-sm); color: var(--grey-500); }
    .list__more strong { color: var(--gold-600) !important; }

    .cta-row { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: var(--sp-3); margin-top: clamp(2.5rem, 2rem + 2vw, 4rem); }
    @media (max-width: 575.98px) { .cta-row .btn { flex: 1 1 100%; } }
  `,
})
export class JobSectorsComponent {
  protected readonly site = inject(SettingsService);
  protected readonly roles = JOB_CATEGORIES.filter((c) => c !== 'Other');
  protected readonly sectors = SECTORS;
}
