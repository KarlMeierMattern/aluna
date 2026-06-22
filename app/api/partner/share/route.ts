import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import {
  partnerLinks,
  reminderSchedules,
  shareSnapshots,
} from "@/lib/db/schema";
import { getCycleSnapshot, getFertileWindow, iso } from "@/lib/cycle/utils";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import type { AlunaState } from "@/lib/db/types";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  if (!db) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  const body = (await req.json()) as { state: AlunaState; scopes?: object };
  const { state, scopes } = body;
  if (!state) return NextResponse.json({ error: "Missing state" }, { status: 400 });

  const snapshot = getCycleSnapshot(state.periodStart, state.cycleLen, state.bc);
  const fertile = getFertileWindow(state.cycleLen);
  const bcSuppresses = snapshot.bcSuppresses;

  const ownerId = session.user.id;
  const nextBleed =
    state.periodStart && snapshot.daysToNext !== null
      ? iso(
          new Date(
            Date.now() + snapshot.daysToNext * 86400000
          )
        )
      : null;

  await db
    .insert(shareSnapshots)
    .values({
      ownerId,
      cycleDay: snapshot.cycleDay,
      phaseName: snapshot.phase?.name ?? null,
      phaseEyebrow: snapshot.phase?.eyebrow ?? null,
      daysToBleed: snapshot.daysToNext,
      cycleLen: state.cycleLen,
      fertileWindowStart: bcSuppresses
        ? null
        : String(fertile.startDay),
      fertileWindowEnd: bcSuppresses ? null : String(fertile.endDay),
    })
    .onConflictDoUpdate({
      target: shareSnapshots.ownerId,
      set: {
        cycleDay: snapshot.cycleDay,
        phaseName: snapshot.phase?.name ?? null,
        phaseEyebrow: snapshot.phase?.eyebrow ?? null,
        daysToBleed: snapshot.daysToNext,
        cycleLen: state.cycleLen,
        fertileWindowStart: bcSuppresses
          ? null
          : String(fertile.startDay),
        fertileWindowEnd: bcSuppresses ? null : String(fertile.endDay),
        updatedAt: new Date(),
      },
    });

  if (nextBleed) {
    await db
      .insert(reminderSchedules)
      .values({
        userId: ownerId,
        nextBleedDate: nextBleed,
        fertileWindowStart: bcSuppresses ? null : String(fertile.startDay),
        fertileWindowEnd: bcSuppresses ? null : String(fertile.endDay),
      })
      .onConflictDoUpdate({
        target: reminderSchedules.userId,
        set: {
          nextBleedDate: nextBleed,
          fertileWindowStart: bcSuppresses ? null : String(fertile.startDay),
          fertileWindowEnd: bcSuppresses ? null : String(fertile.endDay),
          updatedAt: new Date(),
        },
      });
  }

  const [existing] = await db
    .select()
    .from(partnerLinks)
    .where(eq(partnerLinks.ownerId, ownerId))
    .limit(1);

  let token = existing?.token;
  if (!token) {
    token = randomBytes(24).toString("base64url");
    await db.insert(partnerLinks).values({
      ownerId,
      token,
      active: true,
      scopes: (scopes as typeof partnerLinks.$inferSelect.scopes) ?? {
        phase: true,
        countdown: true,
        fertileWindow: false,
      },
    });
  } else {
    await db
      .update(partnerLinks)
      .set({ active: true })
      .where(eq(partnerLinks.ownerId, ownerId));
  }

  const url = new URL(req.url);
  return NextResponse.json({
    token,
    shareUrl: `${url.origin}/share/${token}`,
  });
}

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  await db
    .update(partnerLinks)
    .set({ active: false })
    .where(eq(partnerLinks.ownerId, session.user.id));

  return NextResponse.json({ ok: true });
}
