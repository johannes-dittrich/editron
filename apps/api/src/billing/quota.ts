import { db } from "@editron/db/client";
import { usageEvents, users } from "@editron/db";
import { eq, and, gte, sql } from "drizzle-orm";

const PLAN_LIMITS: Record<string, { render_minutes: number; transcribe_minutes: number }> = {
  free: { render_minutes: 10, transcribe_minutes: 10 },
  creator: { render_minutes: 600, transcribe_minutes: 600 },
  studio: { render_minutes: 2400, transcribe_minutes: 2400 },
};

function billingCycleStart(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

export interface UsageSummary {
  render_minutes: number;
  transcribe_minutes: number;
  storage_gb_hours: number;
}

export async function getCurrentUsage(userId: string): Promise<UsageSummary> {
  const cycleStart = billingCycleStart();

  const rows = await db
    .select({
      kind: usageEvents.kind,
      total: sql<string>`sum(${usageEvents.amount})`,
    })
    .from(usageEvents)
    .where(
      and(
        eq(usageEvents.userId, userId),
        gte(usageEvents.createdAt, cycleStart),
      ),
    )
    .groupBy(usageEvents.kind);

  const result: UsageSummary = { render_minutes: 0, transcribe_minutes: 0, storage_gb_hours: 0 };
  for (const row of rows) {
    if (row.kind in result) {
      (result as any)[row.kind] = Number(row.total) || 0;
    }
  }
  return result;
}

export interface QuotaCheckResult {
  allowed: boolean;
  remaining: number;
  reason?: string;
}

export async function canRender(userId: string): Promise<QuotaCheckResult> {
  const [user] = await db.select({ plan: users.plan }).from(users).where(eq(users.id, userId));
  if (!user) return { allowed: false, remaining: 0, reason: "User not found" };

  const limits = PLAN_LIMITS[user.plan] ?? PLAN_LIMITS.free;
  const usage = await getCurrentUsage(userId);
  const remaining = limits.render_minutes - usage.render_minutes;

  if (remaining <= 0) {
    return { allowed: false, remaining: 0, reason: `Render quota exceeded for ${user.plan} plan` };
  }
  return { allowed: true, remaining };
}

export async function canTranscribe(userId: string): Promise<QuotaCheckResult> {
  const [user] = await db.select({ plan: users.plan }).from(users).where(eq(users.id, userId));
  if (!user) return { allowed: false, remaining: 0, reason: "User not found" };

  const limits = PLAN_LIMITS[user.plan] ?? PLAN_LIMITS.free;
  const usage = await getCurrentUsage(userId);
  const remaining = limits.transcribe_minutes - usage.transcribe_minutes;

  if (remaining <= 0) {
    return { allowed: false, remaining: 0, reason: `Transcribe quota exceeded for ${user.plan} plan` };
  }
  return { allowed: true, remaining };
}
