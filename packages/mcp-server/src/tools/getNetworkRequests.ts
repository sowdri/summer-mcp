// eslint-disable-next-line no-restricted-imports
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
// eslint-disable-next-line no-restricted-imports
import { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { 
  GetNetworkRequestsParams, 
  GetNetworkRequestsResponse, 
  GetNetworkRequestsErrorResponse 
} from "@summer-mcp/core";
import { z } from "zod";

// Aggregator server port
const AGGREGATOR_PORT = process.env.AGGREGATOR_PORT || 3001;

// Define the parameter schema
const getNetworkRequestsParams = {
  tabId: z.string().describe("The ID of the tab to get network requests from"),
  limit: z.number().optional().describe("Maximum number of requests to return")
};

/**
 * Register the getNetworkRequests tool with the MCP server
 * @param server The MCP server instance
 */
export function registerGetNetworkRequestsTool(server: McpServer) {
  const handler: ToolCallback<typeof getNetworkRequestsParams> = async ({ tabId, limit }) => {
    try {
      // Build request parameters
      const requestParams: GetNetworkRequestsParams = {
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
      const url = `http://127.0.0.1:${AGGREGATOR_PORT}/network-requests${queryString}`;
      
      // Make the request
      const response = await fetch(url);
      
      // Handle error response from server
      if (!response.ok) {
        const errorData = await response.json() as GetNetworkRequestsErrorResponse;
        return {
          content: [
            {
              type: "text",
              text: `Failed to get network requests: ${errorData.error || "Unknown error"}. ${errorData.message || ""}`,
            },
          ],
        };
      }
      
      // Parse the response
      const data = await response.json() as GetNetworkRequestsResponse;
      
      // Format the response for display
      const formattedResponse = {
        count: data.count,
        tabId: data.tabId,
        timestamp: data.timestamp,
        requests: data.requests.map(req => ({
          method: req.method,
          url: req.url,
          status: req.status,
          statusText: req.statusText,
          type: req.type,
          timestamp: req.timestamp,
          duration: req.duration,
          size: req.size,
          isError: req.isError
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
            text: `Error retrieving network requests: ${errorMessage}`,
          },
        ],
      };
    }
  };

  server.tool(
    "getNetworkRequests",
    getNetworkRequestsParams,
    handler
  );
} 