import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { SettingsService } from '../../core/services/settings.service';
import { ContactFormComponent } from '../../shared/components/contact-form/contact-form.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [RouterLink, PageHeaderComponent, ContactFormComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let s = site.settings();
    <app-page-header title="Contact Us" intro="Call, write or visit our office in Gorakhpur. We are happy to help employers and job seekers alike." />

    <section class="section">
      <div class="container layout">
        <div class="info">
          <h2>Our office</h2>
          <ul class="info__list">
            <li>
              <app-icon name="pin" />
              <div>
                <h3>Address</h3>
                <p>{{ s.address }}</p>
                <a [href]="directionsUrl()" target="_blank" rel="noopener noreferrer" class="link-arrow">Get directions <app-icon name="external" /></a>
              </div>
            </li>
            <li>
              <app-icon name="phone" />
              <div>
                <h3>Phone</h3>
                <p>
                  <a [href]="site.phoneHref()">{{ s.phone_primary }}</a>
                  @if (s.phone_alternate) {
                    <br /><a [href]="site.altPhoneHref()">{{ s.phone_alternate }}</a>
                  }
                </p>
              </div>
            </li>
            <li>
              <app-icon name="mail" />
              <div>
                <h3>Email</h3>
                <p><a [href]="'mailto:' + s.email">{{ s.email }}</a></p>
              </div>
            </li>
            <li>
              <app-icon name="users" />
              <div>
                <h3>Contact person</h3>
                <p>{{ s.contact_person }}</p>
              </div>
            </li>
            @if (s.office_hours) {
              <li>
                <app-icon name="clock" />
                <div>
                  <h3>Office hours</h3>
                  <p>{{ s.office_hours }}</p>
                </div>
              </li>
            }
          </ul>

          <div class="wa">
            <h3>Message us on WhatsApp</h3>
            <p class="wa__numbers">
              @for (w of site.whatsappNumbers(); track w.number) {
                <a [href]="w.link" target="_blank" rel="noopener noreferrer"><app-icon name="whatsapp" [size]="16" /> {{ w.label }}</a>
              }
            </p>
            <div class="wa__links">
              <a class="btn btn--whatsapp" [href]="site.whatsappLink('general')" target="_blank" rel="noopener noreferrer"><app-icon name="whatsapp" /> General enquiry</a>
              <a class="btn btn--outline" [href]="site.whatsappLink('job')" target="_blank" rel="noopener noreferrer">Job application</a>
              <a class="btn btn--outline" [href]="site.whatsappLink('employer')" target="_blank" rel="noopener noreferrer">Employer enquiry</a>
            </div>
          </div>
        </div>

        <div class="layout__form">
          <h2>Send us a message</h2>
          <p class="lead" style="margin-bottom: var(--sp-6)">For hiring requirements, the <a routerLink="/employers">employer enquiry form</a> lets you share full details.</p>
          <div class="form-card">
            <app-contact-form />
          </div>
        </div>
      </div>
    </section>

    <section class="map" aria-label="Map showing our office location">
      <iframe
        [src]="mapUrl()"
        title="Map: Krishna International Overseas Services, Kudaghat, Gorakhpur"
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
      ></iframe>
    </section>
  `,
  styles: `
    .layout { display: grid; gap: var(--sp-8); }
    @media (min-width: 992px) { .layout { grid-template-columns: 5fr 7fr; gap: var(--sp-8); align-items: start; } }
    .layout__form { min-width: 0; }
    .info__list { display: grid; gap: var(--sp-5); margin: var(--sp-5) 0 0; padding: 0; list-style: none; }
    .info__list li { display: grid; grid-template-columns: 44px 1fr; gap: var(--sp-4); padding-bottom: var(--sp-5); border-bottom: 1px solid var(--grey-100); }
    .info__list app-icon {
      display: inline-flex; align-items: center; justify-content: center; width: 44px; height: 44px;
      border: 1px solid var(--color-border); border-radius: var(--radius); color: var(--gold-600);
    }
    .info__list h3 { margin-bottom: 4px; font-size: var(--fs-xs); letter-spacing: .1em; text-transform: uppercase; color: var(--grey-500); }
    .info__list p { margin: 0 0 var(--sp-2); font-weight: 500; overflow-wrap: anywhere; }
    .info__list a:not(.link-arrow) { color: var(--navy-900); text-decoration: none; }
    .info__list a:not(.link-arrow):hover { color: var(--gold-600); text-decoration: underline; }
    .wa { margin-top: var(--sp-6); }
    .wa h3 { font-size: var(--fs-base); }
    .wa__links { display: flex; flex-wrap: wrap; gap: var(--sp-2); }
    .wa__numbers { display: flex; flex-wrap: wrap; gap: var(--sp-2) var(--sp-5); margin: 0 0 var(--sp-4); }
    .wa__numbers a { display: inline-flex; align-items: center; gap: 6px; font-weight: 600; color: #18733f; text-decoration: none; }
    .wa__numbers a:hover { text-decoration: underline; }
    .map { line-height: 0; border-top: 1px solid var(--color-border); }
    .map iframe { width: 100%; height: clamp(320px, 40vw, 460px); border: 0; filter: grayscale(.15); }
  `,
})
export class ContactComponent {
  protected readonly site = inject(SettingsService);
  private readonly sanitizer = inject(DomSanitizer);

  /** Google Maps embed (no API key required). The query comes from admin settings and is URL-encoded. */
  protected readonly mapUrl = computed(() =>
    this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.google.com/maps?q=${encodeURIComponent(this.site.settings().map_query || this.site.settings().address)}&output=embed`
    )
  );

  protected readonly directionsUrl = computed(
    () => `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(this.site.settings().map_query || this.site.settings().address)}`
  );
}
