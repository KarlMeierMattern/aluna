import { getDb } from "@/lib/db";
import { partnerLinks, shareSnapshots } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  const [link] = await db
    .select()
    .from(partnerLinks)
    .where(and(eq(partnerLinks.token, token), eq(partnerLinks.active, true)))
    .limit(1);

  if (!link) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (link.expiresAt && link.expiresAt < new Date()) {
    return NextResponse.json({ error: "Expired" }, { status: 410 });
  }

  const [snapshot] = await db
    .select()
    .from(shareSnapshots)
    .where(eq(shareSnapshots.ownerId, link.ownerId))
    .limit(1);

  if (!snapshot) return NextResponse.json({ error: "No data" }, { status: 404 });

  return NextResponse.json({
    scopes: link.scopes,
    snapshot: {
      cycleDay: snapshot.cycleDay,
      phaseName: snapshot.phaseName,
      phaseEyebrow: snapshot.phaseEyebrow,
      daysToBleed: snapshot.daysToBleed,
      cycleLen: snapshot.cycleLen,
      fertileWindowStart: snapshot.fertileWindowStart,
      fertileWindowEnd: snapshot.fertileWindowEnd,
      updatedAt: snapshot.updatedAt,
    },
  });
}
