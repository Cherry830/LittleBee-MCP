import "dotenv/config";

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function optionalEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value || undefined;
}

function parsePort(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const port = Number.parseInt(value, 10);
  if (!Number.isFinite(port) || port < 1 || port > 65_535) {
    throw new Error(`Invalid PORT: ${value}`);
  }
  return port;
}

/** 支持 Render fromService host 或完整 URL */
function normalizeBaseUrl(raw: string): string {
  const trimmed = raw.replace(/\/$/, "");
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function parseTimeoutMs(value: string | undefined): number {
  if (!value) return 30_000;
  const ms = Number.parseInt(value, 10);
  if (!Number.isFinite(ms) || ms < 1_000) {
    throw new Error(`Invalid INTERNAL_API_TIMEOUT_MS: ${value}`);
  }
  return ms;
}

export const config = {
  internalApi: {
    baseUrl: normalizeBaseUrl(requireEnv("INTERNAL_API_BASE_URL")),
    token: optionalEnv("INTERNAL_API_TOKEN"),
    authHeader: optionalEnv("INTERNAL_API_AUTH_HEADER") ?? "Authorization",
    authScheme: optionalEnv("INTERNAL_API_AUTH_SCHEME") ?? "Bearer",
    timeoutMs: parseTimeoutMs(optionalEnv("INTERNAL_API_TIMEOUT_MS")),
  },
  mcp: {
    port: parsePort(optionalEnv("PORT"), 3100),
    path: optionalEnv("MCP_PATH") ?? "/mcp",
    accessToken: optionalEnv("MCP_ACCESS_TOKEN"),
  },
};
