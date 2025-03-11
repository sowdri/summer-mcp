// eslint-disable-next-line no-restricted-imports
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
// eslint-disable-next-line no-restricted-imports
import { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";

// Aggregator server port
const AGGREGATOR_PORT = process.env.AGGREGATOR_PORT || 3001;

export function registerGetNetworkSuccessLogsTool(server: McpServer) {
  const handler: ToolCallback = async () => {
    try {
      const response = await fetch(
        `http://127.0.0.1:${AGGREGATOR_PORT}/network-success`
      );
      const json = await response.json();
      
      // Return the raw JSON response
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(json, null, 2),
          },
        ],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        content: [
          {
            type: "text",
            text: `Error retrieving network success logs: ${errorMessage}`,
          },
        ],
      };
    }
  };

  server.tool(
    "getNetworkSuccessLogs",
    "Check our network SUCCESS logs",
    handler
  );
} 