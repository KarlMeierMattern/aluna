"use client";

import { useEffect, useState } from "react";
import type { AlunaState } from "@/lib/db/types";
import {
  enablePartnerShare,
  fetchPartnerShareStatus,
  revokePartnerShare,
} from "@/lib/sync/client";
import { SheetShell } from "./SheetShell";

type Props = {
  open: boolean;
  state: AlunaState;
  onClose: () => void;
  onBack: () => void;
};

export function PartnerShareSheet({ open, state, onClose, onBack }: Props) {
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setMsg(null);
    fetchPartnerShareStatus().then((s) => {
      setShareUrl(s.active && s.shareUrl ? s.shareUrl : null);
    });
  }, [open]);

  async function createLink() {
    setMsg(null);
    const result = await enablePartnerShare(state, {
      phase: true,
      countdown: true,
      fertileWindow: state.ttcMode,
    });
    if (result.ok && result.shareUrl) {
      setShareUrl(result.shareUrl);
      setMsg("Link created — your partner sees phase and countdown only.");
    } else {
      setMsg(result.error ?? "Could not create link.");
    }
  }

  async function revoke() {
    const ok = await revokePartnerShare();
    if (ok) {
      setShareUrl(null);
      setMsg("Link revoked. Old links no longer work.");
    }
  }

  async function copy() {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setMsg("Copied.");
  }

  return (
    <SheetShell
      open={open}
      title="Share with partner"
      subtitle="They get a read-only snapshot — not your full history. Revoke anytime."
      onClose={onClose}
      onBack={onBack}
    >
      {shareUrl ? (
        <>
          <label htmlFor="shareUrl">Share link</label>
          <input id="shareUrl" readOnly value={shareUrl} onFocus={(e) => e.target.select()} />
          <div className="actions sheet-actions">
            <button type="button" className="btn btn-primary" onClick={copy}>
              Copy link
            </button>
            <button type="button" className="btn btn-ghost" onClick={revoke}>
              Revoke
            </button>
          </div>
        </>
      ) : (
        <button type="button" className="btn btn-primary sheet-full-btn" onClick={createLink}>
          Create share link
        </button>
      )}
      {msg && <p className="sheet-hint">{msg}</p>}
    </SheetShell>
  );
}
