# Product roadmap

## Current
- Two React product prototypes with browser-local persistence
- Workout generator with equipment/goal/duration and substitution library
- Lead pipeline with reply drafts, appointments and CSV export
- CI TypeScript/Vite build

## Before real customers
1. Choose dedicated Supabase project and apply/review schema and RLS.
2. Implement Supabase authentication and replace browser-local storage with authenticated persistence.
3. Separate fitness and lead data into distinct product experiences with clear privacy terms.
4. Implement server-side AI endpoints with validation, rate limits and cost controls. Never ship provider API secrets to the browser.
5. Implement email/SMS provider with verified sender, consent, opt-out and audit trail; require explicit enablement before auto-send.
6. Connect real calendar provider with conflict checks and timezone handling.
7. Add tests for data isolation, RLS, draft approval, delivery errors and mobile UX.
8. Deploy after billing is available; verify on real devices.

## Current limitations
No real AI model calls, cloud persistence, customer messaging, payment processing or calendar integrations are enabled. The SQL file is a proposed schema and has not been applied.
