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
      
      return {
        content: [
          {
            type: "text",
            text: `Active browser tab:\n\nID: ${activeTab.id}\nTitle: ${activeTab.title || 'No title'}\nURL: ${activeTab.url || 'No URL'}\nWindow ID: ${activeTab.windowId}\nIndex: ${activeTab.index}`,
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