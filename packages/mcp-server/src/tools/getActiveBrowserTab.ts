// eslint-disable-next-line no-restricted-imports
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { GetActiveTabResponse, GetActiveTabErrorResponse } from "@summer-mcp/core";
// eslint-disable-next-line no-restricted-imports
import { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";

// Aggregator server port
const AGGREGATOR_PORT = process.env.AGGREGATOR_PORT || 3001;

export function registerGetActiveBrowserTabTool(server: McpServer) {
  const handler: ToolCallback = async () => {
    try {
      const response = await fetch(
        `http://127.0.0.1:${AGGREGATOR_PORT}/active-tab`
      );
      
      if (!response.ok) {
        const errorData = await response.json() as GetActiveTabErrorResponse;
        return {
          content: [
            {
              type: "text",
              text: `Failed to get active browser tab: ${errorData.error || "Unknown error"}. ${errorData.message || ""}`,
            },
          ],
        };
      }
      
      const activeTab = await response.json() as GetActiveTabResponse;
      
      // Return the JSON response as a string
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(activeTab, null, 2),
          },
        ],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        content: [
          {
            type: "text",
            text: `Error retrieving active browser tab: ${errorMessage}`,
          },
        ],
      };
    }
  };

  server.tool(
    "getActiveBrowserTab",
    "Get the currently active browser tab",
    handler
  );
} 