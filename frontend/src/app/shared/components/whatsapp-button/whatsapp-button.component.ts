import { ChangeDetectionStrategy, Component, ElementRef, HostListener, inject, signal } from '@angular/core';
import { SettingsService, WhatsAppTopic } from '../../../core/services/settings.service';
import { IconComponent } from '../icon/icon.component';

/** Floating WhatsApp button with three prefilled conversation starters. */
@Component({
  selector: 'app-whatsapp-button',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (open()) {
      <div class="wa-panel" id="wa-panel" role="menu" aria-label="Chat on WhatsApp">
        <p class="wa-panel__head">Chat with us on WhatsApp</p>
        @for (o of options; track o.topic) {
          <a class="wa-panel__item" role="menuitem" [href]="site.whatsappLink(o.topic)" target="_blank" rel="noopener noreferrer" (click)="open.set(false)">
            <strong>{{ o.label }}</strong>
            <span>{{ o.hint }}</span>
          </a>
        }
        <p class="wa-panel__numbers">
          <span>WhatsApp numbers</span>
          @for (w of site.whatsappNumbers(); track w.number) {
            <a [href]="w.link" target="_blank" rel="noopener noreferrer">{{ w.label }}</a>
          }
        </p>
      </div>
    }
    <button
      type="button"
      class="wa-fab"
      (click)="open.set(!open())"
      [attr.aria-expanded]="open()"
      aria-controls="wa-panel"
      aria-label="Contact us on WhatsApp"
    >
      <app-icon [name]="open() ? 'close' : 'whatsapp'" [size]="26" />
    </button>
  `,
  styles: `
    :host { position: fixed; right: 20px; bottom: 20px; z-index: 90; display: flex; flex-direction: column; align-items: flex-end; gap: 12px; }
    .wa-fab {
      display: inline-flex; align-items: center; justify-content: center;
      width: 56px; height: 56px; border: 0; border-radius: 50%;
      background: #1f8f4e; color: #fff; cursor: pointer;
      box-shadow: 0 6px 18px rgba(0,0,0,.18);
      transition: background-color var(--dur) var(--ease), transform var(--dur) var(--ease);
    }
    .wa-fab:hover { background: #18733f; transform: translateY(-1px); }
    .wa-panel {
      width: min(300px, calc(100vw - 40px));
      background: #fff; border: 1px solid var(--color-border); border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg); overflow: hidden;
      animation: wa-in 160ms var(--ease);
    }
    .wa-panel__head { margin: 0; padding: 14px 16px; background: #1f8f4e; color: #fff; font-size: var(--fs-sm); font-weight: 600; }
    .wa-panel__item { display: block; padding: 12px 16px; border-top: 1px solid var(--grey-100); text-decoration: none; color: var(--ink); }
    .wa-panel__item:first-of-type { border-top: 0; }
    .wa-panel__item:hover { background: var(--grey-50); color: var(--ink); }
    .wa-panel__item strong { display: block; font-size: var(--fs-sm); }
    .wa-panel__item span { font-size: var(--fs-xs); color: var(--grey-500); }
    .wa-panel__numbers { display: flex; flex-wrap: wrap; gap: 4px 14px; margin: 0; padding: 10px 16px; border-top: 1px solid var(--grey-100); background: var(--grey-25); font-size: var(--fs-xs); color: var(--grey-500); }
    .wa-panel__numbers span { flex-basis: 100%; }
    .wa-panel__numbers a { color: #18733f; font-weight: 600; text-decoration: none; white-space: nowrap; }
    .wa-panel__numbers a:hover { text-decoration: underline; }
    @keyframes wa-in { from { opacity: 0; transform: translateY(6px); } }
    @media (max-width: 479.98px) { :host { right: 14px; bottom: 14px; } .wa-fab { width: 52px; height: 52px; } }
  `,
})
export class WhatsappButtonComponent {
  protected readonly site = inject(SettingsService);
  private readonly host = inject(ElementRef<HTMLElement>);
  protected readonly open = signal(false);

  protected readonly options: { topic: WhatsAppTopic; label: string; hint: string }[] = [
    { topic: 'general', label: 'General enquiry', hint: 'Questions about our services' },
    { topic: 'job', label: 'Job application', hint: 'Ask about vacancies or apply' },
    { topic: 'employer', label: 'Employer manpower enquiry', hint: 'Discuss a hiring requirement' },
  ];

  @HostListener('document:click', ['$event'])
  onDocClick(e: Event): void {
    if (this.open() && !this.host.nativeElement.contains(e.target as Node)) this.open.set(false);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.open.set(false);
  }
}
