/**
 * Network Errors Handler
 * Retrieves network error requests from the browser data store
 */
import { Request, Response } from "express";
import { browserDataProvider } from "../../data/browserData";
import { 
  GetNetworkRequestsParams, 
  GetNetworkRequestsResponse, 
  GetNetworkRequestsErrorResponse 
} from "@summer-mcp/core";

/**
 * Get network error requests for a specific browser tab
 * @param req Express request
 * @param res Express response
 */
export async function getNetworkErrors(
  req: Request<{}, GetNetworkRequestsResponse | GetNetworkRequestsErrorResponse, {}, Partial<GetNetworkRequestsParams>>,
  res: Response
): Promise<Response | void> {
  try {
    // Parse query parameters
    const params: GetNetworkRequestsParams = {
      tabId: req.query.tabId as string,
      limit: req.query.limit ? parseInt(String(req.query.limit), 10) : undefined
    };
    
    // Validate required parameters
    if (!params.tabId) {
      const errorResponse: GetNetworkRequestsErrorResponse = {
        error: "Missing tabId parameter",
        message: "A tabId must be specified to retrieve network error requests",
        success: false
      };
      return res.status(400).json(errorResponse);
    }
    
    // Get the tab data
    const tabData = browserDataProvider.getTabData(params.tabId);
    
    if (!tabData || !tabData.networkRequests) {
      // No network requests for this tab
      const emptyResponse: GetNetworkRequestsResponse = {
        count: 0,
        tabId: params.tabId,
        requests: [],
        success: true,
        timestamp: Date.now()
      };
      return res.json(emptyResponse);
    }
    
    // Get all network requests for the tab
    const allRequests = [...tabData.networkRequests];
    
    // Filter for error requests only
    // Error requests are those with status >= 400 or isError flag
    const errorRequests = allRequests.filter(req => 
      (req.status && req.status >= 400) || req.isError === true
    );
    
    // Sort by timestamp (newest first)
    errorRequests.sort((a, b) => {
      const timestampA = a.timestamp || 0;
      const timestampB = b.timestamp || 0;
      return timestampB - timestampA;
    });
    
    // Apply limit if specified
    const limitedRequests = params.limit ? errorRequests.slice(0, params.limit) : errorRequests;
    
    // Send response
    const response: GetNetworkRequestsResponse = {
      count: limitedRequests.length,
      tabId: params.tabId,
      requests: limitedRequests,
      success: true,
      timestamp: Date.now()
    };
    return res.json(response);
  } catch (error) {
    console.error("Error retrieving network error requests:", error);
    const errorResponse: GetNetworkRequestsErrorResponse = {
      error: "Failed to retrieve network error requests",
      message: error instanceof Error ? error.message : String(error),
      success: false
    };
    return res.status(500).json(errorResponse);
  }
} 