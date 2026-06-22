"use client";

import { useEffect, useState } from "react";
import { Background } from "@/components/Background";

type ShareData = {
  snapshot: {
    cycleDay: number | null;
    phaseName: string | null;
    phaseEyebrow: string | null;
    daysToBleed: number | null;
    cycleLen: number | null;
    fertileWindowStart: string | null;
    fertileWindowEnd: string | null;
    updatedAt: string;
  };
};

export default function SharePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const [token, setToken] = useState<string | null>(null);
  const [data, setData] = useState<ShareData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => setToken(p.token));
  }, [params]);

  useEffect(() => {
    if (!token) return;
    fetch(`/api/partner/${token}`)
      .then(async (r) => {
        if (!r.ok) throw new Error("Link unavailable");
        return r.json();
      })
      .then(setData)
      .catch(() => setError("This share link is unavailable or has been revoked."));
  }, [token]);

  return (
    <>
      <Background />
      <div className="wrap">
        <div className="brand" style={{ marginBottom: 24 }}>
          <div className="logo">Aluna</div>
          <div className="tagline">shared view</div>
        </div>
        {error && <p className="phase-desc">{error}</p>}
        {data && (
          <section className="hero">
            <div className="glass-shimmer" />
            {data.snapshot.cycleDay && (
              <div className="day-dot">
                <div className="n">{data.snapshot.cycleDay}</div>
                <div className="l">day</div>
              </div>
            )}
            <div className="phase-eyebrow">{data.snapshot.phaseEyebrow}</div>
            <div className="phase-name">{data.snapshot.phaseName}</div>
            {data.snapshot.daysToBleed !== null && (
              <div className="countdown">
                <div className="cd-num">{data.snapshot.daysToBleed}</div>
                <div className="cd-label">days until next bleed (est.)</div>
              </div>
            )}
          </section>
        )}
        <p className="small">Read-only snapshot. Not medical advice.</p>
      </div>
    </>
  );
}
