import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

// Aggregator server port
const AGGREGATOR_PORT = process.env.AGGREGATOR_PORT || 3001;

export function registerGetNetworkErrorLogsTool(server: McpServer) {
  server.tool("getNetworkErrorLogs", "Check our network ERROR logs", async () => {
    const response = await fetch(
      `http://127.0.0.1:${AGGREGATOR_PORT}/network-errors`
    );
    const json = await response.json();
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(json, null, 2),
        },
      ],
    };
  });
} 