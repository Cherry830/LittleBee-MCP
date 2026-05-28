import { config } from "../config.js";
import type { ApiRequestOptions, ApiResult } from "../types.js";
import type { HttpMethod } from "../constants.js";

function buildUrl(path: string, query?: ApiRequestOptions["query"]): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${config.internalApi.baseUrl}${normalizedPath}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null) continue;
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

function buildHeaders(extra?: Record<string, string>): Headers {
  const headers = new Headers({
    Accept: "application/json",
    "Content-Type": "application/json",
  });
  if (config.internalApi.token) {
    const { authHeader, authScheme, token } = config.internalApi;
    headers.set(authHeader, `${authScheme} ${token}`.trim());
  }
  if (extra) {
    for (const [key, value] of Object.entries(extra)) {
      headers.set(key, value);
    }
  }
  return headers;
}

function safeParseJson(text: string): unknown {
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

export function formatApiError(status: number | undefined, body: unknown): string {
  if (status === 404) return "Error: Resource not found. Check the path and ID.";
  if (status === 403) return "Error: Permission denied for this resource.";
  if (status === 401) return "Error: Unauthorized. Verify INTERNAL_API_TOKEN and auth settings.";
  if (status === 429) return "Error: Rate limit exceeded. Retry after a short delay.";
  if (status) return `Error: API request failed with HTTP ${status}. Body: ${JSON.stringify(body)}`;
  return `Error: API request failed. ${typeof body === "string" ? body : JSON.stringify(body)}`;
}

export async function callInternalApi(options: ApiRequestOptions): Promise<ApiResult> {
  const url = buildUrl(options.path, options.query);
  const headers = buildHeaders(options.headers);
  const init: RequestInit = {
    method: options.method,
    headers,
    signal: AbortSignal.timeout(config.internalApi.timeoutMs),
  };
  if (options.body !== undefined && options.method !== "GET") {
    init.body = JSON.stringify(options.body);
  }
  try {
    const response = await fetch(url, init);
    const text = await response.text();
    const data = safeParseJson(text);
    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        message: formatApiError(response.status, data),
        details: data,
      };
    }
    return { ok: true, status: response.status, data };
  } catch (error) {
    const message =
      error instanceof Error && error.name === "TimeoutError"
        ? "Error: Request timed out. Increase INTERNAL_API_TIMEOUT_MS or simplify the query."
        : `Error: Network failure — ${error instanceof Error ? error.message : String(error)}`;
    return { ok: false, message, details: error };
  }
}

export function isAllowedMethod(method: string): method is HttpMethod {
  return ["GET", "POST", "PUT", "PATCH", "DELETE"].includes(method);
}
