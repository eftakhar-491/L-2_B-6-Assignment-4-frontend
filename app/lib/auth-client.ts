"use client";

import { createAuthClient } from "better-auth/react";

const normalizeBaseUrl = (url: string) => url.replace(/\/+$/, "");

const baseURL = normalizeBaseUrl(
  process.env.NEXT_PUBLIC_API_URL ??
    process.env.NEXT_PUBLIC_BACKEND_URL ??
    "http://localhost:5000",
);

export const backendBaseURL = baseURL;
export const authApiBaseURL = `${backendBaseURL}/api/auth`;
export const authApiUrl = (path: string) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${authApiBaseURL}${normalizedPath}`;
};

export const authClient = createAuthClient({
  baseURL,
  basePath: "/api/auth",
  fetchOptions: {
    credentials: "include",
  },
  sessionOptions: {
    refetchOnWindowFocus: true,
    refetchInterval: 0,
  },
});
