import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

export interface SeoData {
  title?: string;
  description?: string;
  image?: string;
  noindex?: boolean;
}

const SITE = 'Krishna International Overseas Services';
const DEFAULT_DESCRIPTION =
  'Krishna International Overseas Services, Gorakhpur — manpower supply and recruitment support for employers, and job opportunities for skilled and semi-skilled candidates.';

/**
 * Sets title, meta description, Open Graph tags and canonical URL on every navigation
 * from the route's `data.seo`. Pages with dynamic content (e.g. job details) call `update()`.
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly doc = inject(DOCUMENT);

  init(): void {
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => {
      let r = this.route;
      while (r.firstChild) r = r.firstChild;
      const seo: SeoData = { ...((r.snapshot.data['seo'] as SeoData | undefined) ?? {}) };
      if (r.snapshot.title) seo.title = r.snapshot.title;
      this.update(seo);
    });
  }

  update(seo: SeoData): void {
    const fullTitle = seo.title ? `${seo.title} | ${SITE}` : `${SITE} | Manpower Recruitment, Gorakhpur`;
    const description = seo.description ?? DEFAULT_DESCRIPTION;
    const origin = this.doc.location.origin;
    const url = origin + this.router.url.split(/[?#]/)[0];
    const image = origin + (seo.image ?? '/assets/images/og-image.jpg');

    this.title.setTitle(fullTitle);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ name: 'robots', content: seo.noindex ? 'noindex, nofollow' : 'index, follow' });
    this.meta.updateTag({ property: 'og:title', content: fullTitle });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:image', content: image });
    this.setCanonical(url);
  }

  private setCanonical(url: string): void {
    let link = this.doc.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.doc.createElement('link');
      link.rel = 'canonical';
      this.doc.head.appendChild(link);
    }
    link.href = url;
  }
}
