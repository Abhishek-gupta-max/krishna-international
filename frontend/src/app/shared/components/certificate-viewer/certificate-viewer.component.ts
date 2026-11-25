import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { IconComponent } from '../icon/icon.component';

/**
 * Read-only view of the MEA registration certificate (PDF) inside the page.
 * Browsers that cannot show PDFs inline (most phones) get an "Open certificate" button.
 * Only same-site paths (/documents/...) or https links are embedded.
 */
@Component({
  selector: 'app-certificate-viewer',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (safeUrl(); as src) {
      <figure class="viewer">
        <div class="viewer__frame">
          <iframe [src]="src" [title]="title()" loading="lazy"></iframe>
        </div>
        <figcaption class="viewer__bar">
          <span><app-icon name="shield" [size]="16" /> {{ title() }}</span>
          <a [href]="url()" target="_blank" rel="noopener">Open certificate <app-icon name="external" [size]="14" /></a>
        </figcaption>
      </figure>
    }
  `,
  styles: `
    .viewer { margin: 0; overflow: hidden; border: 1px solid var(--gold-300); border-radius: var(--radius-lg); background: #fff; box-shadow: var(--shadow-lg); }
    .viewer__frame { position: relative; height: clamp(420px, 70vh, 760px); background: var(--grey-100); }
    .viewer__frame iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; }
    .viewer__bar {
      display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px 16px;
      padding: 12px 16px; border-top: 1px solid var(--grey-100); background: var(--grey-25); font-size: var(--fs-sm);
    }
    .viewer__bar span { display: inline-flex; align-items: center; gap: 6px; font-weight: 600; color: var(--navy-900); }
    .viewer__bar span app-icon { color: var(--gold-600); }
    .viewer__bar a {
      display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: var(--radius);
      background: var(--navy-900); color: #fff; font-weight: 600; text-decoration: none;
      transition: background-color var(--dur) var(--ease);
    }
    .viewer__bar a:hover { background: var(--navy-800); color: #fff; }
    /* Phones rarely render PDFs inside a page: show a short frame and rely on the button */
    @media (pointer: coarse) and (max-width: 767.98px) { .viewer__frame { height: 360px; } }
  `,
})
export class CertificateViewerComponent {
  private readonly sanitizer = inject(DomSanitizer);
  readonly url = input.required<string>();
  readonly title = input('MEA Registration Certificate');

  protected readonly safeUrl = computed<SafeResourceUrl | null>(() => {
    const u = (this.url() || '').trim();
    if (!/^\/documents\/[\w.-]+\.pdf$/i.test(u) && !/^https:\/\//i.test(u)) return null;
    // View mode: hide the PDF toolbar and fit the page width.
    return this.sanitizer.bypassSecurityTrustResourceUrl(`${u}#toolbar=0&navpanes=0&view=FitH`);
  });
}
