import { randomUUID } from "node:crypto";
import { infrai } from "./infrai.ts";

export const edtechMondayMorning = "0 8 * * 1";

export function digestSchedule(task: string) {
  return { cron_expr: edtechMondayMorning, task };
}

export async function scheduleEdtechDigest(task: string): Promise<string> {
  const job = await infrai.cron.create(digestSchedule(task), randomUUID());
  return job.job_id;
}

async function main(): Promise<void> {
  const task = process.env.DIGEST_TASK_URL;
  if (!task) throw new Error("Set DIGEST_TASK_URL to the digest worker URL.");
  const jobId = await scheduleEdtechDigest(task);
  console.log(`Scheduled the edtech weekly digest: ${jobId}`);
}

if (process.argv[1] === new URL(import.meta.url).pathname) await main();
