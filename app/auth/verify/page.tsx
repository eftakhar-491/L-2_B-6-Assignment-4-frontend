"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

import { Navigation } from "@/app/components/Navigation";
import Footer from "@/app/components/Footer";
import { useAuth } from "@/app/context/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { authApiUrl } from "@/app/lib/auth-client";

type Status = "idle" | "loading" | "success" | "error";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const { refetchSession } = useAuth();

  const token = searchParams.get("token");
  const callbackURL = searchParams.get("callbackURL") ?? undefined;
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState(
    "Click the button below if the verification does not start automatically.",
  );
  const [attempt, setAttempt] = useState(0);

  const verifyUrl = useMemo(() => {
    if (!token) return null;
    const url = new URL(authApiUrl("/verify-email"));
    url.searchParams.set("token", token);
    if (callbackURL) url.searchParams.set("callbackURL", callbackURL);
    return url.toString();
  }, [token, callbackURL]);

  useEffect(() => {
    if (!verifyUrl) {
      setStatus("error");
      setMessage(
        "Missing verification token. Please use the link from your email or request a new one.",
      );
      return;
    }

    let isActive = true;
    const verifyEmail = async () => {
      setStatus("loading");
      setMessage("Verifying your email...");
      try {
        const response = await fetch(verifyUrl, {
          method: "GET",
          credentials: "include",
        });

        const data = await response.json().catch(() => null);
        if (!response.ok) {
          const errorMessage =
            data?.message ??
            "Unable to verify your email. Please request a new link.";
          throw new Error(errorMessage);
        }

        if (!isActive) return;
        setStatus("success");
        setMessage(
          "Your email has been verified successfully. You can continue using FoodHub now.",
        );
        await refetchSession();
      } catch (error) {
        if (!isActive) return;
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Something went wrong while verifying your email.";
        setStatus("error");
        setMessage(errorMessage);
      }
    };

    verifyEmail();
    return () => {
      isActive = false;
    };
  }, [verifyUrl, refetchSession, attempt]);

  const handleRetry = async () => {
    if (!verifyUrl) return;
    setAttempt((prev) => prev + 1);
  };

  const renderIcon = () => {
    if (status === "loading")
      return <Loader2 className="h-12 w-12 text-primary animate-spin" />;
    if (status === "success")
      return <CheckCircle2 className="h-12 w-12 text-emerald-500" />;
    if (status === "error")
      return <XCircle className="h-12 w-12 text-destructive" />;
    return null;
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navigation />
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-lg p-8 border border-border text-center space-y-6">
          <div className="flex flex-col items-center gap-4">
            {renderIcon()}
            <div>
              <h1 className="text-3xl font-bold">Verify your email</h1>
              <p className="text-muted-foreground mt-2">{message}</p>
            </div>
          </div>

          {status === "success" ? (
            <div className="flex flex-col gap-3">
              <Button asChild className="w-full">
                <Link href="/">Go to dashboard</Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/login">Go to login</Link>
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <Button
                className="w-full"
                disabled={status === "loading"}
                onClick={handleRetry}
              >
                {status === "loading" ? "Verifying..." : "Retry verification"}
              </Button>
              <Button variant="ghost" asChild className="w-full">
                <Link href="/login">Back to login</Link>
              </Button>
            </div>
          )}
        </Card>
      </main>
      <Footer />
    </div>
  );
}
