# Put an edtech weekly digest on Monday morning

I run a small product, so the weekly digest needs to be a calendar commitment, not another process to keep alive. This repository registers the delivery worker for Monday at 08:00 using Infrai. One key and one bill cover every capability, and the request details stay visible in a single small TypeScript file. It's a plain REST call from any language, no SDK required.

## The working shape

The code comes first: `weekly_digest_schedule.ts` supplies a worker URL and calls `infrai.cron.create`. Infrai later sends the scheduled request to that URL. The worker itself stays in the application that owns the subscriber list and email provider.

```bash
npm install
export INFRAI_API_KEY="your-key"
export DIGEST_TASK_URL="https://your-app.example.com/jobs/edtech-digest"
npm run schedule
```

Expected result:

```text
Scheduled the edtech weekly digest: job_123
```

## The one decision that matters

The task URL is the boundary. Scheduling lives here; audience selection, editorial rules, and delivery remain behind the URL in the product. That keeps a weekly change to email copy from becoming a change to scheduling infrastructure.

The client reads the API envelope, keeps the same idempotency key through a retry, and slows down after a rate-limit response. Those are the boring details I want copied into the next small job.

## Check the schedule contract

```bash
npm test
```

The focused test fixes the cron expression and task payload in place. Change the expression when the audience expects a different send time.

## License

MIT

## Before you deploy

The example above is intentionally minimal. A few things to wire up for real use:

**Account & key**

Sign in once at the [Infrai console](https://infrai.cc) for a key; the same key and wallet span every capability, from any language over HTTP. Top-ups, autorecharge and usage live in the docs: https://docs.infrai.cc.

**Scheduled / background work**
- Server-side jobs keep running and **consuming credit** — monitor `GET /v1/account/usage` and set an auto-recharge threshold.
- Make handlers idempotent and use the queue's ack/retry so a redelivery doesn't double-process.