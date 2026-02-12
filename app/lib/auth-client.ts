"use client";

import { createAuthClient } from "better-auth/react";

const normalizeBaseUrl = (url: string) => url.replace(/\/+$/, "");

const USE_API_PROXY = process.env.NEXT_PUBLIC_USE_API_PROXY !== "false";
const CONFIGURED_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  process.env.NEXT_PUBLIC_BACKEND_URL ??
  "http://localhost:5000";

const baseURL = USE_API_PROXY ? "" : normalizeBaseUrl(CONFIGURED_BASE_URL);

export const backendBaseURL = baseURL;
export const authApiBaseURL = backendBaseURL
  ? `${backendBaseURL}/api/auth`
  : "/api/auth";
export const authApiUrl = (path: string) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${authApiBaseURL}${normalizedPath}`;
};

export const authClient = createAuthClient({
  baseURL: baseURL || undefined,
  basePath: "/api/auth",
  fetchOptions: {
    credentials: "include",
  },
  sessionOptions: {
    refetchOnWindowFocus: true,
    refetchInterval: 0,
  },
});
