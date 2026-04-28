import { signInWithGoogle, signInWithMicrosoft } from './actions';

export function OAuthButtons() {
  return (
    <div className="oauth-stack">
      <form action={signInWithGoogle}>
        <button type="submit" className="oauth-btn">
          <GoogleLogo />
          <span>Continue with Google</span>
        </button>
      </form>
      <form action={signInWithMicrosoft}>
        <button type="submit" className="oauth-btn">
          <MicrosoftLogo />
          <span>Continue with Microsoft</span>
        </button>
      </form>
    </div>
  );
}

export function OAuthDivider({ label = 'or' }: { label?: string }) {
  return (
    <div className="oauth-divider">
      <span>{label}</span>
    </div>
  );
}

function GoogleLogo() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 18 18"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
      />
    </svg>
  );
}

function MicrosoftLogo() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 23 23"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <path fill="#f25022" d="M1 1h10v10H1z" />
      <path fill="#7fba00" d="M12 1h10v10H12z" />
      <path fill="#00a4ef" d="M1 12h10v10H1z" />
      <path fill="#ffb900" d="M12 12h10v10H12z" />
    </svg>
  );
}
