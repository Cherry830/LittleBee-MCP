import type { HttpMethod } from "./constants.js";

export interface ApiRequestOptions {
  method: HttpMethod;
  path: string;
  query?: Record<string, string | number | boolean | null | undefined>;
  body?: unknown;
  headers?: Record<string, string>;
}

export interface ApiSuccessResult {
  ok: true;
  status: number;
  data: unknown;
}

export interface ApiErrorResult {
  ok: false;
  status?: number;
  message: string;
  details?: unknown;
}

export type ApiResult = ApiSuccessResult | ApiErrorResult;
