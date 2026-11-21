import { AppError } from '../../../core/models/api.models';
import { Application } from '../../../core/models/domain.models';
import { AdminApiService } from '../../../core/services/admin-api.service';
import { ToastService } from '../../../core/services/toast.service';

/**
 * Download a CV through the authenticated API (the file is never publicly addressable)
 * and hand it to the browser as a file save.
 */
export function downloadCv(api: AdminApiService, toast: ToastService, app: Application): void {
  api.downloadCv(app.id).subscribe({
    next: (blob) => {
      const ext = app.candidate.cvOriginalName?.split('.').pop()?.toLowerCase() ?? 'pdf';
      const name = `${app.candidate.fullName.replace(/[^a-zA-Z0-9]+/g, '_')}_CV.${ext}`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    },
    error: (e: AppError) => toast.error(e.status === 404 ? 'The CV file could not be found.' : e.message),
  });
}
