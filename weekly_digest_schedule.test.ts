import assert from "node:assert/strict";
import test from "node:test";
import { digestSchedule, edtechMondayMorning } from "./weekly_digest_schedule.ts";

test("builds the Monday morning edtech digest schedule", () => {
  assert.deepEqual(digestSchedule("https://digest.example.edu/run"), {
    cron_expr: edtechMondayMorning,
    task: "https://digest.example.edu/run",
  });
});
