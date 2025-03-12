// eslint-disable-next-line no-restricted-imports
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
// eslint-disable-next-line no-restricted-imports
import { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { 
  GetConsoleLogsParams, 
  GetConsoleLogsResponse, 
  GetConsoleLogsErrorResponse 
} from "@summer-mcp/core";
import { z } from "zod";

// Aggregator server port
const AGGREGATOR_PORT = process.env.AGGREGATOR_PORT || 3001;

// Define the parameter schema
const getConsoleErrorsAndWarningsParams = {
  tabId: z.string().describe("The ID of the tab to get console errors and warnings from"),
  limit: z.number().optional().describe("Maximum number of errors and warnings to return")
};

/**
 * Register the getConsoleErrorsAndWarnings tool with the MCP server
 * @param server The MCP server instance
 */
export function registerGetConsoleErrorsAndWarningsTool(server: McpServer) {
  const handler: ToolCallback<typeof getConsoleErrorsAndWarningsParams> = async ({ tabId, limit }) => {
    try {
      // Build request parameters
      const requestParams: GetConsoleLogsParams = {
        tabId: String(tabId)
      };
      
      // Add optional limit parameter
      if (limit !== undefined) {
        requestParams.limit = Number(limit);
      }
      
      // Build query parameters
      const queryParams = [];
      queryParams.push(`tabId=${encodeURIComponent(requestParams.tabId)}`);
      
      if (requestParams.limit !== undefined) {
        queryParams.push(`limit=${encodeURIComponent(String(requestParams.limit))}`);
      }
      
      // Construct URL with query parameters - using the console-errors endpoint
      const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
      const url = `http://127.0.0.1:${AGGREGATOR_PORT}/console-errors${queryString}`;
      
      // Make the request
      const response = await fetch(url);
      
      // Handle error response from server
      if (!response.ok) {
        const errorData = await response.json() as GetConsoleLogsErrorResponse;
        return {
          content: [
            {
              type: "text",
              text: `Failed to get console errors and warnings: ${errorData.error || "Unknown error"}. ${errorData.message || ""}`,
            },
          ],
        };
      }
      
      // Parse the response
      const data = await response.json() as GetConsoleLogsResponse;
      
      // Format the response for display
      const formattedResponse = {
        count: data.count,
        tabId: data.tabId,
        timestamp: data.timestamp,
        logs: data.logs.map(log => ({
          level: log.level,
          type: log.type,
          message: log.message,
          timestamp: log.timestamp,
          severity: log.level || log.type || 'unknown',
          details: log.message
        }))
      };
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(formattedResponse, null, 2),
          },
        ],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        content: [
          {
            type: "text",
            text: `Error retrieving console errors and warnings: ${errorMessage}`,
          },
        ],
      };
    }
  };

  server.tool(
    "getConsoleErrorsAndWarnings",
    getConsoleErrorsAndWarningsParams,
    handler
  );
} 