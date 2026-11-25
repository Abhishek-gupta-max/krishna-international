import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { AppError } from '../../../core/models/api.models';
import { SettingsGroups } from '../../../core/models/domain.models';
import { AdminApiService } from '../../../core/services/admin-api.service';
import { SettingsService } from '../../../core/services/settings.service';
import { ToastService } from '../../../core/services/toast.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';

interface FieldDef {
  key: string;
  label: string;
  multiline?: boolean;
  hint?: string;
  placeholder?: string;
}

const SECTIONS: { title: string; fields: FieldDef[] }[] = [
  {
    title: 'Company details',
    fields: [
      { key: 'company_name', label: 'Company name' },
      { key: 'contact_person', label: 'Contact person' },
      { key: 'email', label: 'Email address' },
      { key: 'phone_primary', label: 'Primary phone' },
      { key: 'phone_alternate', label: 'Alternate phone' },
      { key: 'whatsapp_number', label: 'WhatsApp number (main)', hint: 'Digits only with country code, e.g. 919871962867. Used for the prefilled chat buttons.' },
      { key: 'whatsapp_number_alt', label: 'Second WhatsApp number', hint: 'Digits only with country code, e.g. 919450924034. Leave blank to hide.' },
      { key: 'whatsapp_number_alt2', label: 'Third WhatsApp number', hint: 'Digits only with country code, e.g. 919455861117. Leave blank to hide.' },
      { key: 'address', label: 'Address', multiline: true },
      { key: 'map_query', label: 'Map location', hint: 'Text used to place the Google Maps pin on the Contact page' },
      { key: 'office_hours', label: 'Office hours', hint: 'Leave blank to hide', placeholder: 'e.g. Mon–Sat, 10:00 am – 6:00 pm' },
    ],
  },
  {
    title: 'Registration',
    fields: [
      { key: 'business_type', label: 'Business type' },
      { key: 'mea_rc_number', label: 'MEA RC number', hint: 'Recruiting Agent registration certificate number. Leave blank to hide.' },
      { key: 'mea_rc_authority', label: 'RC issued under' },
      { key: 'registration_number', label: 'Shop & Establishment number' },
      { key: 'registration_authority', label: 'Registered under' },
      { key: 'registered_owner', label: 'Registered owner' },
    ],
  },
  {
    title: 'Social media',
    fields: [
      { key: 'facebook_url', label: 'Facebook page', placeholder: 'https://', hint: 'Links appear in the footer only when filled in' },
      { key: 'instagram_url', label: 'Instagram profile', placeholder: 'https://' },
      { key: 'linkedin_url', label: 'LinkedIn page', placeholder: 'https://' },
      { key: 'youtube_url', label: 'YouTube channel', placeholder: 'https://' },
    ],
  },
];

@Component({
  selector: 'app-company-settings',
  standalone: true,
  imports: [ReactiveFormsModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.Default,
  template: `
    <div class="admin-page">
      <div class="admin-head">
        <div>
          <h1>Company settings</h1>
          <p>Contact details and registration information shown across the website.</p>
        </div>
      </div>

      @if (loading()) {
        <div class="skeleton" style="height: 420px"></div>
      } @else {
        <form [formGroup]="form" (ngSubmit)="save()" class="admin-page">
          @for (section of sections; track section.title) {
            <section class="panel">
              <div class="panel__head"><h2>{{ section.title }}</h2></div>
              <div class="panel__body form-grid">
                @for (f of section.fields; track f.key) {
                  <div class="field" [class.span-2]="f.multiline">
                    <label class="label" [for]="'s-' + f.key">{{ f.label }}</label>
                    @if (f.multiline) {
                      <textarea class="textarea" rows="3" [id]="'s-' + f.key" [formControlName]="f.key"></textarea>
                    } @else {
                      <input class="input" [id]="'s-' + f.key" [formControlName]="f.key" [placeholder]="f.placeholder ?? ''" />
                    }
                    @if (f.hint) {
                      <span class="hint">{{ f.hint }}</span>
                    }
                  </div>
                }
              </div>
            </section>
          }
          <div class="save-bar">
            <button type="submit" class="btn" [disabled]="saving() || form.pristine">
              @if (saving()) {
                <span class="spinner" aria-hidden="true"></span>
              } @else {
                <app-icon name="check" [size]="16" />
              }
              Save settings
            </button>
            @if (form.dirty) {
              <span class="hint">You have unsaved changes.</span>
            }
          </div>
        </form>
      }
    </div>
  `,
  styles: `.save-bar { position: sticky; bottom: 0; display: flex; align-items: center; gap: 16px; padding: 14px 0; background: var(--grey-50); }`,
})
export class CompanySettingsComponent implements OnInit {
  private readonly api = inject(AdminApiService);
  private readonly toast = inject(ToastService);
  private readonly site = inject(SettingsService);

  protected readonly sections = SECTIONS;
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly form = new FormGroup<Record<string, FormControl<string>>>(
    Object.fromEntries(SECTIONS.flatMap((s) => s.fields).map((f) => [f.key, new FormControl('', { nonNullable: true })]))
  );

  ngOnInit(): void {
    this.api.settings().subscribe({
      next: (groups) => this.patch(groups),
      error: (e: AppError) => {
        this.loading.set(false);
        this.toast.error(e.message);
      },
    });
  }

  private patch(groups: SettingsGroups): void {
    const flat: Record<string, string> = {};
    for (const g of Object.values(groups)) for (const [k, v] of Object.entries(g)) flat[k] = String(v.value ?? '');
    for (const key of Object.keys(this.form.controls)) this.form.controls[key].setValue(flat[key] ?? '');
    this.form.markAsPristine();
    this.loading.set(false);
  }

  save(): void {
    // Send only changed fields.
    const changed: Record<string, string> = {};
    for (const [k, c] of Object.entries(this.form.controls)) if (c.dirty) changed[k] = c.value.trim();
    if (!Object.keys(changed).length) return;
    this.saving.set(true);
    this.api
      .saveSettings(changed)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (groups) => {
          this.patch(groups);
          this.site.reload();
          this.toast.success('Settings saved. The website now shows the updated details.');
        },
        error: (e: AppError) => this.toast.error(e.message),
      });
  }
}
