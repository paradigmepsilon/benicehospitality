// The canonical PostHog identity key for this codebase.
//
// Everything that captures a PostHog event — client component, API route, or
// Stripe webhook — must key on this. It has no dependencies so both server and
// client code can import it.
//
// Why email and not the database user ID: most people in Della's social funnel
// hand over an email at a free-resource gate and never create an account at
// all. Email is the only identifier that exists at that moment, and it is what
// still identifies them if they buy a course months later. Keying on user.id
// would split one human into two people at the exact point they become worth
// money.
//
// The historical mix of `String(user.id)`, `email`, and
// `userId ? String(userId) : email` across routes is what broke the checkout
// funnel: `course_checkout_started` was keyed on user.id while the purchase
// webhook keyed on email, so the two steps counted different populations.
//
// Known limitation: PostHog will not merge two already-identified persons, so
// accounts that were identified on `String(user.id)` before this change keep
// their old history on that key. New activity consolidates on email from here
// on. `user_id` rides along as a person property so the two can still be
// cross-referenced.
export function personId(email: string): string {
  return email.trim().toLowerCase();
}
