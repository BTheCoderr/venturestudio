# Cloud integration
The dedicated VentureStudio Supabase project is `blxvjwptgwuhxsxvnffv`.
Copy `.env.example` to `.env.local` to enable cloud mode. Only the publishable key is used in the browser. Never use a secret/service-role key in client code.
Cloud mode requires email/password authentication. The application stores leads and workouts per authenticated user with database RLS.
For a deployed site, configure the public site URL and allowed email-confirmation redirect URLs in Supabase Auth settings.
The app remains undeployed until hosting is ready. Local-only mode remains available without environment variables.
