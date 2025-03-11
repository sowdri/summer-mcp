// eslint-disable-next-line no-restricted-imports
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
// eslint-disable-next-line no-restricted-imports
import { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { 
  GetNetworkRequestsParams, 
  GetNetworkRequestsResponse, 
  GetNetworkRequestsErrorResponse 
} from "@summer-mcp/core";

// Aggregator server port
const AGGREGATOR_PORT = process.env.AGGREGATOR_PORT || 3001;

/**
 * Interface for the parameters passed to the getNetworkErrors tool
 */
interface GetNetworkErrorsToolParams {
  /**
   * ID of the tab to get network error requests from
   */
  tabId: string | number;
  
  /**
   * Maximum number of error requests to return
   */
  limit?: number;
}

/**
 * Register the getNetworkErrors tool with the MCP server
 * @param server The MCP server instance
 */
export function registerGetNetworkErrorsTool(server: McpServer) {
  const handler: ToolCallback = async (params: unknown) => {
    try {
      // Validate and extract parameters
      if (!params || typeof params !== 'object' || !('tabId' in params) || !params.tabId) {
        throw new Error("tabId parameter is required");
      }
      
      // Cast params to the expected type
      const toolParams = params as GetNetworkErrorsToolParams;
      
      // Build request parameters
      const requestParams: GetNetworkRequestsParams = {
        tabId: String(toolParams.tabId)
      };
      
      // Add optional limit parameter
      if ('limit' in toolParams && toolParams.limit !== undefined) {
        requestParams.limit = Number(toolParams.limit);
      }
      
      // Build query parameters
      const queryParams = [];
      queryParams.push(`tabId=${encodeURIComponent(requestParams.tabId)}`);
      
      if (requestParams.limit !== undefined) {
        queryParams.push(`limit=${encodeURIComponent(String(requestParams.limit))}`);
      }
      
      // Construct URL with query parameters - using the network-errors endpoint
      const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
      const url = `http://127.0.0.1:${AGGREGATOR_PORT}/network-errors${queryString}`;
      
      // Make the request
      const response = await fetch(url);
      
      // Handle error response from server
      if (!response.ok) {
        const errorData = await response.json() as GetNetworkRequestsErrorResponse;
        return {
          content: [
            {
              type: "text",
              text: `Failed to get network errors: ${errorData.error || "Unknown error"}. ${errorData.message || ""}`,
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
        errorRequests: data.requests.map(req => ({
          method: req.method,
          url: req.url,
          status: req.status,
          statusText: req.statusText,
          type: req.type,
          timestamp: req.timestamp,
          duration: req.duration,
          size: req.size,
          isError: req.isError,
          errorMessage: req.statusText || (req.isError ? "Network Error" : undefined)
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
            text: `Error retrieving network errors: ${errorMessage}`,
          },
        ],
      };
    }
  };

  server.tool(
    "getNetworkErrors",
    "Get network error requests for a specific browser tab",
    handler
  );
} 