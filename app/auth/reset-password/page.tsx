"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { KeyRound, Lock, ShieldCheck } from "lucide-react";

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
  initialStatus,
} from "../components/action-status";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const initialToken = searchParams.get("token") ?? "";
  const [capturedToken, setCapturedToken] = useState<string>(initialToken);
  const [manualMode, setManualMode] = useState<boolean>(() => !initialToken);
  const [manualOverride, setManualOverride] = useState<boolean>(false);
  const [manualToken, setManualToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<ActionStatus>(initialStatus);

  useEffect(() => {
    const token = searchParams.get("token") ?? "";
    setCapturedToken(token);
    if (token && !manualOverride) {
      setManualMode(false);
      setManualToken("");
    }
    if (!token) {
      setManualMode(true);
    }
  }, [searchParams, manualOverride]);

  const activeToken = manualMode ? manualToken.trim() : capturedToken.trim();

  const maskedToken = useMemo(() => {
    if (!capturedToken) return "";
    if (capturedToken.length <= 8) return "••••";
    return `${capturedToken.slice(0, 4)}••••${capturedToken.slice(-4)}`;
  }, [capturedToken]);

  const handleReset = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!activeToken) {
      setStatus({
        state: "error",
        message: "Missing token. Use the email link or paste it manually.",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      setStatus({ state: "error", message: "Passwords must match." });
      return;
    }

    setStatus({ state: "loading", message: "Applying new password..." });
    try {
      const response = await fetch(authApiUrl("/reset-password"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ token: activeToken, newPassword }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(
          data?.message ??
            "Unable to reset password. Your link might be invalid or expired.",
        );
      }
      setStatus({
        state: "success",
        message: "Password updated. You can sign in with it immediately.",
      });
      setNewPassword("");
      setConfirmPassword("");
      setManualToken("");
    } catch (error) {
      setStatus({
        state: "error",
        message:
          error instanceof Error
            ? error.message
            : "Reset failed. Try generating a fresh link.",
      });
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-emerald-500/10 via-transparent to-transparent" />
      </div>
      <Navigation />
      <main className="flex-1 px-4 py-16 sm:px-8">
        <section className="mx-auto flex max-w-4xl flex-col gap-4 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-emerald-300">
            Phase two
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Reset your password
          </h1>
          <p className="text-base text-slate-300 sm:text-lg">
            This page consumes Better Auth's `/reset-password` endpoint. Secure
            tokens arrive via email and never surface visibly—only masked
            confirmations appear here.
          </p>
        </section>

        <Card className="mx-auto mt-12 max-w-2xl border-white/10 bg-slate-900/80 p-8 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-emerald-300">
                <Lock className="h-4 w-4" /> Secure token capture
              </div>
              <h2 className="mt-3 text-2xl font-semibold">
                Choose a new password
              </h2>
            </div>
            <ShieldCheck className="h-12 w-12 text-emerald-300" />
          </div>

          <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-sm text-emerald-200">
            {capturedToken ? (
              manualMode ? (
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <span>
                    Manual override enabled. The email token stays hidden.
                  </span>
                  <button
                    type="button"
                    className="text-xs uppercase tracking-wide text-white/80 underline-offset-4 hover:underline"
                    onClick={() => {
                      setManualOverride(false);
                      setManualMode(false);
                      setManualToken("");
                    }}
                  >
                    Use email token
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <span>
                    Token linked via email:{" "}
                    <span className="font-semibold tracking-wider">
                      {maskedToken}
                    </span>
                  </span>
                  <button
                    type="button"
                    className="text-xs uppercase tracking-wide text-white/80 underline-offset-4 hover:underline"
                    onClick={() => {
                      setManualOverride(true);
                      setManualMode(true);
                      setManualToken("");
                    }}
                  >
                    Paste different token
                  </button>
                </div>
              )
            ) : (
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <span>No token detected. Paste the secure code below.</span>
                <button
                  type="button"
                  className="text-xs uppercase tracking-wide text-white/80 underline-offset-4 hover:underline"
                  onClick={() => setManualMode(true)}
                >
                  Provide token
                </button>
              </div>
            )}
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleReset}>
            {manualMode && (
              <div>
                <Label htmlFor="reset-token">Token</Label>
                <Input
                  id="reset-token"
                  placeholder="Paste token from email"
                  value={manualToken}
                  onChange={(event) => setManualToken(event.target.value)}
                  required
                  className="mt-2"
                />
              </div>
            )}
            <div>
              <Label htmlFor="reset-password">New password</Label>
              <Input
                id="reset-password"
                type="password"
                placeholder="Strong new password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                required
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="reset-password-confirm">Confirm password</Label>
              <Input
                id="reset-password-confirm"
                type="password"
                placeholder="Repeat the password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                className="mt-2"
              />
            </div>
            <StatusNote status={status} />
            <Button
              type="submit"
              className="w-full"
              disabled={status.state === "loading"}
            >
              {status.state === "loading" ? "Resetting..." : "Update password"}
            </Button>
          </form>

          <div className="mt-8 flex flex-col gap-2 border-t border-white/5 pt-6 text-sm text-slate-400">
            <p className="flex items-center justify-center gap-2">
              <KeyRound className="h-4 w-4 text-emerald-300" />
              Token expired? Head back to{" "}
              <Link href="/auth/request-reset" className="underline">
                Step 1
              </Link>
              .
            </p>
          </div>
        </Card>
      </main>
      <Footer />
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
          <main className="flex flex-1 items-center justify-center px-4 py-16 sm:px-8">
            <Card className="w-full max-w-xl border-white/10 bg-slate-900/80 p-8 text-center backdrop-blur">
              Loading password reset...
            </Card>
          </main>
          <Footer />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
