// eslint-disable-next-line no-restricted-imports
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

// Aggregator server port
const AGGREGATOR_PORT = process.env.AGGREGATOR_PORT || 3001;

export function registerGetActiveBrowserTabTool(server: McpServer) {
  server.tool(
    "getActiveBrowserTab",
    "Get the currently active browser tab",
    async () => {
      try {
        const response = await fetch(
          `http://127.0.0.1:${AGGREGATOR_PORT}/active-tab`
        );
        
        if (!response.ok) {
          return {
            content: [
              {
                type: "text",
                text: "Failed to get active browser tab. Make sure the browser extension is connected.",
              },
            ],
          };
        }
        
        const activeTab = await response.json();
        
        return {
          content: [
            {
              type: "text",
              text: `Active browser tab:\n\n${JSON.stringify(activeTab, null, 2)}`,
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
    }
  );
} 