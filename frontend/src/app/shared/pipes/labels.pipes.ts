import { Pipe, PipeTransform } from '@angular/core';
import { EMPLOYMENT_TYPE_LABELS } from '../../core/models/reference-data';

/** 'in_progress' → 'In progress' */
@Pipe({ name: 'label', standalone: true })
export class LabelPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '';
    if (EMPLOYMENT_TYPE_LABELS[value]) return EMPLOYMENT_TYPE_LABELS[value];
    const s = value.replace(/_/g, ' ');
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
}

/** 245760 → '240 KB' */
@Pipe({ name: 'fileSize', standalone: true })
export class FileSizePipe implements PipeTransform {
  transform(bytes: number | null | undefined): string {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }
}

/** ISO date → '3 hours ago' (falls back to a date after a week). */
@Pipe({ name: 'timeAgo', standalone: true })
export class TimeAgoPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '';
    const date = new Date(value);
    const secs = Math.round((Date.now() - date.getTime()) / 1000);
    if (secs < 60) return 'just now';
    const mins = Math.round(secs / 60);
    if (mins < 60) return `${mins} min ago`;
    const hrs = Math.round(mins / 60);
    if (hrs < 24) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
    const days = Math.round(hrs / 24);
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }
}
