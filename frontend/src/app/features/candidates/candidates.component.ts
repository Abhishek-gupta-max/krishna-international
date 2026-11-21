import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SettingsService } from '../../core/services/settings.service';
import { CandidateFormComponent } from '../../shared/components/candidate-form/candidate-form.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-candidates',
  standalone: true,
  imports: [RouterLink, PageHeaderComponent, CandidateFormComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header
      title="Candidate Registration"
      crumb="Candidates"
      image="service-skilled"
      intro="Register once with your details and CV. We will contact you when a vacancy matches your trade, experience and preferred country."
    />

    <section class="section">
      <div class="container layout">
        <div class="layout__main">
          <h2>Register your profile</h2>
          <p class="lead" style="margin-bottom: var(--sp-6)">
            Looking at a specific vacancy? <a routerLink="/jobs">Browse current jobs</a> and apply from the job page instead.
          </p>
          <div class="form-card">
            <app-candidate-form />
          </div>
        </div>

        <aside class="layout__side">
          <div class="card side-card">
            <h3>Keep these documents ready</h3>
            <ul class="check-list">
              <li>Passport (valid for at least 6 months is commonly required)</li>
              <li>Educational and trade certificates</li>
              <li>Experience letters from previous employers</li>
              <li>Recent passport-size photographs</li>
              <li>Updated CV with contact number</li>
            </ul>
          </div>

          <div class="card side-card">
            <h3>What happens next</h3>
            <ol class="next">
              <li>We review your profile against current and upcoming requirements.</li>
              <li>If you match a vacancy, we call you to explain the job and terms.</li>
              <li>Shortlisted candidates are invited to an interview or trade test.</li>
            </ol>
          </div>

          <div class="alert alert--warning">
            <app-icon name="shield" />
            <p>
              <strong>Stay safe.</strong> Confirm any job offer made in our name by calling
              <a [href]="site.phoneHref()">{{ site.settings().phone_primary }}</a>. Never hand over your original passport or pay money to anyone
              without a written receipt from our office.
            </p>
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
    .next { margin: 0; padding-left: 1.1rem; display: grid; gap: var(--sp-3); font-size: var(--fs-sm); color: var(--grey-600); }
  `,
})
export class CandidatesComponent {
  protected readonly site = inject(SettingsService);
}
