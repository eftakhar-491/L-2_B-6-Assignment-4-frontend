"use client";

import { useState } from "react";
import Link from "next/link";
import { LockKeyhole, Shield, ToggleRight } from "lucide-react";

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
  initialStatus,
} from "../components/action-status";

export default function ChangePasswordPage() {
  const { isAuthenticated } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [revokeSessions, setRevokeSessions] = useState(true);
  const [status, setStatus] = useState<ActionStatus>(initialStatus);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isAuthenticated) {
      setStatus({ state: "error", message: "Log in to change your password." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setStatus({ state: "error", message: "New passwords do not match." });
      return;
    }

    setStatus({ state: "loading", message: "Saving your credentials..." });
    try {
      const response = await fetch(authApiUrl("/change-password"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          currentPassword,
          newPassword,
          revokeOtherSessions: revokeSessions,
        }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(
          data?.message ?? "Unable to change password. Try again.",
        );
      }
      setStatus({
        state: "success",
        message: "Password updated successfully.",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setStatus({
        state: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unexpected error while changing password.",
      });
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-y-0 left-1/2 h-full w-1/2 -translate-x-1/2 bg-[radial-gradient(circle,_rgba(244,114,182,0.15),_transparent_55%)]" />
      </div>
      <Navigation />
      <main className="flex-1 px-4 py-16 sm:px-8">
        <section className="mx-auto flex max-w-4xl flex-col gap-4 text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-amber-200">
            Phase three
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Change password while signed in
          </h1>
          <p className="text-base text-slate-300 sm:text-lg">
            Use this screen after authenticating to rotate your password
            instantly. It's wired to Better Auth's `/change-password` endpoint
            and optionally revokes every other active session.
          </p>
        </section>

        <Card className="mx-auto mt-12 max-w-2xl border-white/10 bg-slate-900/80 p-8 backdrop-blur">
          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.4em] text-amber-200">
            <Shield className="h-4 w-4" /> Zero-trust controls
          </div>
          <h2 className="mt-3 text-2xl font-semibold">
            Verify current password
          </h2>
          <p className="mt-2 text-sm text-slate-300">
            We verify your current password before issuing the change. You can
            optionally wipe every other session to force re-authentication
            across devices.
          </p>
          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="current-password">Current password</Label>
              <Input
                id="current-password"
                type="password"
                required
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="new-password">New password</Label>
              <Input
                id="new-password"
                type="password"
                required
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="confirm-password">Confirm new password</Label>
              <Input
                id="confirm-password"
                type="password"
                required
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="mt-2"
              />
            </div>
            <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
              <input
                type="checkbox"
                className="h-4 w-4 accent-amber-400"
                checked={revokeSessions}
                onChange={(event) => setRevokeSessions(event.target.checked)}
              />
              <span className="flex flex-col text-left">
                <span className="font-medium text-white">
                  Revoke other sessions
                </span>
                <span className="text-xs text-slate-300">
                  Instantly log out every other device after the password
                  rotates.
                </span>
              </span>
            </label>
            {!isAuthenticated && (
              <p className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-100">
                You are not signed in.{" "}
                <Link href="/login" className="underline">
                  Login
                </Link>{" "}
                to continue.
              </p>
            )}
            <StatusNote status={status} />
            <Button
              type="submit"
              className="w-full"
              disabled={!isAuthenticated || status.state === "loading"}
            >
              {status.state === "loading" ? "Updating..." : "Change password"}
            </Button>
          </form>
          <div className="mt-8 flex items-center justify-center gap-2 border-t border-white/5 pt-6 text-sm text-slate-400">
            <ToggleRight className="h-4 w-4 text-amber-200" />
            Need a reset link instead?{" "}
            <Link href="/auth/request-reset" className="underline">
              Go to Step 1
            </Link>
            .
          </div>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
