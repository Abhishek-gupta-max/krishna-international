import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PROCESS_ICONS, PROCESS_STEPS, SECTORS, SERVICE_ICONS, SERVICES, WHY_CHOOSE_US, WHY_ICONS } from '../../core/models/reference-data';
import { SettingsService } from '../../core/services/settings.service';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { CertificateViewerComponent } from '../../shared/components/certificate-viewer/certificate-viewer.component';
import { RcNumberComponent } from '../../shared/components/rc-number/rc-number.component';
import { RevealDirective } from '../../shared/directives/reveal.directive';

/** Hero background slides: existing recruitment photographs, captioned by sector. */
const HERO_SLIDES = [
  { image: 'hero-workforce', caption: 'Construction & infrastructure', position: '70% 40%' },
  { image: 'service-overseas', caption: 'Overseas placement', position: '60% 50%' },
  { image: 'service-industrial', caption: 'Industrial workforce', position: '50% 50%' },
  { image: 'service-technical', caption: 'Technical & engineering', position: '50% 40%' },
];
const SLIDE_INTERVAL_MS = 6000;

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, IconComponent, RcNumberComponent, CertificateViewerComponent, RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  protected readonly site = inject(SettingsService);

  protected readonly services = SERVICES;
  protected readonly sectors = SECTORS;
  protected readonly steps = PROCESS_STEPS;
  protected readonly reasons = WHY_CHOOSE_US;
  protected readonly serviceIcons = SERVICE_ICONS;
  protected readonly whyIcons = WHY_ICONS;
  protected readonly processIcons = PROCESS_ICONS;

  protected readonly testimonials = computed(() => (this.site.settings().testimonials ?? []).filter((t) => t?.name && t?.quote));
  protected readonly objectives = computed(() => this.site.settings().objectives ?? []);

  // ---- Hero slider ----
  protected readonly slides = HERO_SLIDES;
  protected readonly current = signal(0);
  private timer: ReturnType<typeof setInterval> | null = null;
  private paused = false;
  private readonly reduceMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.stop());
  }

  ngOnInit(): void {
    // No autoplay when the visitor prefers reduced motion; arrows and dots still work.
    if (!this.reduceMotion) this.start();
  }

  protected next(): void {
    this.go((this.current() + 1) % this.slides.length);
  }

  protected prev(): void {
    this.go((this.current() - 1 + this.slides.length) % this.slides.length);
  }

  protected go(i: number): void {
    this.current.set(i);
    this.restart();
  }

  protected pause(): void {
    this.paused = true;
  }

  protected resume(): void {
    this.paused = false;
  }

  private start(): void {
    this.stop();
    this.timer = setInterval(() => {
      if (!this.paused && !document.hidden) this.current.update((c) => (c + 1) % this.slides.length);
    }, SLIDE_INTERVAL_MS);
  }

  private restart(): void {
    if (this.timer) this.start();
  }

  private stop(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  protected pad(n: number): string {
    return String(n).padStart(2, '0');
  }
}
