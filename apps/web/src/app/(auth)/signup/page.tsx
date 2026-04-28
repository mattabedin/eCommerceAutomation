'use client';

import Link from 'next/link';
import { useFormState, useFormStatus } from 'react-dom';
import { signupAction, type ActionResult } from '../actions';
import { OAuthButtons, OAuthDivider } from '../oauth-buttons';

const initial: ActionResult | null = null;

export default function SignupPage() {
  const [state, formAction] = useFormState(signupAction, initial);
  const errorField = state && !state.ok ? state.field : undefined;

  return (
    <main className="auth-shell">
      <div className="auth-card">
        <Link href="/" className="auth-logo" aria-label="Forge">
          <span className="auth-logo-mark">F</span>
          <span>Forge</span>
        </Link>

        <h1>Create your Forge account</h1>
        <p className="auth-sub">
          Free to build. No credit card. Live in under 5 minutes.
        </p>

        <OAuthButtons />
        <OAuthDivider label="or sign up with email" />

        <form action={formAction} className="auth-form">
          <label className="auth-field">
            <span>Name</span>
            <input
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Maya Chen"
              data-error={errorField === 'name' ? 'true' : undefined}
            />
          </label>

          <label className="auth-field">
            <span>Email</span>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@studio.co"
              data-error={errorField === 'email' ? 'true' : undefined}
            />
          </label>

          <label className="auth-field">
            <span>Password</span>
            <input
              name="password"
              type="password"
              required
              autoComplete="new-password"
              minLength={8}
              placeholder="At least 8 characters"
              data-error={errorField === 'password' ? 'true' : undefined}
            />
          </label>

          {state && !state.ok && (
            <div className="auth-error" role="alert">
              {state.error}
            </div>
          )}

          <SubmitButton label="Create account →" pending="Creating account…" />
        </form>

        <p className="auth-foot">
          Already have an account? <Link href="/login">Sign in</Link>
        </p>

        <p className="auth-legal">
          By creating an account you agree to our{' '}
          <a href="#">Terms</a> and <a href="#">Privacy Policy</a>.
        </p>
      </div>
    </main>
  );
}

function SubmitButton({
  label,
  pending,
}: {
  label: string;
  pending: string;
}) {
  const status = useFormStatus();
  return (
    <button
      type="submit"
      className="btn btn-primary btn-lg"
      style={{ width: '100%', justifyContent: 'center' }}
      disabled={status.pending}
    >
      {status.pending ? pending : label}
    </button>
  );
}
