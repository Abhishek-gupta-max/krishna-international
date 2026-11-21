import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AppError } from '../../../core/models/api.models';
import { AuthService } from '../../../core/services/auth.service';
import { FieldErrorComponent } from '../../../shared/components/field-error/field-error.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { LogoComponent } from '../../../shared/components/logo/logo.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, FieldErrorComponent, IconComponent, LogoComponent],
  changeDetection: ChangeDetectionStrategy.Default,
  template: `
    <div class="login">
      <div class="login__card">
        <a routerLink="/" class="login__logo" aria-label="Back to website"><app-logo /></a>
        <h1>Admin sign in</h1>
        <p class="login__sub">Authorised staff only.</p>

        @if (notice()) {
          <div class="alert alert--info" role="status"><app-icon name="info" /><p>{{ notice() }}</p></div>
        }
        @if (error()) {
          <div class="alert alert--error" role="alert"><app-icon name="alert" /><p>{{ error() }}</p></div>
        }

        <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
          <div class="field">
            <label class="label" for="l-email">Email</label>
            <input id="l-email" class="input" type="email" formControlName="email" autocomplete="username" />
            <app-field-error [control]="form.controls.email" label="Email" />
          </div>
          <div class="field">
            <label class="label" for="l-pass">Password</label>
            <div class="pass">
              <input id="l-pass" class="input" [type]="show() ? 'text' : 'password'" formControlName="password" autocomplete="current-password" />
              <button type="button" class="pass__toggle" (click)="show.set(!show())" [attr.aria-label]="show() ? 'Hide password' : 'Show password'">
                <app-icon [name]="show() ? 'eye-off' : 'eye'" [size]="18" />
              </button>
            </div>
            <app-field-error [control]="form.controls.password" label="Password" />
          </div>
          <button type="submit" class="btn btn--block btn--lg" [disabled]="loading()">
            @if (loading()) {
              <span class="spinner" aria-hidden="true"></span> Signing in…
            } @else {
              Sign in
            }
          </button>
        </form>
      </div>
      <a routerLink="/" class="login__back"><app-icon name="arrow-left" [size]="16" /> Back to website</a>
    </div>
  `,
  styles: `
    .login { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px; padding: 24px 16px; background: var(--grey-50); }
    .login__card { width: min(420px, 100%); padding: clamp(24px, 5vw, 40px); background: #fff; border: 1px solid var(--color-border); border-top: 3px solid var(--navy-900); border-radius: var(--radius-lg); }
    .login__card form { display: grid; gap: 18px; }
    .login__logo { display: inline-block; margin-bottom: 28px; text-decoration: none; }
    .login h1 { margin-bottom: 4px; font-family: var(--font-sans); font-size: 1.375rem; }
    .login__sub { margin-bottom: 24px; font-size: var(--fs-sm); color: var(--grey-500); }
    .login .alert { margin-bottom: 18px; }
    .login__back { display: inline-flex; align-items: center; gap: 6px; font-size: var(--fs-sm); color: var(--grey-600); text-decoration: none; }
    .pass { position: relative; }
    .pass .input { padding-right: 48px; }
    .pass__toggle { position: absolute; right: 4px; top: 50%; transform: translateY(-50%); display: inline-flex; padding: 10px; border: 0; background: none; color: var(--grey-500); cursor: pointer; }
  `,
})
export class LoginComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly notice = signal<string | null>(null);
  protected readonly show = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  ngOnInit(): void {
    if (this.route.snapshot.queryParamMap.get('expired')) this.notice.set('Your session has ended. Please sign in again.');
  }

  submit(): void {
    this.error.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { email, password } = this.form.getRawValue();
    this.loading.set(true);
    this.auth
      .login(email, password)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
          // Only allow internal admin paths as redirect targets.
          const target = returnUrl && returnUrl.startsWith('/admin') && !returnUrl.startsWith('/admin/login') ? returnUrl : '/admin/dashboard';
          this.router.navigateByUrl(target);
        },
        error: (err: AppError) => this.error.set(err.message),
      });
  }
}
