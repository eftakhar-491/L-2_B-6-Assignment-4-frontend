"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MailCheck } from "lucide-react";

import { Navigation } from "@/app/components/Navigation";
import Footer from "@/app/components/Footer";
import { useAuth } from "@/app/context/AuthContext";
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

export default function SendVerificationPage() {
  const { user } = useAuth();
  const [email, setEmail] = useState(user?.email ?? "");
  const [status, setStatus] = useState<ActionStatus>(initialStatus);

  useEffect(() => {
    if (user?.email) setEmail(user.email);
  }, [user?.email]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus({ state: "loading", message: "Queuing verification email..." });

    try {
      const origin = buildClientOrigin();
      const callbackURL = origin ? `${origin}/auth/verify` : undefined;
      const payload: Record<string, string> = { email };
      if (callbackURL) payload.callbackURL = callbackURL;

      const response = await fetch(authApiUrl("/send-verification-email"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.message ?? "Unable to send verification email.");
      }
      setStatus({
        state: "success",
        message: "If the account exists, a verification link is on its way.",
      });
    } catch (error) {
      setStatus({
        state: "error",
        message:
          error instanceof Error
            ? error.message
            : "Something went wrong while sending the email.",
      });
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-x-0 top-0 h-96 bg-[radial-gradient(circle_at_top,_rgba(191,219,254,0.25),_transparent_60%)]" />
      </div>
      <Navigation />
      <main className="flex-1 px-4 py-16 sm:px-8">
        <section className="mx-auto flex max-w-3xl flex-col gap-4 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-blue-200">
            Verification loop
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Send a fresh verification email
          </h1>
          <p className="text-base text-slate-300 sm:text-lg">
            QA teams can fire the `/send-verification-email` endpoint from here
            and test the complete callback flow at{" "}
            <span className="font-semibold text-white">/auth/verify</span>.
          </p>
        </section>

        <Card className="mx-auto mt-12 max-w-xl border-white/10 bg-slate-900/80 p-8 backdrop-blur">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-blue-200">
            <MailCheck className="h-4 w-4" /> Email assurance
          </div>
          <h2 className="mt-3 text-2xl font-semibold">
            Resend verification link
          </h2>
          <p className="mt-2 text-sm text-slate-300">
            We'll send a signed URL that directs users back to{" "}
            <Link href="/auth/verify" className="underline">
              /auth/verify
            </Link>
            to finish activation.
          </p>
          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="verification-email">Account email</Label>
              <Input
                id="verification-email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2"
                placeholder="you@example.com"
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
                : "Send verification email"}
            </Button>
          </form>
          <div className="mt-8 flex items-center justify-center gap-2 border-t border-white/5 pt-6 text-sm text-slate-400">
            <MailCheck className="h-4 w-4 text-blue-200" />
            Need password help?{" "}
            <Link href="/auth/request-reset" className="underline">
              Start with Step 1
            </Link>
            .
          </div>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
