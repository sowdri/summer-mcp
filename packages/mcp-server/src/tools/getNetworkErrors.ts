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
      
      // Add optional limit parameter - we'll apply our own limit after filtering
      // but we'll request more from the server to ensure we have enough errors
      if ('limit' in toolParams && toolParams.limit !== undefined) {
        // Request more items than the limit to ensure we have enough errors after filtering
        // Multiply by 5 as a heuristic (assuming roughly 20% of requests might be errors)
        requestParams.limit = Number(toolParams.limit) * 5;
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
              text: `Failed to get network errors: ${errorData.error || "Unknown error"}. ${errorData.message || ""}`,
            },
          ],
        };
      }
      
      // Parse the response
      const data = await response.json() as GetNetworkRequestsResponse;
      
      // Filter for error requests only
      // Error requests are those with status >= 400 or isError flag
      const errorRequests = data.requests.filter(req => 
        (req.status && req.status >= 400) || req.isError === true
      );
      
      // Apply the original limit after filtering
      const limitedErrorRequests = toolParams.limit 
        ? errorRequests.slice(0, Number(toolParams.limit)) 
        : errorRequests;
      
      // Format the response for display
      const formattedResponse = {
        count: limitedErrorRequests.length,
        tabId: data.tabId,
        timestamp: data.timestamp,
        errorRequests: limitedErrorRequests.map(req => ({
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