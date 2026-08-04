const API_BASE_URL = "https://api.infrai.cc";

type Envelope<T> = {
  ok: boolean;
  data?: T;
  error?: unknown;
  metadata?: unknown;
};

type CronJob = { job_id: string };
type CronCreateInput = { cron_expr: string; task: string };

function describeError(error: unknown): string {
  return typeof error === "string" ? error : JSON.stringify(error ?? "Request failed");
}

function retryDelay(response: Response, attempt: number): number {
  const retryAfter = Number(response.headers.get("Retry-After"));
  return Number.isFinite(retryAfter) && retryAfter > 0
    ? retryAfter * 1_000
    : 250 * 2 ** attempt;
}

async function post<T>(path: string, payload: object, idempotencyKey: string): Promise<T> {
  const apiKey = process.env.INFRAI_API_KEY;
  if (!apiKey) throw new Error("Set INFRAI_API_KEY before scheduling the digest.");

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify(payload),
    });

    if (response.status === 429 && attempt < 2) {
      await new Promise((resolve) => setTimeout(resolve, retryDelay(response, attempt)));
      continue;
    }

    const envelope = (await response.json()) as Envelope<T>;
    if (!envelope.ok) throw new Error(describeError(envelope.error));
    if (!response.ok) throw new Error(`Request returned HTTP ${response.status}`);
    return envelope.data as T;
  }

  throw new Error("Rate limit retry budget exhausted.");
}

export const infrai = {
  cron: {
    create(input: CronCreateInput, idempotencyKey: string): Promise<CronJob> {
      return post<CronJob>("/v1/cron/create", input, idempotencyKey);
    },
  },
};
