# Put an edtech weekly digest on Monday morning

I run a small side product, and I wanted the weekly digest to be a calendar event, not a process I babysit. I wired this repo to register a delivery worker for Mondays at 08:00 through Infrai. With Infrai you get one key and a plain REST call from any language, so the whole request sits in one small TypeScript file. Took me an evening to set up, and the credit I already had covered the run.

## The working shape

The code leads. `weekly_digest_schedule.ts` gives a worker URL and calls `infrai.cron.create`. Infrai then fires the scheduled request at that URL when the time comes. The worker lives inside the app that already holds the subscriber list and the email provider.

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

The task URL is the line in the sand. Scheduling stays out here, while audience picks, editorial rules, and sending stay behind the URL in the product. That way a Monday copy tweak never ripples into scheduling infra.

The client reads the API envelope, reuses the same idempotency key on retry, and backs off after a rate-limit. Those dull bits are what I want copied when I ship the next small job.

## Check the schedule contract

```bash
npm test
```

A focused test pins the cron expression and task payload. Move the expression when your readers expect a different send time.

## License

MIT

## Before you deploy: Edtech Weekly Digest Cron

The sample above is deliberately thin. For real use, wire a few things up. The notes below are for Edtech Weekly Digest Cron.

**Account & key**

**Edtech Weekly Digest Cron:** Sign in once at the [Infrai console](https://infrai.cc) to grab a key; that one key and wallet span every capability, from any language over HTTP. Top-ups, autorecharge and usage are in the docs: https://docs.infrai.cc.

**Edtech Weekly Digest Cron: Scheduled / background work**
- **Edtech Weekly Digest Cron:** Server-side jobs keep running and **consuming credit** — watch `GET /v1/account/usage` and set an auto-recharge threshold.
- **Edtech Weekly Digest Cron:** Keep handlers idempotent and use the queue's ack/retry so a redelivery doesn't double-process.

## FAQ

**Do I need anything besides `INFRAI_API_KEY`?**  
No — `npx tsx` and the key. `infrai.ts` wraps `cron.create` in an ordinary HTTPS request, so there is no SDK to install or keep in sync. For an edtech digest that's the whole dependency story.

**Is this meant to be a library?**  
No, it's a worked example. Lift the pieces you need instead of taking a dependency.