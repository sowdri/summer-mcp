// eslint-disable-next-line no-restricted-imports
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

// Aggregator server port
const AGGREGATOR_PORT = process.env.AGGREGATOR_PORT || 3001;

export function registerActivateTabTool(server: McpServer) {
  server.tool(
    "activateTab",
    { tabId: z.string().describe("The ID of the tab to activate") },
    async ({ tabId }) => {
      try {
        if (!tabId) {
          return {
            content: [
              {
                type: "text",
                text: "Please provide a tab ID to activate.",
              },
            ],
          };
        }
        
        // Send request to activate the tab
        const response = await fetch(
          `http://127.0.0.1:${AGGREGATOR_PORT}/activate-tab?tabId=${tabId}`,
          {
            method: "POST",
          }
        );
        
        if (!response.ok) {
          const errorData = await response.json();
          return {
            content: [
              {
                type: "text",
                text: `Failed to activate tab: ${errorData.error || "Unknown error"}`,
              },
            ],
          };
        }
        
        return {
          content: [
            {
              type: "text",
              text: `Successfully activated tab ${tabId}.`,
            },
          ],
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: "text",
              text: `Error activating browser tab: ${errorMessage}`,
            },
          ],
        };
      }
    }
  );
} 