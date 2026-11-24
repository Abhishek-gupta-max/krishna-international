import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PROCESS_STEPS } from '../../core/models/reference-data';
import { SettingsService } from '../../core/services/settings.service';
import { EmployerFormComponent } from '../../shared/components/employer-form/employer-form.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-employers',
  standalone: true,
  imports: [PageHeaderComponent, EmployerFormComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let s = site.settings();
    <app-page-header
      title="Hire Manpower"
      crumb="Employers"
      image="service-employer"
      intro="Share your requirement and our team will prepare a sourcing plan — from a handful of specialists to a full project workforce."
    />

    <section class="section">
      <div class="container layout">
        <div class="layout__main">
          <h2>Employer enquiry</h2>
          <p class="lead" style="margin-bottom: var(--sp-6)">The more detail you share, the faster we can shortlist suitable candidates.</p>
          <div class="form-card">
            <app-employer-form />
          </div>
        </div>

        <aside class="layout__side">
          <div class="card side-card">
            <h3>What to include</h3>
            <ul class="check-list">
              <li>Job titles and number of workers per role</li>
              <li>Minimum experience and qualifications</li>
              <li>Salary, working hours and contract length</li>
              <li>Accommodation, food and transport terms</li>
              <li>Preferred interview dates and location</li>
            </ul>
          </div>

          <div class="card side-card">
            <h3>How we work with you</h3>
            <ol class="steps">
              @for (step of steps; track step.title; let i = $index) {
                <li><span>{{ i + 1 }}</span>{{ step.title }}</li>
              }
            </ol>
          </div>

          <div class="card side-card side-card--navy">
            <h3>Prefer to talk?</h3>
            <p>Speak directly with {{ s.contact_person }}.</p>
            <a class="btn btn--gold btn--block" [href]="site.phoneHref()"><app-icon name="phone" /> {{ s.phone_primary }}</a>
            <a class="btn btn--outline-light btn--block" [href]="site.whatsappLink('employer')" target="_blank" rel="noopener noreferrer">
              <app-icon name="whatsapp" /> WhatsApp us
            </a>
          </div>
        </aside>
      </div>
    </section>
  `,
  styles: `
    .layout { display: grid; gap: var(--sp-7); }
    @media (min-width: 992px) { .layout { grid-template-columns: minmax(0, 1fr) 360px; align-items: start; } }
    .layout__main { min-width: 0; }
    .layout__side { display: grid; gap: var(--sp-5); }
    .side-card { padding: var(--sp-5); }
    .side-card h3 { font-size: var(--fs-base); margin-bottom: var(--sp-4); }
    .side-card .check-list { font-size: var(--fs-sm); }
    .side-card--navy { background: var(--gradient-navy); border-color: var(--navy-900); color: rgba(255,255,255,.78); display: grid; gap: var(--sp-3); }
    .side-card--navy h3 { color: #fff; margin-bottom: 0; }
    .side-card--navy p { margin: 0 0 var(--sp-2); font-size: var(--fs-sm); }
    .steps { display: grid; gap: var(--sp-3); margin: 0; padding: 0; list-style: none; font-size: var(--fs-sm); }
    .steps li { display: flex; align-items: center; gap: var(--sp-3); padding: 4px 6px; margin: -4px -6px; border-radius: var(--radius-sm); transition: background-color var(--dur) var(--ease); }
    .steps li:hover { background: var(--gold-100); }
    .steps li:hover span { background: var(--gold-500); color: var(--navy-950); }
    .steps span {
      display: inline-flex; align-items: center; justify-content: center; flex: none; width: 26px; height: 26px;
      border: 1px solid var(--gold-500); border-radius: 50%; font-size: var(--fs-xs); font-weight: 600; color: var(--gold-600); transition: background-color var(--dur) var(--ease), color var(--dur) var(--ease);
    }
  `,
})
export class EmployersComponent {
  protected readonly site = inject(SettingsService);
  protected readonly steps = PROCESS_STEPS;
}
