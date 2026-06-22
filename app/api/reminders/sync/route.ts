import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { reminderSchedules } from "@/lib/db/schema";
import { computeReminderSchedule } from "@/lib/reminders/schedule";
import type { AlunaState } from "@/lib/db/types";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const body = (await req.json()) as { state?: AlunaState };
  if (!body.state) {
    return NextResponse.json({ error: "Missing state" }, { status: 400 });
  }

  const schedule = computeReminderSchedule(body.state);
  if (!schedule.nextBleedDate) {
    return NextResponse.json({
      ok: true,
      synced: false,
      reason: "no_period_start",
    });
  }

  await db
    .insert(reminderSchedules)
    .values({
      userId: session.user.id,
      nextBleedDate: schedule.nextBleedDate,
      fertileWindowStart: schedule.fertileWindowStart,
      fertileWindowEnd: schedule.fertileWindowEnd,
    })
    .onConflictDoUpdate({
      target: reminderSchedules.userId,
      set: {
        nextBleedDate: schedule.nextBleedDate,
        fertileWindowStart: schedule.fertileWindowStart,
        fertileWindowEnd: schedule.fertileWindowEnd,
        updatedAt: new Date(),
      },
    });

  return NextResponse.json({ ok: true, synced: true, schedule });
}
