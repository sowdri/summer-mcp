// eslint-disable-next-line no-restricted-imports
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
// eslint-disable-next-line no-restricted-imports
import { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { GetNetworkRequestsParams } from "@summer-mcp/core";

// Aggregator server port
const AGGREGATOR_PORT = process.env.AGGREGATOR_PORT || 3001;

/**
 * Register the getNetworkRequests tool with the MCP server
 * @param server The MCP server instance
 */
export function registerGetNetworkRequestsTool(server: McpServer) {
  const handler: ToolCallback = async (params) => {
    try {
      // Validate and extract parameters
      if (!params || typeof params !== 'object' || !('tabId' in params) || !params.tabId) {
        throw new Error("tabId parameter is required");
      }
      
      // Build request parameters
      const requestParams: GetNetworkRequestsParams = {
        tabId: String(params.tabId)
      };
      
      // Add optional limit parameter
      if ('limit' in params && params.limit !== undefined) {
        requestParams.limit = Number(params.limit);
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
      
      // Parse the response
      const data = await response.json();
      
      // Check for error response
      if (!response.ok || !data.success) {
        throw new Error(data.message || data.error || `Server responded with status: ${response.status}`);
      }
      
      // Return the raw JSON response as text
      // This is the correct approach for MCP tools when returning JSON data
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data, null, 2),
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
    "Get network requests for a specific browser tab",
    handler
  );
} 