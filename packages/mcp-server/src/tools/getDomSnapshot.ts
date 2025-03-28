/**
 * getDomSnapshot.ts
 * Tool for getting DOM snapshot from a browser tab
 */
// eslint-disable-next-line no-restricted-imports
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
// eslint-disable-next-line no-restricted-imports
import { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { 
  GetDomSnapshotRequest, 
  GetDomSnapshotResponse, 
  GetDomSnapshotErrorResponse 
} from "@summer-mcp/core";

// Aggregator server port
const AGGREGATOR_PORT = process.env.AGGREGATOR_PORT || 3001;

// Define the parameter schema
const getDomSnapshotParams = {
  tabId: z.string().describe("The ID of the tab to get DOM snapshot from")
};

/**
 * Register the getDomSnapshot tool with the MCP server
 * @param server MCP server instance
 */
export function registerGetDomSnapshotTool(server: McpServer) {
  // Define the handler with proper typing
  const handler: ToolCallback<typeof getDomSnapshotParams> = async ({ tabId }) => {
    try {
      if (!tabId) {
        return {
          content: [
            {
              type: "text",
              text: "Please provide a tab ID to get DOM snapshot from.",
            },
          ],
        };
      }

      // Create the request body
      const requestBody: GetDomSnapshotRequest = {
        tabId
      };

      // Make request to aggregator server
      const response = await fetch(
        `http://127.0.0.1:${AGGREGATOR_PORT}/dom-snapshot`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(requestBody)
        }
      );

      // Log the response status and headers for debugging
      console.log(`DOM snapshot response status: ${response.status}`);
      console.log(
        `DOM snapshot response headers:`,
        Object.fromEntries(response.headers.entries())
      );

      // Try to parse the response as JSON
      let result: GetDomSnapshotResponse | GetDomSnapshotErrorResponse;
      try {
        result = await response.json();
        console.log("DOM snapshot response parsed successfully");
      } catch (parseError) {
        console.error("Error parsing DOM snapshot response:", parseError);
        
        // Try to get the response as text
        try {
          const text = await response.text();
          console.log("Raw response text length:", text.length);
          console.log("Raw response text preview:", text.substring(0, 100) + "...");
          
          return {
            content: [
              {
                type: "text",
                text: `Error parsing DOM snapshot response: ${parseError}. Response was ${text.length} bytes.`,
              },
            ],
          };
        } catch (textError) {
          console.error("Error getting response as text:", textError);
          return {
            content: [
              {
                type: "text",
                text: `Error parsing DOM snapshot response: ${parseError}. Could not get response as text: ${textError}`,
              },
            ],
          };
        }
      }

      if (response.ok && result.success) {
        const domResponse = result as GetDomSnapshotResponse;
        
        // Check if HTML is too large to return directly
        const htmlLength = domResponse.html.length;
        if (htmlLength > 1000000) { // 100KB limit for direct display
          return {
            content: [
              {
                type: "text",
                text: `DOM snapshot retrieved successfully. HTML is ${htmlLength} bytes (too large to display directly).`,
              },
              {
                type: "text",
                text: domResponse.html.substring(0, 5000) + "\n\n... [content truncated] ...\n\n" + domResponse.html.substring(htmlLength - 5000),
              },
            ],
          };
        }
        
        return {
          content: [
            {
              type: "text",
              text: `DOM snapshot retrieved successfully. HTML is ${htmlLength} bytes.`,
            },
            {
              type: "text",
              text: domResponse.html,
            },
          ],
        };
      } else {
        const errorResponse = result as GetDomSnapshotErrorResponse;
        return {
          content: [
            {
              type: "text",
              text: `Error getting DOM snapshot: ${errorResponse.error || "Unknown error"}`,
            },
          ],
        };
      }
    } catch (error) {
      console.error("Error getting DOM snapshot:", error);
      return {
        content: [
          {
            type: "text",
            text: `Error getting DOM snapshot: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  };

  server.tool(
    "getDomSnapshot",
    getDomSnapshotParams,
    handler
  );
} 