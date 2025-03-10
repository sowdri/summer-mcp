import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

// Aggregator server port
const AGGREGATOR_PORT = process.env.AGGREGATOR_PORT || 3001;

export function registerGetConsoleLogsTool(server: McpServer) {
  server.tool("getConsoleLogs", "Check our browser logs", async () => {
    try {
      // First, get the list of browser tabs to find the active one
      const tabsResponse = await fetch(
        `http://127.0.0.1:${AGGREGATOR_PORT}/browser-tabs`
      );

      if (!tabsResponse.ok) {
        return {
          content: [
            {
              type: "text",
              text: "Failed to get browser tabs. Make sure the browser extension is connected.",
            },
          ],
        };
      }

      const tabsData = await tabsResponse.json();

      // Find the active tab
      const activeTab = tabsData.tabs.find(
        (tab: { active: boolean }) => tab.active
      );

      if (!activeTab) {
        return {
          content: [
            {
              type: "text",
              text: "No active browser tab found. Please open a tab in the browser.",
            },
          ],
        };
      }

      // Trigger console log collection for the active tab
      const triggerResponse = await fetch(
        `http://127.0.0.1:${AGGREGATOR_PORT}/trigger-console-logs?tabId=${activeTab.id}`,
        {
          method: "POST",
        }
      );

      if (!triggerResponse.ok) {
        const errorData = await triggerResponse.json();
        return {
          content: [
            {
              type: "text",
              text: `Failed to trigger console log collection: ${
                errorData.error || "Unknown error"
              }`,
            },
          ],
        };
      }

      // Wait a moment for logs to be collected
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Now get the console logs for the active tab
      const logsResponse = await fetch(
        `http://127.0.0.1:${AGGREGATOR_PORT}/console-logs?tabId=${activeTab.id}`
      );

      if (!logsResponse.ok) {
        return {
          content: [
            {
              type: "text",
              text: "Failed to get console logs.",
            },
          ],
        };
      }

      const logs = await logsResponse.json();

      return {
        content: [
          {
            type: "text",
            text: `Console logs from tab "${activeTab.title}" (${
              activeTab.url
            }):\n\n${JSON.stringify(logs, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        content: [
          {
            type: "text",
            text: `Error retrieving console logs: ${errorMessage}`,
          },
        ],
      };
    }
  });
} 