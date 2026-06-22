# Cart Push Notifications

The app uses Expo Push Notifications for device delivery and Supabase for
preferences, scheduling, and notification dispatch.

## Architecture

- `notification_preferences` stores one cart reminder time and IANA time zone
  per user.
- `push_tokens` stores Expo push tokens. Registration goes through an RPC so a
  token can be safely transferred when another user signs in on the same
  device.
- `notification_deliveries` prevents more than one cart reminder per user and
  local calendar day.
- Supabase Cron invokes `send-cart-reminders` every five minutes.
- The Edge Function atomically claims due users, counts cart items across their
  pantry memberships, and sends notifications through the Expo Push API.

## Deploy

Apply the database migration:

```bash
supabase db push
```

Generate one secret value and set it on the Edge Function:

```bash
openssl rand -hex 32
supabase secrets set CART_REMINDER_CRON_SECRET=<generated-value>
```

Deploy the function:

```bash
supabase functions deploy send-cart-reminders --no-verify-jwt
```

In Supabase Vault, create these secrets:

- `project_url`: the project URL, such as
  `https://your-project-ref.supabase.co`
- `cart_reminder_cron_secret`: the same generated value set on the Edge
  Function

Then schedule the job from the SQL editor:

```sql
select private.schedule_cart_reminder_cron();
```

Verify the job:

```sql
select jobid, jobname, schedule, active
from cron.job
where jobname = 'send-cart-reminders';
```

Inspect recent executions:

```sql
select status, return_message, start_time, end_time
from cron.job_run_details
where jobid = (
  select jobid from cron.job where jobname = 'send-cart-reminders'
)
order by start_time desc
limit 20;
```

## Expo credentials

Push tokens require a physical device and a development or production build.
Configure APNs credentials for iOS and FCM v1 credentials for Android in the
linked EAS project, then rebuild the native app after adding
`expo-notifications`.

## Retry behavior

Each reminder is claimed before contacting Expo. Failed or abandoned claims can
be retried after 15 minutes. Successful claims remain unique for the user's
local calendar day.
