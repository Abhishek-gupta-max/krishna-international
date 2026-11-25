import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SettingsService } from '../../core/services/settings.service';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { CertificateViewerComponent } from '../../shared/components/certificate-viewer/certificate-viewer.component';
import { RcNumberComponent } from '../../shared/components/rc-number/rc-number.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { RevealDirective } from '../../shared/directives/reveal.directive';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [RouterLink, PageHeaderComponent, IconComponent, RevealDirective, RcNumberComponent, CertificateViewerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let s = site.settings();
    <app-page-header
      title="About Krishna International Overseas Services"
      crumb="About Us"
      image="page-documents"
      intro="A registered manpower supply firm in Gorakhpur, connecting employers with workers they can rely on."
    />

    <!-- Introduction -->
    <section class="section">
      <div class="container split split--top">
        <div appReveal>
          <p class="eyebrow">Who we are</p>
          <h2>Built on local knowledge and honest dealings</h2>
          <p class="lead">{{ s.about_summary }}</p>
          @if (s.about_body) {
            <div class="prose-text">{{ s.about_body }}</div>
          }
        </div>
        <div appReveal>
          <div class="media-frame media-frame--4x3">
            <img src="assets/images/about-interview-800.webp" srcset="assets/images/about-interview-800.webp 800w, assets/images/about-interview-1600.webp 1600w" sizes="(min-width: 992px) 560px, 100vw" alt="Recruiter in discussion with a job candidate" loading="lazy" width="800" height="533" />
          </div>
        </div>
      </div>
    </section>

    <!-- Vision & Mission -->
    @if (s.vision || s.mission) {
      <section class="section section--navy">
        <div class="container vm">
          @if (s.vision) {
            <div class="vm__item" appReveal>
              <p class="eyebrow">Our vision</p>
              <p class="vm__text">{{ s.vision }}</p>
            </div>
          }
          @if (s.mission) {
            <div class="vm__item" appReveal>
              <p class="eyebrow">Our mission</p>
              <p class="vm__text">{{ s.mission }}</p>
            </div>
          }
        </div>
      </section>
    }

    <!-- Objectives & Management -->
    <section class="section">
      <div class="container split split--top">
        @if (objectives().length) {
          <div appReveal>
            <p class="eyebrow">Company objectives</p>
            <h2>What we set out to do</h2>
            <ul class="check-list" style="margin-top: var(--sp-5)">
              @for (o of objectives(); track $index) {
                <li>{{ o }}</li>
              }
            </ul>
          </div>
        }
        <div appReveal>
          <p class="eyebrow">Management</p>
          <h2>Leadership</h2>
          @if (s.management_intro) {
            <p class="lead">{{ s.management_intro }}</p>
          }
          <div class="people">
            <div class="person">
              <span class="person__initials" aria-hidden="true">{{ initials(s.contact_person) }}</span>
              <div>
                <strong>{{ s.contact_person }}</strong>
                <span>Contact person &amp; operations</span>
              </div>
            </div>
            <div class="person">
              <span class="person__initials" aria-hidden="true">{{ initials(s.registered_owner) }}</span>
              <div>
                <strong>{{ s.registered_owner }}</strong>
                <span>Registered owner</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Registration -->
    <section class="section section--alt" aria-labelledby="reg-title">
      <div class="container split split--top">
        <div appReveal>
          <p class="eyebrow">Company registration</p>
          <h2 id="reg-title">Registration details</h2>
          <p class="lead">
            @if (s.mea_rc_number) {
              We are a Recruiting Agent registered with the Ministry of External Affairs, Government of India, under the Emigration Act, 1983. Our
              business premises are also registered as an establishment in Uttar Pradesh.
            } @else {
              The business is registered as an establishment in Uttar Pradesh.
            }
            You are welcome to visit our office or call us to verify any vacancy or communication that uses our name.
          </p>
          <div class="alert alert--info" style="margin-top: var(--sp-5)">
            <app-icon name="info" />
            <p>
              @if (s.mea_rc_number) {
                You can check our Recruiting Agent registration (RC No. <app-rc-number [value]="s.mea_rc_number" />) on the Government of India's
                <a href="https://emigrate.gov.in" target="_blank" rel="noopener noreferrer">eMigrate portal</a>.
              }
              Please verify the details of any overseas job offer directly with our office before making travel or payment decisions.
            </p>
          </div>
        </div>
        <div class="reg-side">
        <div class="card reg-card" appReveal>
          <dl class="detail-list">
            <div><dt>Business name</dt><dd>{{ s.company_name }}</dd></div>
            <div><dt>Business type</dt><dd>{{ s.business_type }}</dd></div>
            @if (s.mea_rc_number) {
              <div><dt>MEA RC number</dt><dd><app-rc-number [value]="s.mea_rc_number" /></dd></div>
              <div><dt>RC issued under</dt><dd>{{ s.mea_rc_authority }}</dd></div>
            }
            <div><dt>Shop &amp; Establishment No.</dt><dd>{{ s.registration_number }}</dd></div>
            <div><dt>Registered under</dt><dd>{{ s.registration_authority }}</dd></div>
            <div><dt>Registered owner</dt><dd>{{ s.registered_owner }}</dd></div>
            <div><dt>Registered address</dt><dd>{{ s.address }}</dd></div>
          </dl>
        </div>
        </div>
      </div>
      @if (s.mea_rc_number && s.mea_rc_document_url) {
        <div class="container cert-row" appReveal>
          <app-certificate-viewer [url]="s.mea_rc_document_url" />
        </div>
      }
    </section>

    <section class="section section--tight">
      <div class="container closing">
        <h2>Work with us</h2>
        <div class="btn-row">
          <a routerLink="/employers" class="btn">Hire manpower</a>
          <a routerLink="/candidates" class="btn btn--outline">Register as candidate</a>
          <a routerLink="/contact" class="btn btn--ghost">Contact us</a>
        </div>
      </div>
    </section>
  `,
  styles: `
    .vm { display: grid; gap: var(--sp-7); }
    @media (min-width: 768px) { .vm { grid-template-columns: 1fr 1fr; gap: var(--sp-8); } }
    .vm__item {
      height: 100%; padding: clamp(1.5rem, 1rem + 2vw, 2.5rem);
      border: 1px solid var(--hairline-light); border-radius: var(--radius-lg); background: rgba(255,255,255,.04);
      transition: transform var(--dur-slow) var(--ease), background-color var(--dur) var(--ease), border-color var(--dur) var(--ease);
    }
    .vm__item:hover { transform: translateY(-4px); background: rgba(255,255,255,.07); border-color: rgba(216,196,160,.4); }
    .vm__text { margin: 0; font-family: var(--font-serif); font-size: var(--fs-xl); line-height: 1.5; color: #fff; }
    .people { display: grid; gap: var(--sp-4); margin-top: var(--sp-5); }
    .person {
      display: flex; align-items: center; gap: var(--sp-4); padding: var(--sp-4);
      border: 1px solid var(--color-border); border-radius: var(--radius); background: #fff;
      transition: transform var(--dur) var(--ease), box-shadow var(--dur) var(--ease), border-color var(--dur) var(--ease);
    }
    .person:hover { transform: translateY(-3px); box-shadow: var(--shadow-lg); border-color: var(--gold-300); }
    .person__initials { transition: background-color var(--dur) var(--ease), color var(--dur) var(--ease); }
    .person:hover .person__initials { background: var(--gold-500); color: var(--navy-950); }
    .person__initials {
      display: inline-flex; align-items: center; justify-content: center; flex: none;
      width: 52px; height: 52px; border-radius: 50%; background: var(--navy-900); color: #fff;
      font-family: var(--font-serif); font-size: 1.125rem; letter-spacing: .02em;
    }
    .person strong { display: block; color: var(--navy-900); }
    .person span { font-size: var(--fs-sm); color: var(--grey-500); }
    .reg-card { padding: var(--sp-3) var(--sp-5); }
    .reg-side { display: grid; gap: var(--sp-5); min-width: 0; }
    .cert-row { max-width: calc(820px + var(--gutter) * 2); margin-top: var(--sp-7); }
    .closing { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: var(--sp-5); }
    .closing h2 { margin: 0; }
  `,
})
export class AboutComponent {
  protected readonly site = inject(SettingsService);
  protected readonly objectives = computed(() => this.site.settings().objectives ?? []);

  protected initials(name: string): string {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0].toUpperCase())
      .join('');
  }
}
