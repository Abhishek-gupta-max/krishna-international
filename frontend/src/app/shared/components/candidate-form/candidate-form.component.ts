import { ChangeDetectionStrategy, Component, ElementRef, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { AppError } from '../../../core/models/api.models';
import { DESTINATION_COUNTRIES, JOB_CATEGORIES, QUALIFICATIONS } from '../../../core/models/reference-data';
import { applyServerErrors, focusFirstInvalid, PHONE_PATTERN } from '../../../core/services/form-utils';
import { PublicApiService } from '../../../core/services/public-api.service';
import { SettingsService } from '../../../core/services/settings.service';
import { FileSizePipe } from '../../pipes/labels.pipes';
import { FieldErrorComponent } from '../field-error/field-error.component';
import { IconComponent } from '../icon/icon.component';

const MAX_CV_BYTES = 5 * 1024 * 1024;
const CV_EXTENSIONS = ['pdf', 'doc', 'docx'];

/**
 * Candidate registration / job application form.
 * When `jobId` is set the submission is linked to that vacancy.
 */
@Component({
  selector: 'app-candidate-form',
  standalone: true,
  imports: [ReactiveFormsModule, FieldErrorComponent, IconComponent, FileSizePipe],
  changeDetection: ChangeDetectionStrategy.Default,
  templateUrl: './candidate-form.component.html',
})
export class CandidateFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(PublicApiService);
  private readonly host = inject(ElementRef<HTMLElement>);
  protected readonly site = inject(SettingsService);

  readonly jobId = input<number | null>(null);
  readonly jobTitle = input<string>('');
  readonly jobCountry = input<string>('');

  protected readonly countries = DESTINATION_COUNTRIES;
  protected readonly categories = JOB_CATEGORIES;
  protected readonly qualifications = QUALIFICATIONS;

  protected readonly submitting = signal(false);
  protected readonly success = signal<string | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly cv = signal<File | null>(null);
  protected readonly cvError = signal<string | null>(null);
  protected readonly dragging = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(120)]],
    mobile: ['', [Validators.required, Validators.pattern(PHONE_PATTERN)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(190)]],
    qualification: ['', Validators.required],
    experienceYears: [null as number | null, [Validators.required, Validators.min(0), Validators.max(50)]],
    currentLocation: ['', Validators.maxLength(120)],
    preferredCountry: ['', Validators.required],
    preferredCategory: ['', Validators.required],
    passportAvailable: ['' as '' | 'true' | 'false'],
    coverNote: ['', Validators.maxLength(2000)],
    consent: [false, Validators.requiredTrue],
  });

  ngOnInit(): void {
    if (this.jobCountry()) {
      const match = this.countries.find((c) => c.toLowerCase() === this.jobCountry().toLowerCase());
      this.form.controls.preferredCountry.setValue(match ?? 'Other');
    }
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.setFile(input.files?.[0] ?? null);
    input.value = '';
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(false);
    this.setFile(event.dataTransfer?.files?.[0] ?? null);
  }

  removeFile(): void {
    this.cv.set(null);
    this.cvError.set(null);
  }

  private setFile(file: File | null): void {
    this.cvError.set(null);
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (!CV_EXTENSIONS.includes(ext)) {
      this.cvError.set('Please upload your CV as a PDF, DOC or DOCX file.');
      return;
    }
    if (file.size > MAX_CV_BYTES) {
      this.cvError.set('Your CV is larger than 5 MB. Please upload a smaller file.');
      return;
    }
    this.cv.set(file);
  }

  submit(): void {
    this.error.set(null);
    if (this.form.invalid || this.cvError()) {
      this.form.markAllAsTouched();
      focusFirstInvalid(this.host.nativeElement);
      return;
    }

    const v = this.form.getRawValue();
    this.submitting.set(true);
    this.api
      .submitApplication(
        {
          ...v,
          experienceYears: Number(v.experienceYears),
          passportAvailable: v.passportAvailable === '' ? null : v.passportAvailable === 'true',
          jobId: this.jobId(),
        },
        this.cv()
      )
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: (res) => {
          this.success.set(res.message);
          this.form.reset();
          this.cv.set(null);
          this.host.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        },
        error: (err: AppError) => {
          applyServerErrors(this.form, err);
          const cvErr = err.errors?.find((e) => e.field === 'cv');
          if (cvErr) this.cvError.set(cvErr.message);
          this.error.set(err.message);
        },
      });
  }

  reset(): void {
    this.success.set(null);
  }
}
