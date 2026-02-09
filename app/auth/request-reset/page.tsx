"use client";

import { useState } from "react";
import Link from "next/link";
import { RefreshCw, Sparkles } from "lucide-react";

import { Navigation } from "@/app/components/Navigation";
import Footer from "@/app/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { authApiUrl } from "@/app/lib/auth-client";
import {
  ActionStatus,
  StatusNote,
  buildClientOrigin,
  initialStatus,
} from "../components/action-status";

export default function RequestPasswordResetPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<ActionStatus>(initialStatus);

  const handleRequest = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus({ state: "loading", message: "Dispatching recovery link..." });

    try {
      const origin = buildClientOrigin();
      const redirectTo = origin ? `${origin}/auth/reset-password` : undefined;
      const payload: Record<string, string> = { email };
      if (redirectTo) payload.redirectTo = redirectTo;

      const response = await fetch(authApiUrl("/request-password-reset"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.message ?? "We couldn't reach the auth API.");
      }

      setStatus({
        state: "success",
        message:
          data?.message ??
          "If the email exists, the reset link is already en route.",
      });
      setEmail("");
    } catch (error) {
      setStatus({
        state: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unexpected issue while requesting the reset link.",
      });
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.18),_transparent_60%)]" />
      </div>
      <Navigation />
      <main className="flex-1 px-4 py-16 sm:px-8">
        <section className="mx-auto flex max-w-4xl flex-col gap-6 text-center">
          <p className="text-xs uppercase tracking-[0.45em] text-cyan-200">
            Phase one
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Reset dispatch center
          </h1>
          <p className="text-base text-slate-300 sm:text-lg">
            Trigger Better Auth's `/request-password-reset` endpoint without
            touching Postman. We'll craft a branded email that points back to
            your reset screen automatically.
          </p>
        </section>

        <Card className="mx-auto mt-12 max-w-xl border-white/10 bg-slate-900/80 p-8 backdrop-blur">
          <div className="flex items-center gap-3 text-sm uppercase tracking-wide text-cyan-200">
            <RefreshCw className="h-5 w-5" />
            Recovery link generator
          </div>
          <h2 className="mt-3 text-2xl font-semibold">
            Send a password reset email
          </h2>
          <p className="mt-2 text-sm text-slate-300">
            Enter the account email, and we'll wire a single-use link that
            expires quickly. The redirect URL is set to land on{" "}
            <span className="font-semibold text-white">
              /auth/reset-password
            </span>{" "}
            by default.
          </p>
          <form className="mt-8 space-y-5" onSubmit={handleRequest}>
            <div>
              <Label htmlFor="reset-email">Account email</Label>
              <Input
                id="reset-email"
                type="email"
                required
                placeholder="you@example.com"
                className="mt-2"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <StatusNote status={status} />
            <Button
              type="submit"
              className="w-full"
              disabled={status.state === "loading"}
            >
              {status.state === "loading"
                ? "Sending..."
                : "Email reset instructions"}
            </Button>
          </form>
          <div className="mt-6 flex flex-col gap-2 border-t border-white/5 pt-6 text-sm text-slate-400">
            <p className="flex items-center justify-center gap-2">
              <Sparkles className="h-4 w-4 text-cyan-200" />
              Need to complete the flow?
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-xs uppercase tracking-wide text-cyan-200">
              <Link href="/auth/reset-password" className="hover:text-white">
                Step 2 · Reset password
              </Link>
              <Link href="/auth/change-password" className="hover:text-white">
                Step 3 · Change password
              </Link>
              <Link href="/auth/send-verification" className="hover:text-white">
                Send verification
              </Link>
            </div>
          </div>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
