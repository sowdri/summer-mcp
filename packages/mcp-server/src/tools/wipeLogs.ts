import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

// Aggregator server port
const AGGREGATOR_PORT = process.env.AGGREGATOR_PORT || 3001;

export function registerWipeLogsTool(server: McpServer) {
  server.tool("wipeLogs", "Wipe all browser logs from memory", async () => {
    const response = await fetch(`http://127.0.0.1:${AGGREGATOR_PORT}/wipelogs`, {
      method: "POST",
    });
    const json = await response.json();
    return {
      content: [
        {
          type: "text",
          text: json.message,
        },
      ],
    };
  });
} 