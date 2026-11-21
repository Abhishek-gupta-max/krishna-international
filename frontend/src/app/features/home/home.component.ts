import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Job } from '../../core/models/domain.models';
import { PROCESS_STEPS, SECTORS, SERVICES, WHY_CHOOSE_US } from '../../core/models/reference-data';
import { PublicApiService } from '../../core/services/public-api.service';
import { SettingsService } from '../../core/services/settings.service';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { JobCardComponent } from '../../shared/components/job-card/job-card.component';
import { RevealDirective } from '../../shared/directives/reveal.directive';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, IconComponent, JobCardComponent, RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  private readonly api = inject(PublicApiService);
  protected readonly site = inject(SettingsService);

  protected readonly services = SERVICES;
  protected readonly sectors = SECTORS;
  protected readonly steps = PROCESS_STEPS;
  protected readonly reasons = WHY_CHOOSE_US;

  protected readonly jobs = signal<Job[]>([]);
  protected readonly jobsLoading = signal(true);
  protected readonly jobsError = signal(false);
  protected readonly testimonials = computed(() => (this.site.settings().testimonials ?? []).filter((t) => t?.name && t?.quote));
  protected readonly objectives = computed(() => this.site.settings().objectives ?? []);

  ngOnInit(): void {
    this.api.jobs({ limit: 6 }).subscribe({
      next: (res) => {
        this.jobs.set(res.items);
        this.jobsLoading.set(false);
      },
      error: () => {
        this.jobsError.set(true);
        this.jobsLoading.set(false);
      },
    });
  }

  protected pad(n: number): string {
    return String(n).padStart(2, '0');
  }
}
