import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, of } from 'rxjs';
import { ApiResponse } from '../models/api.models';
import { SiteSettings } from '../models/domain.models';
import { API } from './api.utils';

/**
 * Verified company details used until the API responds (and as a fallback if it is unreachable),
 * so contact information is always visible.
 */
const FALLBACK: SiteSettings = {
  company_name: 'Krishna International Overseas Services',
  contact_person: 'Aviral Pandey',
  email: 'krishnainternationalgkp@gmail.com',
  phone_primary: '+91 98719 62867',
  phone_alternate: '+91 94509 24034',
  whatsapp_number: '919871962867',
  whatsapp_number_alt: '919450924034',
  whatsapp_number_alt2: '919455861117',
  address: 'X055 Singhariya, Near Ashoka Gas Godam, Kudaghat, Gorakhpur, Uttar Pradesh – 273008, India',
  business_type: 'Manpower Supply',
  registration_number: 'UPSA59017079',
  registration_authority: 'Shop & Establishment Registration, Government of Uttar Pradesh',
  registered_owner: 'Dimpal Pandey',
  office_hours: '',
  map_query: 'Singhariya, Kudaghat, Gorakhpur, Uttar Pradesh 273008',
  facebook_url: '',
  instagram_url: '',
  linkedin_url: '',
  youtube_url: '',
  hero_title: 'Connecting Global Employers with Skilled Talent',
  hero_subtitle:
    'Krishna International Overseas Services sources, screens and prepares skilled and semi-skilled workers from India for employers abroad — with clear communication at every step for both the employer and the candidate.',
  about_summary:
    'Based in Gorakhpur, Uttar Pradesh, Krishna International Overseas Services is a manpower supply firm that helps employers find dependable workers and helps job seekers find genuine employment opportunities.',
  about_body: '',
  vision: '',
  mission: '',
  objectives: [],
  management_intro: '',
  testimonials: [],
  meta_description: '',
};

export type WhatsAppTopic = 'general' | 'job' | 'employer';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly http = inject(HttpClient);
  private readonly state = signal<SiteSettings>(FALLBACK);
  private loaded = false;

  readonly settings = this.state.asReadonly();

  readonly phoneHref = computed(() => this.tel(this.state().phone_primary));
  readonly altPhoneHref = computed(() => this.tel(this.state().phone_alternate));
  readonly socialLinks = computed(() => {
    const s = this.state();
    return [
      { name: 'Facebook', url: s.facebook_url, icon: 'facebook' },
      { name: 'Instagram', url: s.instagram_url, icon: 'instagram' },
      { name: 'LinkedIn', url: s.linkedin_url, icon: 'linkedin' },
      { name: 'YouTube', url: s.youtube_url, icon: 'youtube' },
    ].filter((l) => !!l.url);
  });

  load(): void {
    if (this.loaded) return;
    this.loaded = true;
    this.http
      .get<ApiResponse<Partial<SiteSettings>>>(`${API}/settings/public`)
      .pipe(catchError(() => of(null)))
      .subscribe((res) => {
        if (res?.data) this.state.set({ ...FALLBACK, ...this.clean(res.data) });
      });
  }

  /** Force a refresh after an admin edits settings. */
  reload(): void {
    this.loaded = false;
    this.load();
  }

  whatsappLink(topic: WhatsAppTopic = 'general', detail?: string, number = this.state().whatsapp_number): string {
    const messages: Record<WhatsAppTopic, string> = {
      general: 'Hello Krishna International Overseas Services, I would like to make an enquiry.',
      job: `Hello, I would like to apply for a job${detail ? `: ${detail}` : ''}. Please guide me about the process.`,
      employer: 'Hello, we are an employer and would like to discuss a manpower requirement.',
    };
    return `https://wa.me/${number}?text=${encodeURIComponent(messages[topic])}`;
  }

  /** All configured WhatsApp numbers (main first) with display text and a general-enquiry chat link. */
  readonly whatsappNumbers = computed(() => {
    const s = this.state();
    return [s.whatsapp_number, s.whatsapp_number_alt, s.whatsapp_number_alt2]
      .filter((n): n is string => !!n)
      .map((n) => ({ number: n, label: this.formatWhatsApp(n), link: this.whatsappLink('general', undefined, n) }));
  });

  /** '919450924034' → '+91 94509 24034' for display. */
  formatWhatsApp(number: string): string {
    const m = /^91(\d{5})(\d{5})$/.exec(number);
    return m ? `+91 ${m[1]} ${m[2]}` : `+${number}`;
  }

  tel(phone: string): string {
    return `tel:${phone.replace(/[^+\d]/g, '')}`;
  }

  /** Drop empty strings so FALLBACK values are kept for missing keys. */
  private clean(data: Partial<SiteSettings>): Partial<SiteSettings> {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(data)) {
      const required = ['company_name', 'email', 'phone_primary', 'whatsapp_number', 'address', 'hero_title'];
      if (required.includes(k) && !v) continue;
      out[k] = v;
    }
    return out as Partial<SiteSettings>;
  }
}
