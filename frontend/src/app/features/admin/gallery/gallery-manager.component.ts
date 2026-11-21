import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { AppError } from '../../../core/models/api.models';
import { GalleryCategory, GalleryItem } from '../../../core/models/domain.models';
import { AdminApiService } from '../../../core/services/admin-api.service';
import { mediaUrl } from '../../../core/services/api.utils';
import { applyServerErrors } from '../../../core/services/form-utils';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmService } from '../../../shared/components/confirm-dialog/confirm.service';
import { FieldErrorComponent } from '../../../shared/components/field-error/field-error.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { FileSizePipe, LabelPipe } from '../../../shared/pipes/labels.pipes';

const MAX_BYTES = 6 * 1024 * 1024;
const TYPES = ['image/jpeg', 'image/png', 'image/webp'];

@Component({
  selector: 'app-gallery-manager',
  standalone: true,
  imports: [ReactiveFormsModule, IconComponent, FieldErrorComponent, LabelPipe, FileSizePipe],
  changeDetection: ChangeDetectionStrategy.Default,
  templateUrl: './gallery-manager.component.html',
  styleUrl: './gallery-manager.component.scss',
})
export class GalleryManagerComponent implements OnInit, OnDestroy {
  private readonly api = inject(AdminApiService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);
  private readonly fb = inject(FormBuilder);

  protected readonly categories: GalleryCategory[] = ['recruitment', 'workforce', 'events', 'office'];
  protected readonly items = signal<GalleryItem[]>([]);
  protected readonly loading = signal(true);
  protected readonly uploading = signal(false);
  protected readonly file = signal<File | null>(null);
  protected readonly preview = signal<string | null>(null);
  protected readonly fileError = signal<string | null>(null);
  protected readonly editing = signal<number | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(150)]],
    caption: ['', Validators.maxLength(300)],
    category: ['recruitment' as GalleryCategory],
    isPublished: [true],
  });

  protected readonly editForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(150)]],
    caption: ['', Validators.maxLength(300)],
    category: ['recruitment' as GalleryCategory],
    sortOrder: [0],
  });

  ngOnInit(): void {
    this.load();
  }

  ngOnDestroy(): void {
    this.revokePreview();
  }

  protected url(path: string): string {
    return mediaUrl(path);
  }

  load(): void {
    this.api.gallery().subscribe({
      next: (items) => {
        this.items.set(items);
        this.loading.set(false);
      },
      error: (e: AppError) => {
        this.loading.set(false);
        this.toast.error(e.message);
      },
    });
  }

  onFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    const f = input.files?.[0] ?? null;
    input.value = '';
    this.fileError.set(null);
    if (!f) return;
    if (!TYPES.includes(f.type)) {
      this.fileError.set('Please choose a JPG, PNG or WEBP image.');
      return;
    }
    if (f.size > MAX_BYTES) {
      this.fileError.set('Image is larger than 6 MB.');
      return;
    }
    this.revokePreview();
    this.file.set(f);
    this.preview.set(URL.createObjectURL(f));
    if (!this.form.controls.title.value) {
      this.form.controls.title.setValue(f.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').slice(0, 150));
    }
  }

  clearFile(): void {
    this.revokePreview();
    this.file.set(null);
  }

  upload(): void {
    const f = this.file();
    if (!f) {
      this.fileError.set('Please choose an image to upload.');
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.uploading.set(true);
    this.api
      .uploadGalleryImage(this.form.getRawValue(), f)
      .pipe(finalize(() => this.uploading.set(false)))
      .subscribe({
        next: (item) => {
          this.items.update((list) => [item, ...list]);
          this.toast.success('Image uploaded.');
          this.form.reset({ title: '', caption: '', category: this.form.controls.category.value, isPublished: true });
          this.clearFile();
        },
        error: (e: AppError) => {
          applyServerErrors(this.form, e);
          this.toast.error(e.message);
        },
      });
  }

  togglePublish(item: GalleryItem): void {
    this.api.updateGalleryItem(item.id, { isPublished: !item.isPublished }).subscribe({
      next: (u) => {
        this.replace(u);
        this.toast.success(u.isPublished ? 'Image is now visible on the website.' : 'Image hidden from the website.');
      },
      error: (e: AppError) => this.toast.error(e.message),
    });
  }

  startEdit(item: GalleryItem): void {
    this.editing.set(item.id);
    this.editForm.setValue({ title: item.title, caption: item.caption ?? '', category: item.category, sortOrder: item.sortOrder ?? 0 });
  }

  saveEdit(item: GalleryItem): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }
    const v = this.editForm.getRawValue();
    this.api.updateGalleryItem(item.id, { ...v, sortOrder: Number(v.sortOrder) || 0 }).subscribe({
      next: (u) => {
        this.replace(u);
        this.editing.set(null);
        this.toast.success('Image details saved.');
        // Re-sort in case the order changed.
        this.load();
      },
      error: (e: AppError) => this.toast.error(e.message),
    });
  }

  async remove(item: GalleryItem): Promise<void> {
    const ok = await this.confirm.ask({ title: 'Delete this image?', message: `“${item.title}” will be permanently removed from the gallery.`, confirmLabel: 'Delete', danger: true });
    if (!ok) return;
    this.api.deleteGalleryItem(item.id).subscribe({
      next: () => {
        this.items.update((list) => list.filter((i) => i.id !== item.id));
        this.toast.success('Image deleted.');
      },
      error: (e: AppError) => this.toast.error(e.message),
    });
  }

  private replace(u: GalleryItem): void {
    this.items.update((list) => list.map((i) => (i.id === u.id ? u : i)));
  }

  private revokePreview(): void {
    const p = this.preview();
    if (p) URL.revokeObjectURL(p);
    this.preview.set(null);
  }
}
