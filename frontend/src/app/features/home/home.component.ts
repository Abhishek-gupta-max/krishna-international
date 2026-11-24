import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PROCESS_STEPS, SECTORS, SERVICE_ICONS, SERVICES, WHY_CHOOSE_US, WHY_ICONS } from '../../core/models/reference-data';
import { SettingsService } from '../../core/services/settings.service';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { RevealDirective } from '../../shared/directives/reveal.directive';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, IconComponent, RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  protected readonly site = inject(SettingsService);

  protected readonly services = SERVICES;
  protected readonly sectors = SECTORS;
  protected readonly steps = PROCESS_STEPS;
  protected readonly reasons = WHY_CHOOSE_US;
  protected readonly serviceIcons = SERVICE_ICONS;
  protected readonly whyIcons = WHY_ICONS;

  protected readonly testimonials = computed(() => (this.site.settings().testimonials ?? []).filter((t) => t?.name && t?.quote));
  protected readonly objectives = computed(() => this.site.settings().objectives ?? []);

  protected pad(n: number): string {
    return String(n).padStart(2, '0');
  }
}
