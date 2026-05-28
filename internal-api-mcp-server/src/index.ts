import express, { type Request, type Response, type NextFunction } from "express";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { config } from "./config.js";
import { createMcpServer } from "./server.js";

function assertMcpAuth(req: Request, res: Response, next: NextFunction): void {
  const expected = config.mcp.accessToken;
  if (!expected) {
    next();
    return;
  }
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
  if (!token || token !== expected) {
    res.status(401).json({ error: "Unauthorized MCP endpoint" });
    return;
  }
  next();
}

async function main(): Promise<void> {
  const mcpServer = createMcpServer();
  const app = express();

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", service: "internal-api-mcp-server" });
  });

  app.post(config.mcp.path, express.json(), assertMcpAuth, async (req, res) => {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    });
    res.on("close", () => {
      void transport.close();
    });
    await mcpServer.connect(transport);
    await transport.handleRequest(req, res, req.body);
  });

  app.listen(config.mcp.port, "0.0.0.0", () => {
    console.error(
      `MCP → http://localhost:${config.mcp.port}${config.mcp.path}`,
    );
    console.error(`Upstream → ${config.internalApi.baseUrl}`);
  });
}

main().catch((error) => {
  console.error("Failed to start:", error);
  process.exit(1);
});
