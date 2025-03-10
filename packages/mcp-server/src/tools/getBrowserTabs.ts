// eslint-disable-next-line no-restricted-imports
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { GetBrowserTabsResponse, GetBrowserTabsErrorResponse } from "@summer-mcp/core";
// eslint-disable-next-line no-restricted-imports
import { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";

// Aggregator server port
const AGGREGATOR_PORT = process.env.AGGREGATOR_PORT || 3001;

export function registerGetBrowserTabsTool(server: McpServer) {
  const handler: ToolCallback = async () => {
    try {
      // First, get the list of browser tabs
      const tabsResponse = await fetch(
        `http://127.0.0.1:${AGGREGATOR_PORT}/browser-tabs`
      );

      if (!tabsResponse.ok) {
        const errorData = await tabsResponse.json() as GetBrowserTabsErrorResponse;
        return {
          content: [
            {
              type: "text",
              text: `Failed to get browser tabs: ${errorData.error || "Unknown error"}. ${errorData.message || ""}`,
            },
          ],
        };
      }

      const data = await tabsResponse.json() as GetBrowserTabsResponse;
      const tabs = data.tabs;

      // Format the tabs for display
      const formattedTabs = tabs.map(
        (tab) =>
          `ID: ${tab.id}\nTitle: ${tab.title || "No title"}\nURL: ${tab.url || "No URL"}\nWindow ID: ${tab.windowId}\nIndex: ${tab.index}\n`
      );

      return {
        content: [
          {
            type: "text",
            text: `Browser tabs:\n\n${formattedTabs.join("\n")}`,
          },
        ],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        content: [
          {
            type: "text",
            text: `Error retrieving browser information: ${errorMessage}`,
          },
        ],
      };
    }
  };

  server.tool(
    "getBrowserTabs",
    "Get the list of open browser tabs with their IDs",
    handler
  );
} 