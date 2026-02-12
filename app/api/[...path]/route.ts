import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const normalizeBaseUrl = (url: string) => url.replace(/\/+$/, "");
const API_BACKEND_BASE_URL = normalizeBaseUrl(
  process.env.BACKEND_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    process.env.NEXT_PUBLIC_BACKEND_URL ??
    "http://localhost:5000",
);

const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade",
  "host",
]);

const buildTargetUrl = (request: NextRequest, path: string[]) => {
  const targetPath = path.join("/");
  const target = new URL(`${API_BACKEND_BASE_URL}/api/${targetPath}`);
  target.search = request.nextUrl.search;
  return target;
};

const buildRequestHeaders = (request: NextRequest) => {
  const headers = new Headers(request.headers);

  HOP_BY_HOP_HEADERS.forEach((header) => headers.delete(header));
  headers.set("origin", request.nextUrl.origin);
  headers.set("x-forwarded-host", request.nextUrl.host);
  headers.set("x-forwarded-proto", request.nextUrl.protocol.replace(":", ""));

  return headers;
};

const copyResponseHeaders = (source: Headers) => {
  const headers = new Headers();
  source.forEach((value, key) => {
    if (HOP_BY_HOP_HEADERS.has(key.toLowerCase())) return;
    if (key.toLowerCase() === "set-cookie") return;
    headers.set(key, value);
  });

  return headers;
};

const forwardRequest = async (
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) => {
  const { path } = await context.params;
  const targetUrl = buildTargetUrl(request, path ?? []);
  const method = request.method.toUpperCase();
  const response = await fetch(targetUrl, {
    method,
    headers: buildRequestHeaders(request),
    body: method === "GET" || method === "HEAD" ? undefined : request.body,
    redirect: "manual",
  });

  const headers = copyResponseHeaders(response.headers);
  const getSetCookie = (
    response.headers as Headers & { getSetCookie?: () => string[] }
  ).getSetCookie;
  const cookies = typeof getSetCookie === "function" ? getSetCookie() : [];
  if (cookies.length > 0) {
    cookies.forEach((cookie) => headers.append("set-cookie", cookie));
  } else {
    const singleCookie = response.headers.get("set-cookie");
    if (singleCookie) {
      headers.append("set-cookie", singleCookie);
    }
  }

  return new NextResponse(response.body, {
    status: response.status,
    headers,
  });
};

export const GET = forwardRequest;
export const POST = forwardRequest;
export const PUT = forwardRequest;
export const PATCH = forwardRequest;
export const DELETE = forwardRequest;
export const OPTIONS = forwardRequest;
export const HEAD = forwardRequest;
