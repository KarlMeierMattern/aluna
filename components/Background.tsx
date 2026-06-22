"use client";

import { useEffect, useState } from "react";
import type { ParticleMood } from "@/lib/cycle/utils";

type BgStyle = {
  b1: string;
  b2: string;
  b3: string;
  drift: string;
};

const DEFAULT_BG: BgStyle = {
  b1: "var(--plum)",
  b2: "var(--berry)",
  b3: "var(--sky)",
  drift: "28s",
};

export function Background({
  bg = DEFAULT_BG,
  mood = "rising",
}: {
  bg?: BgStyle;
  mood?: ParticleMood;
}) {
  const [particles, setParticles] = useState<
    Array<{
      id: number;
      size: number;
      left: number;
      rt: number;
      rd: number;
      drx: number;
      po: number;
    }>
  >([]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setParticles([]);
      return;
    }
    const counts: Record<ParticleMood, number> = {
      rest: 14,
      rising: 22,
      peak: 30,
      wind: 18,
    };
    const n = counts[mood] ?? 18;
    setParticles(
      Array.from({ length: n }, (_, i) => ({
        id: i,
        size: 2 + Math.random() * 7,
        left: Math.random() * 100,
        rt: 11 + Math.random() * 16,
        rd: -Math.random() * 18,
        drx: Math.random() * 40 - 20,
        po: (mood === "peak" ? 0.85 : 0.55) + Math.random() * 0.15,
      }))
    );
  }, [mood]);

  const style = {
    "--b1": bg.b1,
    "--b2": bg.b2,
    "--b3": bg.b3,
    "--drift": bg.drift,
  } as React.CSSProperties;

  return (
    <>
      <div className="bg" style={style} />
      <div className="ripple" style={{ "--drift": bg.drift } as React.CSSProperties} />
      <div className="particles">
        {particles.map((p) => (
          <div
            key={p.id}
            className="pt"
            style={{
              width: p.size,
              height: p.size,
              left: `${p.left}vw`,
              "--rt": `${p.rt}s`,
              "--rd": `${p.rd}s`,
              "--drx": `${p.drx}px`,
              "--po": p.po,
            } as React.CSSProperties}
          />
        ))}
      </div>
    </>
  );
}
