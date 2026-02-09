export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(status: number, message: string, payload?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

const normalizeBaseUrl = (url: string) => url.replace(/\/+$/, "");

const RAW_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  process.env.NEXT_PUBLIC_BACKEND_URL ??
  "http://localhost:5000";

export const API_BASE_URL = normalizeBaseUrl(RAW_BASE_URL);

type BodyInitValue = BodyInit | object;

export interface ApiRequestOptions extends Omit<RequestInit, "body"> {
  body?: BodyInitValue;
  skipAuth?: boolean;
  parse?: "json" | "text";
}

const resolveUrl = (path: string) => {
  if (path.startsWith("http")) return path;
  return `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
};

const isJsonObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isBodyInitValue = (value: unknown): value is BodyInit =>
  value instanceof FormData ||
  value instanceof URLSearchParams ||
  value instanceof Blob ||
  value instanceof ArrayBuffer ||
  ArrayBuffer.isView(value) ||
  typeof value === "string";

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { body, headers, skipAuth, parse = "json", ...rest } = options;
  const isJSONPayload =
    body !== undefined &&
    !(body instanceof FormData) &&
    typeof body !== "string";

  const response = await fetch(resolveUrl(path), {
    method: rest.method ?? "GET",
    credentials: skipAuth ? "omit" : "include",
    cache: rest.cache ?? "no-store",
    headers: {
      ...(isJSONPayload ? { "Content-Type": "application/json" } : {}),
      ...(parse === "json" ? { Accept: "application/json" } : {}),
      ...(headers ?? {}),
    },
    body:
      body === undefined
        ? undefined
        : isBodyInitValue(body)
          ? body
          : JSON.stringify(body),
    ...rest,
  });

  const contentType = response.headers.get("content-type") ?? "";
  let payload: unknown = null;

  try {
    if (parse === "json" || contentType.includes("application/json")) {
      payload = await response.json();
    } else {
      payload = await response.text();
    }
  } catch (error) {
    payload = null;
  }

  if (!response.ok) {
    const message =
      (isJsonObject(payload) && typeof payload.message === "string"
        ? payload.message
        : typeof payload === "string" && payload
          ? payload
          : "Request failed") ?? "Request failed";
    throw new ApiError(response.status, message, payload);
  }

  return payload as T;
}

type Envelope<T> = T | { data: T } | { result: T };

type ListEnvelope<T> = T[] | { data: T[] } | { items: T[] };

export const unwrap = <T>(payload: Envelope<T>): T => {
  if (isJsonObject(payload)) {
    if ("data" in payload && payload.data !== undefined) {
      return payload.data as T;
    }
    if ("result" in payload && payload.result !== undefined) {
      return payload.result as T;
    }
  }
  return payload as T;
};

export const unwrapList = <T>(payload: ListEnvelope<T>): T[] => {
  if (Array.isArray(payload)) {
    return payload as T[];
  }
  if (isJsonObject(payload)) {
    if ("data" in payload && Array.isArray(payload.data)) {
      return payload.data as T[];
    }
    if ("items" in payload && Array.isArray(payload.items)) {
      return payload.items as T[];
    }
  }
  return [];
};
