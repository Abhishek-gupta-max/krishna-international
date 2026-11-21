import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="section">
      <div class="container container--narrow nf">
        <p class="eyebrow">Error 404</p>
        <h1>We could not find that page</h1>
        <p class="lead">The link may be out of date, or the page may have moved.</p>
        <div class="btn-row">
          <a routerLink="/" class="btn">Go to home page</a>
          <a routerLink="/jobs" class="btn btn--outline">Browse jobs</a>
          <a routerLink="/contact" class="btn btn--ghost">Contact us</a>
        </div>
      </div>
    </section>
  `,
  styles: `.nf { padding-block: var(--sp-8); } .nf .lead { margin-bottom: var(--sp-6); }`,
})
export class NotFoundComponent {}
