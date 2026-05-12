import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { sanitizeApiErrorMessage } from "@/lib/error";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
const DEFAULT_429_BACKOFF_MS = 1000;
const MAX_429_RETRY_AFTER_MS = 30000;
const MAX_429_RETRIES = 3;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function parseRetryAfterMs(value: string | null): number | null {
  if (!value) return null;

  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds >= 0) {
    return seconds * 1000;
  }

  const retryAt = Date.parse(value);
  if (Number.isNaN(retryAt)) return null;

  return Math.max(retryAt - Date.now(), 0);
}

function getRetryAfterMs(res: Response, backoffMs: number): number {
  const parsed = parseRetryAfterMs(res.headers.get("Retry-After"));
  return Math.min(parsed ?? backoffMs, MAX_429_RETRY_AFTER_MS);
}

function isSafeRetryMethod(method?: string): boolean {
  const normalized = (method ?? "GET").toUpperCase();
  return normalized === "GET" || normalized === "HEAD" || normalized === "OPTIONS";
}

async function throwIfResNotOk(res: Response, retryAfterMs?: number) {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    const error = new Error(
      sanitizeApiErrorMessage(res.status, err.message ?? err.error ?? res.statusText)
    ) as Error & { status?: number; retryAfterMs?: number };

    error.status = res.status;
    error.retryAfterMs = retryAfterMs;
    throw error;
  }
}

async function fetchWithRetryAfter(
  input: string,
  init: RequestInit = {},
  retryCount = 0,
  backoffMs = DEFAULT_429_BACKOFF_MS,
): Promise<Response> {
  const res = await fetch(input, init);

  if (res.status === 429) {
    const retryAfterMs = getRetryAfterMs(res, backoffMs);

    if (isSafeRetryMethod(init.method) && retryCount < MAX_429_RETRIES) {
      await sleep(retryAfterMs);
      return fetchWithRetryAfter(input, init, retryCount + 1, backoffMs * 2);
    }

    await throwIfResNotOk(res, retryAfterMs);
  }

  return res;
}

async function apiRequest(
  method: string,
  url: string,
  data?: unknown,
): Promise<Response> {
  const res = await fetchWithRetryAfter(`${BASE_URL}${url}`, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";

const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
    async ({ queryKey }) => {
      const res = await fetchWithRetryAfter(`${BASE_URL}${queryKey.join("/")}`, {
        credentials: "include",
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);
      return await res.json();
    };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
