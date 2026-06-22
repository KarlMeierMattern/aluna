"use client";

import { signIn } from "next-auth/react";
import { Background } from "@/components/Background";

export function LoginPage() {
  return (
    <>
      <Background />
      <div className="login-page">
        <div className="logo">Aluna</div>
        <div className="tagline">your inner tide</div>
        <p>Track your cycle with gentle phase insights. Your logs stay on this device.</p>
        <button
          className="btn btn-primary"
          style={{ maxWidth: 280, width: "100%" }}
          onClick={() => signIn("google", { callbackUrl: "/" })}
        >
          Continue with Google
        </button>
      </div>
    </>
  );
}
