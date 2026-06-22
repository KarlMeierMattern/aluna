import type { NotifPrefs } from "@/lib/db/types";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const raw = window.atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

export type PushResult = { ok: true } | { ok: false; error: string };

export function pushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

async function getRegistration(): Promise<ServiceWorkerRegistration> {
  const reg = await navigator.serviceWorker.register("/sw.js");
  return navigator.serviceWorker.ready.then(() => reg);
}

export async function subscribeToPush(
  prefs: NotifPrefs
): Promise<PushResult> {
  if (!pushSupported()) {
    return { ok: false, error: "Push notifications are not supported here." };
  }

  const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!vapidKey) {
    return { ok: false, error: "Notifications are not configured yet." };
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    return { ok: false, error: "Notification permission was denied." };
  }

  try {
    const reg = await getRegistration();
    let sub = await reg.pushManager.getSubscription();

    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey) as BufferSource,
      });
    }

    const json = sub.toJSON();
    if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
      return { ok: false, error: "Could not read push subscription." };
    }

    const res = await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        endpoint: json.endpoint,
        keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
        reminderPrefs: prefs,
      }),
    });

    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (res.status === 503) {
        return {
          ok: false,
          error: "Server not configured (database or env vars).",
        };
      }
      return {
        ok: false,
        error: data.error ?? "Failed to save subscription on server.",
      };
    }

    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("sw.js") || msg.includes("ServiceWorker")) {
      return {
        ok: false,
        error:
          "Service worker not available — push only works on the deployed app (not local dev).",
      };
    }
    if (msg.includes("applicationServerKey") || msg.includes("Invalid")) {
      return {
        ok: false,
        error:
          "Invalid VAPID key — check NEXT_PUBLIC_VAPID_PUBLIC_KEY matches your public key.",
      };
    }
    return { ok: false, error: `Could not enable notifications: ${msg}` };
  }
}

export async function updatePushPrefs(prefs: NotifPrefs): Promise<PushResult> {
  if (!pushSupported()) {
    return { ok: false, error: "Push not supported." };
  }

  try {
    const reg = await getRegistration();
    const sub = await reg.pushManager.getSubscription();
    if (!sub) {
      return { ok: false, error: "Enable notifications first." };
    }

    const json = sub.toJSON();
    if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
      return { ok: false, error: "Invalid subscription." };
    }

    const res = await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        endpoint: json.endpoint,
        keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
        reminderPrefs: prefs,
      }),
    });

    if (!res.ok) {
      return { ok: false, error: "Failed to update reminder preferences." };
    }

    return { ok: true };
  } catch {
    return { ok: false, error: "Could not update preferences." };
  }
}

export async function getPushPermission(): Promise<
  NotificationPermission | "unsupported"
> {
  if (!pushSupported()) return "unsupported";
  return Notification.permission;
}

export async function hasPushSubscription(): Promise<boolean> {
  if (!pushSupported()) return false;
  try {
    const reg = await getRegistration();
    const sub = await reg.pushManager.getSubscription();
    return !!sub;
  } catch {
    return false;
  }
}
