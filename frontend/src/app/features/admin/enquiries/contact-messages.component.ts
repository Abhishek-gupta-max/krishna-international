import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, merge } from 'rxjs';
import { AppError, PageMeta } from '../../../core/models/api.models';
import { ContactEnquiry, ContactStatus } from '../../../core/models/domain.models';
import { AdminApiService } from '../../../core/services/admin-api.service';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmService } from '../../../shared/components/confirm-dialog/confirm.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { EncodeUriPipe } from '../../../shared/pipes/encode-uri.pipe';
import { LabelPipe, TimeAgoPipe } from '../../../shared/pipes/labels.pipes';

@Component({
  selector: 'app-contact-messages',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe, IconComponent, PaginationComponent, LabelPipe, TimeAgoPipe, EncodeUriPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './enquiries.scss',
  template: `
    <div class="admin-page">
      <div class="admin-head">
        <div>
          <h1>Contact messages</h1>
          <p>Messages sent through the Contact Us form. Opening a message marks it as read.</p>
        </div>
      </div>

      <div class="md" [class.md--open]="!!selected()">
        <section class="panel md__list">
          <div class="toolbar toolbar--2">
            <input class="input" type="search" [formControl]="search" placeholder="Search name, email or subject" aria-label="Search messages" />
            <select class="select" [formControl]="filter" aria-label="Filter by status">
              <option value="">All messages</option>
              @for (s of statuses; track s) {
                <option [value]="s">{{ s | label }}</option>
              }
            </select>
          </div>

          @if (loading()) {
            <div class="panel__body"><div class="skeleton" style="height: 220px"></div></div>
          } @else if (items().length) {
            <ul class="rows">
              @for (m of items(); track m.id) {
                <li>
                  <button type="button" class="row" [class.is-active]="selected()?.id === m.id" [class.is-unread]="m.status === 'new'" (click)="open(m.id)">
                    <span class="row__main">
                      <strong>{{ m.subject }}</strong>
                      <span>{{ m.name }} · {{ m.email }}</span>
                    </span>
                    <span class="row__end">
                      <span class="badge badge--{{ m.status }}">{{ m.status | label }}</span>
                      <time>{{ m.createdAt | timeAgo }}</time>
                    </span>
                  </button>
                </li>
              }
            </ul>
            <div class="admin-pager">
              <span>{{ meta()?.total }} messages</span>
              <app-pagination [meta]="meta()" (pageChange)="load($event)" />
            </div>
          } @else {
            <div class="admin-empty">
              <app-icon name="inbox" [size]="32" />
              <p>{{ search.value || filter.value ? 'No messages match your filters.' : 'No messages yet.' }}</p>
            </div>
          }
        </section>

        @if (selected(); as m) {
          <section class="panel md__detail" id="message-detail" aria-labelledby="msg-title">
            <div class="panel__head">
              <h2 id="msg-title">{{ m.subject }}</h2>
              <button type="button" class="icon-btn" (click)="selected.set(null)" aria-label="Close message"><app-icon name="close" [size]="18" /></button>
            </div>
            <div class="panel__body detail">
              <dl class="detail-list">
                <div><dt>From</dt><dd>{{ m.name }}</dd></div>
                <div><dt>Email</dt><dd><a [href]="'mailto:' + m.email">{{ m.email }}</a></dd></div>
                @if (m.phone) {
                  <div><dt>Phone</dt><dd><a [href]="'tel:' + m.phone">{{ m.phone }}</a></dd></div>
                }
                <div><dt>Received</dt><dd>{{ m.createdAt | date: 'd MMM y, h:mm a' }}</dd></div>
              </dl>
              <p class="text-block">{{ m.message }}</p>
              <div class="field">
                <label class="label" for="cm-status">Status</label>
                <select id="cm-status" class="select" [formControl]="status" (change)="saveStatus()">
                  @for (s of statuses; track s) {
                    <option [value]="s">{{ s | label }}</option>
                  }
                </select>
              </div>
              <div class="btn-row">
                <a class="btn" [href]="'mailto:' + m.email + '?subject=' + ('Re: ' + m.subject | encodeUri)" (click)="markReplied()">
                  <app-icon name="mail" [size]="16" /> Reply by email
                </a>
                <button type="button" class="btn btn--ghost" style="color: var(--color-danger)" (click)="remove()">Delete</button>
              </div>
            </div>
          </section>
        }
      </div>
    </div>
  `,
})
export class ContactMessagesComponent implements OnInit {
  private readonly api = inject(AdminApiService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly statuses: ContactStatus[] = ['new', 'read', 'replied', 'archived'];
  protected readonly search = new FormControl('', { nonNullable: true });
  protected readonly filter = new FormControl('', { nonNullable: true });
  protected readonly status = new FormControl<ContactStatus>('read', { nonNullable: true });
  protected readonly items = signal<ContactEnquiry[]>([]);
  protected readonly meta = signal<PageMeta | null>(null);
  protected readonly loading = signal(true);
  protected readonly selected = signal<ContactEnquiry | null>(null);

  ngOnInit(): void {
    this.load(1);
    merge(this.search.valueChanges.pipe(debounceTime(300), distinctUntilChanged()), this.filter.valueChanges)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.load(1));
  }

  load(page: number): void {
    this.loading.set(true);
    this.api.contactEnquiries({ page, limit: 15, search: this.search.value, status: this.filter.value }).subscribe({
      next: (res) => {
        this.items.set(res.items);
        this.meta.set(res.meta);
        this.loading.set(false);
      },
      error: (e: AppError) => {
        this.loading.set(false);
        this.toast.error(e.message);
      },
    });
  }

  open(id: number): void {
    this.api.contactEnquiry(id).subscribe({
      next: (m) => {
        this.select(m);
        setTimeout(() => document.getElementById('message-detail')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }));
      },
      error: (e: AppError) => this.toast.error(e.message),
    });
  }

  private select(m: ContactEnquiry): void {
    this.selected.set(m);
    this.status.setValue(m.status);
    this.items.update((list) => list.map((i) => (i.id === m.id ? m : i)));
  }

  saveStatus(): void {
    const m = this.selected();
    if (!m) return;
    this.api.updateContactEnquiry(m.id, this.status.value).subscribe({
      next: (updated) => {
        this.select(updated);
        this.toast.success('Status updated.');
      },
      error: (e: AppError) => this.toast.error(e.message),
    });
  }

  markReplied(): void {
    if (this.selected()?.status !== 'replied') {
      this.status.setValue('replied');
      this.saveStatus();
    }
  }

  async remove(): Promise<void> {
    const m = this.selected();
    if (!m) return;
    const ok = await this.confirm.ask({ title: 'Delete this message?', message: `The message from ${m.name} will be removed.`, confirmLabel: 'Delete', danger: true });
    if (!ok) return;
    this.api.deleteContactEnquiry(m.id).subscribe({
      next: () => {
        this.toast.success('Message deleted.');
        this.selected.set(null);
        this.load(this.meta()?.page ?? 1);
      },
      error: (e: AppError) => this.toast.error(e.message),
    });
  }
}
