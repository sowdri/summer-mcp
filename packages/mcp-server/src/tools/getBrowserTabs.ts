import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

// Aggregator server port
const AGGREGATOR_PORT = process.env.AGGREGATOR_PORT || 3001;

export function registerGetBrowserTabsTool(server: McpServer) {
  server.tool(
    "getBrowserTabs",
    "Get the list of open browser tabs with their IDs",
    async () => {
      try {
        // First, get the list of browser tabs
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
        
        // Get the active tab
        const activeTabResponse = await fetch(
          `http://127.0.0.1:${AGGREGATOR_PORT}/active-tab`
        );
        
        let activeTab = null;
        if (activeTabResponse.ok) {
          activeTab = await activeTabResponse.json();
        }
        
        // Format the tabs in a more readable way
        const formattedTabs = tabsData.tabs.map((tab: { id: string | number; title: string; url: string; active: boolean }) => {
          return `ID: ${tab.id} - ${tab.title} (${tab.url})${tab.active ? ' [ACTIVE]' : ''}`;
        }).join('\n');
        
        return {
          content: [
            {
              type: "text",
              text: `Available browser tabs:\n\n${formattedTabs}\n\nTo activate a tab, use the activateTab tool with the tab ID.`,
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
    }
  );
} 