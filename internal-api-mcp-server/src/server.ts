import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerRestTools } from "./tools/rest-tools.js";

export function createMcpServer(): McpServer {
  const server = new McpServer({
    name: "internal-api-mcp-server",
    version: "1.0.0",
  });
  registerRestTools(server);
  return server;
}
