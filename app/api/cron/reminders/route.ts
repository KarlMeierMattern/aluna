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

export async function GET(req: Request) {
  const secret = req.headers.get("authorization");
  if (secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  if (!db || !setupVapid()) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const today = new Date().toISOString().slice(0, 10);
  const schedules = await db.select().from(reminderSchedules).limit(BATCH_SIZE);

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
      const bleed = new Date(schedule.nextBleedDate + "T00:00:00");
      const diff = Math.floor(
        (bleed.getTime() - new Date(today + "T00:00:00").getTime()) / 86400000,
      );
      if (diff === prefs.periodDaysBefore) {
        body = `Your period may start in ${diff} day${diff === 1 ? "" : "s"}.`;
      }
    }

    if (!body && prefs.dailyNudge) {
      body = "Take a moment to log how you're feeling today.";
    }

    if (!body) continue;

    for (const sub of subs) {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          JSON.stringify({ title: "Aluna", body }),
        );
        sent++;
      } catch {
        // expired subscription — ignore for now
      }
    }
  }

  return NextResponse.json({ sent, processed: schedules.length });
}
