// eslint-disable-next-line no-restricted-imports
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

// Aggregator server port
const AGGREGATOR_PORT = process.env.AGGREGATOR_PORT || 3001;

export function registerGetNetworkSuccessLogsTool(server: McpServer) {
  server.tool(
    "getNetworkSuccessLogs",
    "Check our network SUCCESS logs",
    async () => {
      const response = await fetch(
        `http://127.0.0.1:${AGGREGATOR_PORT}/network-success`
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
    }
  );
} 