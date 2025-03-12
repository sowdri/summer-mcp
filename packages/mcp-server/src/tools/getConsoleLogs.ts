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
const getConsoleLogsParams = {
  tabId: z.string().describe("The ID of the tab to get console logs from"),
  limit: z.number().optional().describe("Maximum number of logs to return")
};

/**
 * Register the getConsoleLogs tool with the MCP server
 * @param server The MCP server instance
 */
export function registerGetConsoleLogsTool(server: McpServer) {
  const handler: ToolCallback<typeof getConsoleLogsParams> = async ({ tabId, limit }) => {
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
      
      // Construct URL with query parameters
      const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
      const url = `http://127.0.0.1:${AGGREGATOR_PORT}/console-logs${queryString}`;
      
      // Make the request
      const response = await fetch(url);
      
      // Handle error response from server
      if (!response.ok) {
        const errorData = await response.json() as GetConsoleLogsErrorResponse;
        return {
          content: [
            {
              type: "text",
              text: `Failed to get console logs: ${errorData.error || "Unknown error"}. ${errorData.message || ""}`,
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
          timestamp: log.timestamp
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
            text: `Error retrieving console logs: ${errorMessage}`,
          },
        ],
      };
    }
  };

  server.tool(
    "getConsoleLogs",
    getConsoleLogsParams,
    handler
  );
} 