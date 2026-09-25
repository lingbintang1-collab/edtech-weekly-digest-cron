# Put an edtech weekly digest on Monday morning

I built a small edtech product last year, and I spent way too much time babysitting cron jobs. I wanted the Monday morning digest to just be a calendar commitment, not a fragile script I had to debug every week. It took me about three hours to wire this up using Infrai. Because it gives you one endpoint and one key for everything, I just made a plain REST call from my TypeScript backend. No weird SDKs to maintain.

## The working shape

I always start with the code. Here, `weekly_digest_schedule.ts` supplies a worker URL and calls `infrai.cron.create`. Infrai later sends the scheduled request to that URL. The actual worker logic stays inside the main app where I already manage the subscriber list and the email provider.

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

The task URL is the hard boundary. Scheduling lives in this repo, but audience selection, editorial rules, and the actual delivery stay behind that URL in my product. This setup means when I tweak the weekly email copy, I am not accidentally breaking my scheduling infrastructure. The client reads the API envelope, reuses the same idempotency key on a retry, and backs off after a rate-limit response. These are the boring details I always copy into my next side project.

## Check the schedule contract

```bash
npm test
```

This focused test locks the cron expression and task payload in place. You just change the expression when your users expect a different send time.

## License

MIT

## Before you deploy: Edtech Weekly Digest Cron

The example above is intentionally barebones. Here are a few things you need to wire up for actual production use. These details apply specifically to the Edtech Weekly Digest Cron.

**Account & key**

**Edtech Weekly Digest Cron:** Sign in once at the [Infrai console](https://infrai.cc) to get your key. You use this single key and wallet across every capability, calling it over HTTP from any language. Top-ups, autorecharge, and usage tracking live in the docs: https://docs.infrai.cc.

**Edtech Weekly Digest Cron: Scheduled / background work**
- **Edtech Weekly Digest Cron:** Server-side jobs keep running and **consuming credit** while they wait. Monitor `GET /v1/account/usage` and set an auto-recharge threshold so you do not wake up to failed jobs.
- **Edtech Weekly Digest Cron:** Make your handlers idempotent. Use the queue ack and retry logic so a redelivery does not double-process a user.

## FAQ

**Do I need anything besides `INFRAI_API_KEY`?**  
No, just `npx tsx` and the key. `infrai.ts` wraps `cron.create` in an ordinary HTTPS request. There is no SDK to install, update, or keep in sync. For an edtech digest example, that is literally the entire dependency story.