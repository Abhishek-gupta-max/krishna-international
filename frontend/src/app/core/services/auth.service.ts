import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiResponse } from '../models/api.models';
import { Admin, AdminRole } from '../models/domain.models';
import { API, unwrap } from './api.utils';

interface Session {
  token: string;
  expiresAt: string;
  admin: Admin;
}

const STORAGE_KEY = 'kios.admin.session';

/**
 * Admin authentication state. The JWT is kept in sessionStorage (cleared when the
 * browser tab closes) and checked for expiry before every use.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly session = signal<Session | null>(this.restore());

  readonly admin = computed(() => this.session()?.admin ?? null);
  readonly token = computed(() => (this.isExpired(this.session()) ? null : this.session()?.token ?? null));

  isAuthenticated(): boolean {
    return !!this.token();
  }

  hasRole(...roles: AdminRole[]): boolean {
    const role = this.admin()?.role;
    return !!role && roles.includes(role);
  }

  login(email: string, password: string): Observable<Session> {
    return this.http.post<ApiResponse<Session>>(`${API}/auth/login`, { email, password }).pipe(
      unwrap(),
      tap((s) => this.store(s))
    );
  }

  refreshProfile(): Observable<Admin> {
    return this.http.get<ApiResponse<Admin>>(`${API}/auth/me`).pipe(
      unwrap(),
      tap((admin) => {
        const s = this.session();
        if (s) this.store({ ...s, admin });
      })
    );
  }

  changePassword(currentPassword: string, newPassword: string): Observable<{ token: string; expiresAt: string }> {
    return this.http
      .post<ApiResponse<{ token: string; expiresAt: string }>>(`${API}/auth/change-password`, { currentPassword, newPassword })
      .pipe(
        unwrap(),
        tap(({ token, expiresAt }) => {
          const s = this.session();
          if (s) this.store({ ...s, token, expiresAt });
        })
      );
  }

  /** Notify the API (for the audit log) and clear the local session. */
  logout(): Observable<unknown> {
    const req = this.http.post(`${API}/auth/logout`, {});
    return req.pipe(tap({ finalize: () => this.clearSession() }));
  }

  clearSession(): void {
    this.session.set(null);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* storage unavailable */
    }
  }

  private store(s: Session): void {
    this.session.set(s);
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    } catch {
      /* storage unavailable — session lives in memory only */
    }
  }

  private restore(): Session | null {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      const s = raw ? (JSON.parse(raw) as Session) : null;
      return s && !this.isExpired(s) ? s : null;
    } catch {
      return null;
    }
  }

  private isExpired(s: Session | null): boolean {
    return !s || new Date(s.expiresAt).getTime() <= Date.now();
  }
}
