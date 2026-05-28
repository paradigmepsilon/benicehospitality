import type { ProviderName } from "@/lib/oauth/providers";

export type EnabledProviders = Record<ProviderName, boolean>;

interface Props {
  next: string;
  enabledProviders: EnabledProviders;
}

const PROVIDER_LABEL: Record<ProviderName, string> = {
  google: "Continue with Google",
  facebook: "Continue with Facebook",
  linkedin: "Continue with LinkedIn",
};

const PROVIDER_ORDER: ProviderName[] = ["google", "facebook", "linkedin"];

function GoogleIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 48 48"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571.001-.001.002-.001.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="#1877F2"
        d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073c0 6.019 4.388 11.005 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.078 24 18.092 24 12.073z"
      />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="#0A66C2"
        d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.852 3.37-1.852 3.601 0 4.267 2.37 4.267 5.455v6.288zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
      />
    </svg>
  );
}

const ICONS: Record<ProviderName, () => React.JSX.Element> = {
  google: GoogleIcon,
  facebook: FacebookIcon,
  linkedin: LinkedInIcon,
};

export default function OAuthButtons({ next, enabledProviders }: Props) {
  const visible = PROVIDER_ORDER.filter((p) => enabledProviders[p]);
  if (visible.length === 0) return null;

  const nextQs =
    next && next !== "/account"
      ? `?next=${encodeURIComponent(next)}`
      : "";

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3">
        {visible.map((provider) => {
          const Icon = ICONS[provider];
          return (
            <a
              key={provider}
              href={`/api/auth/oauth/${provider}/start${nextQs}`}
              className="w-full inline-flex items-center justify-center gap-3 bg-white border border-light-gray hover:border-charcoal/40 text-near-black font-sans font-semibold rounded-lg px-5 py-3 text-sm min-h-[48px] transition-colors"
            >
              <Icon />
              <span>{PROVIDER_LABEL[provider]}</span>
            </a>
          );
        })}
      </div>
      <p className="text-center font-sans text-xs text-charcoal/55">
        First time? Continuing with a social account creates your profile
        automatically.
      </p>
      <div
        className="flex items-center gap-4 pt-1"
        role="separator"
        aria-label="or continue with email"
      >
        <div className="flex-1 h-px bg-light-gray" />
        <span className="font-sans text-xs font-semibold tracking-[0.2em] uppercase text-charcoal/60">
          or continue with email
        </span>
        <div className="flex-1 h-px bg-light-gray" />
      </div>
    </div>
  );
}
