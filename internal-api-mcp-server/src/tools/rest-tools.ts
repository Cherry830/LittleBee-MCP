import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { CHARACTER_LIMIT } from "../constants.js";
import { callInternalApi, isAllowedMethod } from "../services/api-client.js";

const ResponseFormat = z.enum(["json", "markdown"]);

const queryRecordSchema = z
  .record(z.union([z.string(), z.number(), z.boolean(), z.null()]))
  .optional()
  .describe('Query string parameters, e.g. { "page": 1, "status": "active" }');

function truncatePayload(data: unknown): { text: string; truncated: boolean } {
  let text = JSON.stringify(data, null, 2);
  if (text.length <= CHARACTER_LIMIT) return { text, truncated: false };
  text = JSON.stringify(
    {
      truncated: true,
      message: `Response exceeded ${CHARACTER_LIMIT} characters.`,
      preview: text.slice(0, CHARACTER_LIMIT),
    },
    null,
    2,
  );
  return { text, truncated: true };
}

function toStructuredContent(data: unknown): Record<string, unknown> {
  if (data !== null && typeof data === "object" && !Array.isArray(data)) {
    return data as Record<string, unknown>;
  }
  return { value: data };
}

function toolResult(data: unknown, format: z.infer<typeof ResponseFormat>) {
  const { text, truncated } = truncatePayload(data);
  const structuredContent = toStructuredContent(data);
  if (format === "markdown") {
    const header = truncated ? "## API response (truncated)\n\n" : "## API response\n\n";
    return {
      content: [{ type: "text" as const, text: `${header}\`\`\`json\n${text}\n\`\`\`` }],
      structuredContent,
    };
  }
  return { content: [{ type: "text" as const, text }], structuredContent };
}

const getInputSchema = z
  .object({
    path: z.string().min(1).describe("API path, e.g. '/v1/orders'"),
    query: queryRecordSchema,
    response_format: ResponseFormat.default("json"),
  })
  .strict();

const postInputSchema = z
  .object({
    path: z.string().min(1),
    body: z.record(z.unknown()).optional(),
    query: queryRecordSchema,
    response_format: ResponseFormat.default("json"),
  })
  .strict();

const requestInputSchema = z
  .object({
    method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]),
    path: z.string().min(1),
    query: queryRecordSchema,
    body: z.record(z.unknown()).optional(),
    response_format: ResponseFormat.default("json"),
  })
  .strict();

const healthInputSchema = z
  .object({
    path: z.string().default("/health"),
    response_format: ResponseFormat.default("json"),
  })
  .strict();

export function registerRestTools(server: McpServer): void {
  server.registerTool(
    "internal_api_health",
    {
      title: "Internal API Health Check",
      description:
        "GET health endpoint (default /health). Call first to verify connectivity.",
      inputSchema: healthInputSchema.shape,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params) => {
      const parsed = healthInputSchema.parse(params);
      const result = await callInternalApi({ method: "GET", path: parsed.path });
      if (!result.ok) return { content: [{ type: "text", text: result.message }] };
      return toolResult(
        { status: result.status, path: parsed.path, data: result.data },
        parsed.response_format,
      );
    },
  );

  server.registerTool(
    "internal_api_get",
    {
      title: "Internal API GET",
      description: "GET on internal REST API. Example: path='/v1/users', query={page:1}",
      inputSchema: getInputSchema.shape,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params) => {
      const parsed = getInputSchema.parse(params);
      const result = await callInternalApi({
        method: "GET",
        path: parsed.path,
        query: parsed.query,
      });
      if (!result.ok) return { content: [{ type: "text", text: result.message }] };
      return toolResult({ status: result.status, data: result.data }, parsed.response_format);
    },
  );

  server.registerTool(
    "internal_api_post",
    {
      title: "Internal API POST",
      description: "POST with JSON body. Example: path='/v1/orders'",
      inputSchema: postInputSchema.shape,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async (params) => {
      const parsed = postInputSchema.parse(params);
      const result = await callInternalApi({
        method: "POST",
        path: parsed.path,
        query: parsed.query,
        body: parsed.body,
      });
      if (!result.ok) return { content: [{ type: "text", text: result.message }] };
      return toolResult({ status: result.status, data: result.data }, parsed.response_format);
    },
  );

  server.registerTool(
    "internal_api_request",
    {
      title: "Internal API Request",
      description: "Generic HTTP call. Prefer internal_api_get/post when possible.",
      inputSchema: requestInputSchema.shape,
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async (params) => {
      const parsed = requestInputSchema.parse(params);
      if (!isAllowedMethod(parsed.method)) {
        return { content: [{ type: "text", text: `Error: Unsupported method ${parsed.method}` }] };
      }
      const result = await callInternalApi({
        method: parsed.method,
        path: parsed.path,
        query: parsed.query,
        body: parsed.body,
      });
      if (!result.ok) return { content: [{ type: "text", text: result.message }] };
      return toolResult(
        { status: result.status, method: parsed.method, data: result.data },
        parsed.response_format,
      );
    },
  );
}
