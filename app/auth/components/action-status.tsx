"use client";

import clsx from "clsx";

export type ActionStatus = {
  state: "idle" | "loading" | "success" | "error";
  message: string;
};

export const initialStatus: ActionStatus = { state: "idle", message: "" };

export const StatusNote = ({ status }: { status: ActionStatus }) => {
  if (!status.message) return null;
  const tone =
    status.state === "error"
      ? "text-destructive"
      : status.state === "success"
        ? "text-emerald-400"
        : "text-muted-foreground";
  return <p className={clsx("text-sm", tone)}>{status.message}</p>;
};

export const buildClientOrigin = () => {
  if (typeof window === "undefined") return "";
  return window.location.origin;
};
