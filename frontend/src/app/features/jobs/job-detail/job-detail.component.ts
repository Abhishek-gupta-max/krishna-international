import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppError } from '../../../core/models/api.models';
import { Job } from '../../../core/models/domain.models';
import { PublicApiService } from '../../../core/services/public-api.service';
import { SeoService } from '../../../core/services/seo.service';
import { SettingsService } from '../../../core/services/settings.service';
import { CandidateFormComponent } from '../../../shared/components/candidate-form/candidate-form.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { LabelPipe } from '../../../shared/pipes/labels.pipes';

@Component({
  selector: 'app-job-detail',
  standalone: true,
  imports: [RouterLink, DatePipe, PageHeaderComponent, CandidateFormComponent, IconComponent, LabelPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './job-detail.component.html',
  styleUrl: './job-detail.component.scss',
})
export class JobDetailComponent {
  private readonly api = inject(PublicApiService);
  private readonly seo = inject(SeoService);
  protected readonly site = inject(SettingsService);

  /** Bound from the `:slug` route parameter. */
  readonly slug = input.required<string>();

  protected readonly job = signal<Job | null>(null);
  protected readonly loading = signal(true);
  protected readonly notFound = signal(false);

  constructor() {
    effect(() => {
      const slug = this.slug();
      this.loading.set(true);
      this.notFound.set(false);
      this.api.job(slug).subscribe({
        next: (job) => {
          this.job.set(job);
          this.loading.set(false);
          this.seo.update({
            title: `${job.title} – ${job.country}`,
            description: `${job.title} vacancy in ${job.city ? job.city + ', ' : ''}${job.country} (${job.industry}). Experience: ${job.experience}. Apply online with Krishna International Overseas Services.`,
          });
        },
        error: (err: AppError) => {
          this.loading.set(false);
          this.notFound.set(true);
          this.seo.update({ title: err.status === 404 ? 'Vacancy not found' : 'Job details', noindex: true });
        },
      });
    });
  }

  protected scrollToApply(): void {
    document.getElementById('apply')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
