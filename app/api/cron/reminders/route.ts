import webpush from "web-push";
import { getDb } from "@/lib/db";
import { pushSubscriptions, reminderSchedules } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

const BATCH_SIZE = 200;

function setupVapid() {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const contact = process.env.VAPID_CONTACT_EMAIL;
  if (!publicKey || !privateKey || !contact) return false;
  webpush.setVapidDetails(`mailto:${contact}`, publicKey, privateKey);
  return true;
}

function daysBetween(fromIso: string, toIso: string): number {
  const from = new Date(fromIso + "T00:00:00").getTime();
  const to = new Date(toIso + "T00:00:00").getTime();
  return Math.floor((to - from) / 86400000);
}

async function sendToUser(
  subs: (typeof pushSubscriptions.$inferSelect)[],
  payload: { title: string; body: string }
): Promise<number> {
  let sent = 0;
  const data = JSON.stringify(payload);

  for (const sub of subs) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        data
      );
      sent++;
    } catch {
      // subscription expired or invalid
    }
  }

  return sent;
}

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  if (!db || !setupVapid()) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const todayIso = new Date().toISOString().slice(0, 10);
  const schedules = await db
    .select()
    .from(reminderSchedules)
    .limit(BATCH_SIZE);

  let sent = 0;

  for (const schedule of schedules) {
    const subs = await db
      .select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.userId, schedule.userId));

    if (!subs.length) continue;

    const prefs = subs[0].reminderPrefs;
    if (!prefs) continue;

    let body: string | null = null;

    if (schedule.nextBleedDate && prefs.periodDaysBefore > 0) {
      const diff = daysBetween(todayIso, schedule.nextBleedDate);
      if (diff === prefs.periodDaysBefore) {
        body = `Your period may start in ${diff} day${diff === 1 ? "" : "s"}.`;
      }
    }

    if (
      !body &&
      prefs.fertileAlert &&
      schedule.fertileWindowStart === todayIso
    ) {
      body = "Your estimated fertile window starts today.";
    }

    if (!body && prefs.dailyNudge) {
      body = "Take a moment to log how you're feeling today.";
    }

    if (!body) continue;

    sent += await sendToUser(subs, { title: "Aluna", body });
  }

  return NextResponse.json({ sent, processed: schedules.length, date: todayIso });
}
