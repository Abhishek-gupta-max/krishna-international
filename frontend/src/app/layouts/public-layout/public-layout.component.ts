import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SettingsService } from '../../core/services/settings.service';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { WhatsappButtonComponent } from '../../shared/components/whatsapp-button/whatsapp-button.component';
import { AiAssistantComponent } from '../../shared/components/ai-assistant/ai-assistant.component';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, WhatsappButtonComponent, AiAssistantComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a class="skip-link" href="#main">Skip to main content</a>
    <app-header />
    <main id="main" tabindex="-1">
      <router-outlet />
    </main>
    <app-footer />
    <app-whatsapp-button />
    @defer (on idle) {
      <app-ai-assistant />
    }
  `,
  styles: `main { display: block; min-height: 60vh; outline: none; }`,
})
export class PublicLayoutComponent implements OnInit {
  private readonly settings = inject(SettingsService);

  ngOnInit(): void {
    this.settings.load();
  }
}
