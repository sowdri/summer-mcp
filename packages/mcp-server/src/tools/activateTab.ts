// eslint-disable-next-line no-restricted-imports
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ActivateTabRequest, ActivateTabResponse, ActivateTabErrorResponse } from "@summer-mcp/core";
// eslint-disable-next-line no-restricted-imports
import { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";

// Aggregator server port
const AGGREGATOR_PORT = process.env.AGGREGATOR_PORT || 3001;

// Define the parameter schema
const activateTabParams = {
  tabId: z.string().describe("The ID of the tab to activate")
};

export function registerActivateTabTool(server: McpServer) {
  // Define the handler with proper typing
  const handler: ToolCallback<typeof activateTabParams> = async ({ tabId }) => {
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
      
      // Create the request body
      const requestBody: ActivateTabRequest = {
        tabId
      };
      
      // Send request to activate the tab
      const response = await fetch(
        `http://127.0.0.1:${AGGREGATOR_PORT}/activate-tab`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );
      
      // Handle response
      if (!response.ok) {
        const errorData = await response.json() as ActivateTabErrorResponse;
        return {
          content: [
            {
              type: "text",
              text: `Failed to activate tab: ${errorData.error || "Unknown error"}. ${errorData.message || ""}`,
            },
          ],
        };
      }
      
      const result = await response.json() as ActivateTabResponse;
      
      return {
        content: [
          {
            type: "text",
            text: `Successfully activated tab with ID: ${result.tabId}`,
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
  };

  server.tool(
    "activateTab",
    activateTabParams,
    handler
  );
} 