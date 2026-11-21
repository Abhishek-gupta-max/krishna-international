import { ChangeDetectionStrategy, Component, computed, HostListener, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GalleryCategory, GalleryItem } from '../../core/models/domain.models';
import { mediaUrl } from '../../core/services/api.utils';
import { PublicApiService } from '../../core/services/public-api.service';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { LabelPipe } from '../../shared/pipes/labels.pipes';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [RouterLink, PageHeaderComponent, IconComponent, LabelPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header title="Gallery" intro="Recruitment drives, interviews, our workforce and company events." />

    <section class="section">
      <div class="container">
        @if (availableCategories().length > 1) {
          <div class="tabs" role="tablist" aria-label="Filter by category">
            <button type="button" role="tab" [attr.aria-selected]="active() === ''" [class.is-active]="active() === ''" (click)="active.set('')">All</button>
            @for (c of availableCategories(); track c) {
              <button type="button" role="tab" [attr.aria-selected]="active() === c" [class.is-active]="active() === c" (click)="active.set(c)">{{ c | label }}</button>
            }
          </div>
        }

        @if (loading()) {
          <div class="masonry">
            @for (i of [1, 2, 3, 4, 5, 6]; track i) {
              <div class="skeleton" [style.height.px]="i % 2 ? 220 : 300"></div>
            }
          </div>
        } @else if (filtered().length) {
          <ul class="masonry">
            @for (item of filtered(); track item.id; let i = $index) {
              <li>
                <button type="button" class="tile" (click)="open(i)" [attr.aria-label]="'View photo: ' + item.title">
                  <img [src]="url(item.thumbUrl)" [alt]="item.title" loading="lazy" [attr.width]="item.width" [attr.height]="item.height" />
                  <span class="tile__cap">{{ item.title }}</span>
                </button>
              </li>
            }
          </ul>
        } @else {
          <div class="empty-state">
            <app-icon name="image" />
            <h3>{{ failed() ? 'The gallery could not be loaded' : 'Photographs coming soon' }}</h3>
            <p>{{ failed() ? 'Please try again shortly.' : 'We are adding photographs from our recruitment activities and office. Please check back soon.' }}</p>
            <a routerLink="/contact" class="btn btn--outline">Visit our office</a>
          </div>
        }
      </div>
    </section>

    @if (current(); as item) {
      <div class="lightbox" role="dialog" aria-modal="true" [attr.aria-label]="item.title" (click)="close()">
        <button type="button" class="lightbox__close" (click)="close()" aria-label="Close"><app-icon name="close" [size]="24" /></button>
        @if (filtered().length > 1) {
          <button type="button" class="lightbox__nav lightbox__nav--prev" (click)="step(-1); $event.stopPropagation()" aria-label="Previous photo"><app-icon name="arrow-left" [size]="24" /></button>
          <button type="button" class="lightbox__nav lightbox__nav--next" (click)="step(1); $event.stopPropagation()" aria-label="Next photo"><app-icon name="arrow" [size]="24" /></button>
        }
        <figure (click)="$event.stopPropagation()">
          <img [src]="url(item.imageUrl)" [alt]="item.title" />
          <figcaption>
            <strong>{{ item.title }}</strong>
            @if (item.caption) {
              <span>{{ item.caption }}</span>
            }
          </figcaption>
        </figure>
      </div>
    }
  `,
  styles: `
    .tabs { display: flex; flex-wrap: wrap; gap: var(--sp-2); margin-bottom: var(--sp-6); }
    .tabs button {
      padding: 8px 16px; border: 1px solid var(--color-border); border-radius: var(--radius); background: #fff;
      font-size: var(--fs-sm); font-weight: 500; color: var(--grey-600); cursor: pointer;
    }
    .tabs button:hover { border-color: var(--navy-900); color: var(--navy-900); }
    .tabs button.is-active { background: var(--navy-900); border-color: var(--navy-900); color: #fff; }
    .masonry { columns: 1; column-gap: var(--sp-4); margin: 0; padding: 0; list-style: none; }
    @media (min-width: 576px) { .masonry { columns: 2; } }
    @media (min-width: 992px) { .masonry { columns: 3; } }
    .masonry > * { break-inside: avoid; margin-bottom: var(--sp-4); }
    .tile { position: relative; display: block; width: 100%; padding: 0; border: 0; border-radius: var(--radius); overflow: hidden; background: var(--grey-100); cursor: zoom-in; }
    .tile img { width: 100%; transition: transform 500ms var(--ease); }
    .tile:hover img { transform: scale(1.03); }
    .tile__cap {
      position: absolute; left: 0; right: 0; bottom: 0; padding: 28px 14px 12px; text-align: left;
      background: linear-gradient(to top, rgba(6,20,39,.75), transparent);
      color: #fff; font-size: var(--fs-sm); font-weight: 500; opacity: 0; transition: opacity var(--dur) var(--ease);
    }
    .tile:hover .tile__cap, .tile:focus-visible .tile__cap { opacity: 1; }
    @media (hover: none) { .tile__cap { opacity: 1; } }
    .lightbox { position: fixed; inset: 0; z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 56px 16px; background: rgba(6,20,39,.92); }
    .lightbox figure { margin: 0; max-width: min(1200px, 100%); }
    .lightbox img { max-height: calc(100vh - 160px); margin: 0 auto; border-radius: var(--radius); }
    .lightbox figcaption { margin-top: 12px; text-align: center; color: rgba(255,255,255,.8); font-size: var(--fs-sm); }
    .lightbox figcaption strong { display: block; color: #fff; }
    .lightbox__close, .lightbox__nav {
      position: absolute; display: inline-flex; align-items: center; justify-content: center; width: 44px; height: 44px;
      border: 1px solid rgba(255,255,255,.3); border-radius: 50%; background: rgba(0,0,0,.2); color: #fff; cursor: pointer;
    }
    .lightbox__close { top: 12px; right: 12px; }
    .lightbox__nav--prev { left: 12px; top: 50%; transform: translateY(-50%); }
    .lightbox__nav--next { right: 12px; top: 50%; transform: translateY(-50%); }
  `,
})
export class GalleryComponent implements OnInit {
  private readonly api = inject(PublicApiService);

  protected readonly items = signal<GalleryItem[]>([]);
  protected readonly loading = signal(true);
  protected readonly failed = signal(false);
  protected readonly active = signal<GalleryCategory | ''>('');
  protected readonly index = signal<number | null>(null);

  protected readonly availableCategories = computed(() => [...new Set(this.items().map((i) => i.category))]);
  protected readonly filtered = computed(() => {
    const a = this.active();
    return a ? this.items().filter((i) => i.category === a) : this.items();
  });
  protected readonly current = computed(() => {
    const i = this.index();
    return i === null ? null : (this.filtered()[i] ?? null);
  });

  ngOnInit(): void {
    this.api.gallery().subscribe({
      next: (items) => {
        this.items.set(items);
        this.loading.set(false);
      },
      error: () => {
        this.failed.set(true);
        this.loading.set(false);
      },
    });
  }

  protected url(path: string): string {
    return mediaUrl(path);
  }

  protected open(i: number): void {
    this.index.set(i);
    document.body.style.overflow = 'hidden';
  }

  protected close(): void {
    this.index.set(null);
    document.body.style.overflow = '';
  }

  protected step(dir: number): void {
    const n = this.filtered().length;
    const i = this.index();
    if (i !== null && n) this.index.set((i + dir + n) % n);
  }

  @HostListener('document:keydown', ['$event'])
  onKey(e: KeyboardEvent): void {
    if (this.index() === null) return;
    if (e.key === 'Escape') this.close();
    if (e.key === 'ArrowRight') this.step(1);
    if (e.key === 'ArrowLeft') this.step(-1);
  }
}
