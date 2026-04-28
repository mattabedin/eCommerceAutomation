'use client';

import Link from 'next/link';
import { useFormState, useFormStatus } from 'react-dom';
import { loginAction, type ActionResult } from '../actions';
import { OAuthButtons, OAuthDivider } from '../oauth-buttons';

const initial: ActionResult | null = null;

export default function LoginPage() {
  const [state, formAction] = useFormState(loginAction, initial);

  return (
    <main className="auth-shell">
      <div className="auth-card">
        <Link href="/" className="auth-logo" aria-label="Forge">
          <span className="auth-logo-mark">F</span>
          <span>Forge</span>
        </Link>

        <h1>Sign in to Forge</h1>
        <p className="auth-sub">Welcome back.</p>

        <OAuthButtons />
        <OAuthDivider label="or with email" />

        <form action={formAction} className="auth-form">
          <label className="auth-field">
            <span>Email</span>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@studio.co"
            />
          </label>

          <label className="auth-field">
            <span>Password</span>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="Your password"
            />
          </label>

          {state && !state.ok && (
            <div className="auth-error" role="alert">
              {state.error}
            </div>
          )}

          <SubmitButton label="Sign in →" pending="Signing in…" />
        </form>

        <p className="auth-foot">
          New to Forge? <Link href="/signup">Create an account</Link>
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
