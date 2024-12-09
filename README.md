# FeedbackPulse

A real-time feedback collection and analysis system.

## Setup

1. Clone the repository
2. Copy `.env.example` to `.env` and fill in your credentials
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start Supabase locally:
   ```bash
   supabase start
   ```
5. Run database migrations:
   ```bash
   npm run db:migrate
   ```
6. Start the development server:
   ```bash
   npm run dev
   ```

## Default Credentials

After running migrations and seeds, you can log in with:

- Email: admin@example.com
- Password: admin123

## Environment Variables

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `VITE_SENTRY_DSN`: (Optional) Sentry DSN for error tracking
- `VITE_POSTHOG_KEY`: (Optional) PostHog API key for analytics
- `VITE_POSTHOG_HOST`: (Optional) PostHog host URL

## Database Migrations

Migrations are run automatically during deployment. For local development:

```bash
npm run db:migrate   # Run migrations
npm run db:reset    # Reset database (caution: deletes all data)
```

## Features

- Real-time feedback collection
- Role-based access control
- Survey templates
- Analytics dashboard
- Audit logging
- Email notifications
- Multi-location support
