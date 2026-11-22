# Venture Studio

Two independent product prototypes in one React + TypeScript + Vite app.

## Products

- **Hotel Gym AI**: Choose available equipment, select a workout goal, generate a matching routine and track completed exercises.
- **Speed to Lead**: Capture leads, update their pipeline status, prepare editable reply drafts and open a draft in your email app.

## Run locally

```bash
npm install
npm run dev
```

Build check:

```bash
npm run build
```

## MVP limitations

All data is stored in browser localStorage, not a backend. Workout adaptation is rule-based, not AI-powered. Lead replies are templates and are **not automatically sent**. There is no user authentication, real-time messaging, calendar sync, payment processing or production deployment. Do not use for sensitive customer data. Future milestones: separate apps/packages, Supabase auth/database with tenant isolation, messaging integrations, AI generation, observability and end-to-end testing.
