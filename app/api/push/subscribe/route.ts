import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { pushSubscriptions } from "@/lib/db/schema";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  if (!db) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  const body = (await req.json()) as {
    endpoint: string;
    keys: { p256dh: string; auth: string };
    reminderPrefs?: {
      periodDaysBefore: number;
      fertileAlert: boolean;
      dailyNudge: boolean;
    };
  };

  if (!body.endpoint || !body.keys?.p256dh || !body.keys?.auth) {
    return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
  }

  await db
    .insert(pushSubscriptions)
    .values({
      userId: session.user.id,
      endpoint: body.endpoint,
      p256dh: body.keys.p256dh,
      auth: body.keys.auth,
      reminderPrefs: body.reminderPrefs ?? {
        periodDaysBefore: 2,
        fertileAlert: true,
        dailyNudge: false,
      },
    })
    .onConflictDoUpdate({
      target: pushSubscriptions.endpoint,
      set: {
        userId: session.user.id,
        p256dh: body.keys.p256dh,
        auth: body.keys.auth,
        reminderPrefs: body.reminderPrefs,
      },
    });

  return NextResponse.json({ ok: true });
}
