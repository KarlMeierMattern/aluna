import type { AlunaState } from "@/lib/db/types";

export async function syncReminderSchedule(
  state: AlunaState
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch("/api/reminders/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state }),
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      return { ok: false, error: data.error ?? "Sync failed" };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not reach server." };
  }
}

export async function enablePartnerShare(
  state: AlunaState,
  scopes?: { phase: boolean; countdown: boolean; fertileWindow: boolean }
): Promise<{ ok: boolean; shareUrl?: string; error?: string }> {
  try {
    const res = await fetch("/api/partner/share", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state, scopes }),
    });
    const data = (await res.json()) as { shareUrl?: string; error?: string };
    if (!res.ok) return { ok: false, error: data.error ?? "Share failed" };
    return { ok: true, shareUrl: data.shareUrl };
  } catch {
    return { ok: false, error: "Could not create share link." };
  }
}

export async function revokePartnerShare(): Promise<boolean> {
  try {
    const res = await fetch("/api/partner/share", { method: "DELETE" });
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchPartnerShareStatus(): Promise<{
  active: boolean;
  shareUrl?: string;
}> {
  try {
    const res = await fetch("/api/partner/share");
    if (!res.ok) return { active: false };
    const data = (await res.json()) as {
      active: boolean;
      token?: string;
    };
    if (!data.active || !data.token) return { active: false };
    const shareUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/share/${data.token}`
        : undefined;
    return { active: true, shareUrl };
  } catch {
    return { active: false };
  }
}
