import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AppError } from '../../../core/models/api.models';
import { Application, ApplicationStatus } from '../../../core/models/domain.models';
import { AdminApiService } from '../../../core/services/admin-api.service';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmService } from '../../../shared/components/confirm-dialog/confirm.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { FileSizePipe, LabelPipe } from '../../../shared/pipes/labels.pipes';
import { downloadCv } from './cv-download';

@Component({
  selector: 'app-application-detail',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, DatePipe, IconComponent, LabelPipe, FileSizePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="admin-page">
      <a routerLink="/admin/applications" class="back-link"><app-icon name="arrow-left" [size]="16" /> All applications</a>

      @if (error()) {
        <div class="alert alert--error" role="alert"><app-icon name="alert" /><p>{{ error() }}</p></div>
      }

      @if (app(); as a) {
        <div class="admin-head">
          <div>
            <h1>{{ a.candidate.fullName }}</h1>
            <p>
              {{ a.job ? 'Applied for ' + a.job.title + ' (' + a.job.country + ')' : 'General registration' }} ·
              received {{ a.createdAt | date: 'd MMM y, h:mm a' }}
            </p>
          </div>
          <span class="badge badge--{{ a.status }}">{{ a.status | label }}</span>
        </div>

        <div class="detail-grid">
          <div class="admin-page">
            <section class="panel">
              <div class="panel__head"><h2>Candidate details</h2></div>
              <div class="panel__body">
                <dl class="detail-list">
                  <div><dt>Full name</dt><dd>{{ a.candidate.fullName }}</dd></div>
                  <div><dt>Mobile</dt><dd><a [href]="'tel:' + a.candidate.mobile">{{ a.candidate.mobile }}</a></dd></div>
                  <div><dt>Email</dt><dd><a [href]="'mailto:' + a.candidate.email">{{ a.candidate.email }}</a></dd></div>
                  <div><dt>Qualification</dt><dd>{{ a.candidate.qualification }}</dd></div>
                  <div><dt>Experience</dt><dd>{{ a.candidate.experienceYears }} years</dd></div>
                  <div><dt>Current location</dt><dd>{{ a.candidate.currentLocation || '—' }}</dd></div>
                  <div><dt>Preferred country</dt><dd>{{ a.candidate.preferredCountry }}</dd></div>
                  <div><dt>Preferred category</dt><dd>{{ a.candidate.preferredCategory }}</dd></div>
                  <div><dt>Valid passport</dt><dd>{{ a.candidate.passportAvailable === null ? 'Not stated' : a.candidate.passportAvailable ? 'Yes' : 'No' }}</dd></div>
                </dl>
              </div>
            </section>

            @if (a.coverNote) {
              <section class="panel">
                <div class="panel__head"><h2>Candidate's note</h2></div>
                <div class="panel__body"><p class="text-block" style="margin: 0">{{ a.coverNote }}</p></div>
              </section>
            }
          </div>

          <div class="admin-page">
            <section class="panel">
              <div class="panel__head"><h2>CV</h2></div>
              <div class="panel__body">
                @if (a.candidate.hasCv) {
                  <div class="cv">
                    <app-icon name="file" [size]="28" />
                    <div>
                      <strong>{{ a.candidate.cvOriginalName }}</strong>
                      <span>{{ a.candidate.cvSize | fileSize }}</span>
                    </div>
                  </div>
                  <button type="button" class="btn btn--block" (click)="download()"><app-icon name="download" [size]="18" /> Download CV</button>
                } @else {
                  <p class="muted" style="margin: 0">No CV was uploaded.</p>
                }
              </div>
            </section>

            <section class="panel">
              <div class="panel__head"><h2>Review</h2></div>
              <div class="panel__body review">
                <div class="field">
                  <label class="label" for="a-status">Status</label>
                  <select id="a-status" class="select" [formControl]="status">
                    @for (s of statuses; track s) {
                      <option [value]="s">{{ s | label }}</option>
                    }
                  </select>
                </div>
                <div class="field">
                  <label class="label" for="a-notes">Internal notes</label>
                  <textarea id="a-notes" class="textarea" rows="5" [formControl]="notes" placeholder="Visible to admins only"></textarea>
                </div>
                <button type="button" class="btn btn--block" (click)="save()" [disabled]="saving()">
                  @if (saving()) {
                    <span class="spinner" aria-hidden="true"></span>
                  }
                  Save review
                </button>
                @if (a.reviewedAt) {
                  <p class="muted">Last reviewed {{ a.reviewedAt | date: 'd MMM y, h:mm a' }}</p>
                }
              </div>
            </section>

            <button type="button" class="btn btn--ghost" style="color: var(--color-danger)" (click)="remove()"><app-icon name="trash" [size]="16" /> Delete application</button>
          </div>
        </div>
      } @else if (!error()) {
        <div class="skeleton" style="height: 420px"></div>
      }
    </div>
  `,
  styles: `
    .muted { font-size: var(--fs-xs); color: var(--grey-500); }
    .review { display: grid; gap: var(--sp-4); }
    .cv { display: flex; align-items: center; gap: var(--sp-3); margin-bottom: var(--sp-4); min-width: 0; }
    .cv app-icon { color: var(--navy-700); flex: none; }
    .cv strong { display: block; font-size: var(--fs-sm); word-break: break-all; }
    .cv span { font-size: var(--fs-xs); color: var(--grey-500); }
  `,
})
export class ApplicationDetailComponent implements OnInit {
  private readonly api = inject(AdminApiService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);
  private readonly router = inject(Router);

  readonly id = input.required<string>();

  protected readonly statuses: ApplicationStatus[] = ['new', 'reviewed', 'shortlisted', 'rejected', 'hired'];
  protected readonly app = signal<Application | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly saving = signal(false);
  protected readonly status = new FormControl<ApplicationStatus>('new', { nonNullable: true });
  protected readonly notes = new FormControl('', { nonNullable: true });

  ngOnInit(): void {
    this.api.application(Number(this.id())).subscribe({
      next: (a) => this.setApp(a),
      error: (e: AppError) => this.error.set(e.message),
    });
  }

  private setApp(a: Application): void {
    this.app.set(a);
    this.status.setValue(a.status);
    this.notes.setValue(a.adminNotes ?? '');
  }

  save(): void {
    this.saving.set(true);
    this.api
      .updateApplication(Number(this.id()), { status: this.status.value, adminNotes: this.notes.value })
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (a) => {
          this.setApp(a);
          this.toast.success('Review saved.');
        },
        error: (e: AppError) => this.toast.error(e.message),
      });
  }

  download(): void {
    const a = this.app();
    if (a) downloadCv(this.api, this.toast, a);
  }

  async remove(): Promise<void> {
    const ok = await this.confirm.ask({
      title: 'Delete this application?',
      message: 'The application will be removed from the admin panel. This cannot be undone from the dashboard.',
      confirmLabel: 'Delete',
      danger: true,
    });
    if (!ok) return;
    this.api.deleteApplication(Number(this.id())).subscribe({
      next: () => {
        this.toast.success('Application deleted.');
        this.router.navigate(['/admin/applications']);
      },
      error: (e: AppError) => this.toast.error(e.message),
    });
  }
}
