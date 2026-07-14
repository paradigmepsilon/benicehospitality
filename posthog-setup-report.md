# PostHog post-wizard report

The wizard has completed a deep integration of PostHog into the BNHG Next.js (App Router) application. Client-side tracking is initialized via `instrumentation-client.ts` using the Next.js 15.3+ instrumentation pattern with a `/ingest` reverse proxy configured in `next.config.ts`. Server-side tracking uses a singleton `posthog-node` client in `src/lib/posthog-server.ts`. Key conversion events are captured server-side in API routes, and user identity is established on both the client (after login) and server (after signup/login). Error tracking is enabled via `capture_exceptions: true` in the client init.

## Events instrumented

| Event name | Description | File |
|---|---|---|
| `user_signed_up` | User successfully created a new account via the password signup form | `src/app/api/auth/signup/route.ts` |
| `user_logged_in` | User successfully authenticated with email and password | `src/app/api/auth/login/route.ts` |
| `course_checkout_started` | User initiated a Stripe checkout session to purchase a course tier | `src/app/api/checkout/course/route.ts` |
| `course_enrollment_granted` | Stripe payment succeeded and a course enrollment was activated | `src/app/api/webhooks/stripe/route.ts` |
| `hosts_edge_purchased` | Stripe payment succeeded for The Host's Edge digital product | `src/app/api/webhooks/stripe/route.ts` |
| `lesson_completed` | User marked a lesson as complete, updating course progress | `src/app/api/lesson-progress/route.ts` |
| `newsletter_subscribed` | Visitor submitted the newsletter signup form | `src/app/api/newsletter/route.ts` |
| `audit_requested` | Visitor submitted the free marketing audit request form | `src/app/api/audit/request/route.ts` |
| `scorecard_submitted` | Visitor completed the MTR Viability Calculator scorecard | `src/app/api/scorecard/submit/route.ts` |
| `tier_waitlist_clicked` | Visitor clicked Join the waitlist on the Room Rental Riches pricing tier comparison | `src/components/sections/courses/TierComparison.tsx` |
| `hosts_edge_checkout_started` | Visitor clicked the buy button on The Host's Edge product page | `src/app/(marketing)/thehostsedge/_components/BuyButton.tsx` |
| `user_signed_up` | Client-side capture after signup form success | `src/components/sections/auth/SignupForm.tsx` |
| `user_logged_in` | Client-side capture + `posthog.identify()` after login success | `src/components/sections/auth/LoginForm.tsx` |

## New files created

| File | Purpose |
|---|---|
| `instrumentation-client.ts` | Client-side PostHog init (Next.js 15.3+ pattern) |
| `src/lib/posthog-server.ts` | Singleton `posthog-node` client for server-side routes |

## Configuration changes

- `next.config.ts` — Added `/ingest/*` reverse proxy rewrites and `skipTrailingSlashRedirect: true`
- `.env.local` — Added `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` and `NEXT_PUBLIC_POSTHOG_HOST`

## Next steps

We've built a dashboard and 5 insights to track business-critical metrics:

- **Dashboard:** [Analytics basics (wizard)](https://us.posthog.com/project/497963/dashboard/1799594)
- **Signups & Logins:** [Ykq9kZMj](https://us.posthog.com/project/497963/insights/Ykq9kZMj)
- **Lead Generation:** [YnnHO0zJ](https://us.posthog.com/project/497963/insights/YnnHO0zJ)
- **Lesson Completions:** [7bCUuHmT](https://us.posthog.com/project/497963/insights/7bCUuHmT)
- **Tier Waitlist Interest:** [VoM0WL4v](https://us.posthog.com/project/497963/insights/VoM0WL4v)
- **Course Conversion Funnel:** [7NHdAPgk](https://us.posthog.com/project/497963/insights/7NHdAPgk)

## Verify before merging

- [ ] Run a full production build (`npm run build`) and fix any lint or type errors introduced by the generated code.
- [ ] Run the test suite — call sites that were rewritten or instrumented may need updated mocks or fixtures.
- [ ] Add `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` and `NEXT_PUBLIC_POSTHOG_HOST` to `.env.example` and any deployment environment configuration (Vercel project settings, CI secrets) so collaborators and production know what to set.
- [ ] Wire source-map upload (`posthog-cli sourcemap` or your bundler's upload step) into CI so production stack traces de-minify in PostHog Error Tracking.
- [ ] Confirm the returning-visitor path also calls `identify` — currently only the `/api/auth/login` route and `LoginForm` identify on fresh login. Consider adding a lightweight client component to the account layout that reads user info from the server and calls `posthog.identify()` on page refresh so returning sessions with a valid cookie are also associated.

### Agent skill

We've left an agent skill folder in your project at `.claude/skills/integration-nextjs-app-router/`. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.
