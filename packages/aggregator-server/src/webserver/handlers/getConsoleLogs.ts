/**
 * Console Logs Handler
 * Retrieves console logs from the browser data store
 */
import { Request, Response } from "express";
import { browserDataProvider } from "../../data/browserData";
import { 
  GetConsoleLogsParams, 
  GetConsoleLogsResponse, 
  GetConsoleLogsErrorResponse 
} from "@summer-mcp/core";

/**
 * Get console logs for a specific browser tab
 * @param req Express request
 * @param res Express response
 */
export async function getConsoleLogs(
  req: Request<{}, GetConsoleLogsResponse | GetConsoleLogsErrorResponse, {}, Partial<GetConsoleLogsParams>>,
  res: Response
): Promise<Response | void> {
  try {
    // Parse query parameters
    const params: GetConsoleLogsParams = {
      tabId: req.query.tabId as string,
      limit: req.query.limit ? parseInt(String(req.query.limit), 10) : undefined
    };
    
    // Validate required parameters
    if (!params.tabId) {
      const errorResponse: GetConsoleLogsErrorResponse = {
        error: "Missing tabId parameter",
        message: "A tabId must be specified to retrieve console logs",
        success: false
      };
      return res.status(400).json(errorResponse);
    }
    
    // Get the tab data
    const tabData = browserDataProvider.getTabData(params.tabId);
    
    if (!tabData || !tabData.consoleLogs) {
      // No console logs for this tab
      const emptyResponse: GetConsoleLogsResponse = {
        count: 0,
        tabId: params.tabId,
        logs: [],
        success: true,
        timestamp: Date.now()
      };
      return res.json(emptyResponse);
    }
    
    // Get all console logs for the tab
    const allLogs = [...tabData.consoleLogs];
    
    // Sort by timestamp (newest first)
    allLogs.sort((a, b) => {
      const timestampA = a.timestamp || 0;
      const timestampB = b.timestamp || 0;
      return timestampB - timestampA;
    });
    
    // Apply limit if specified
    const limitedLogs = params.limit ? allLogs.slice(0, params.limit) : allLogs;
    
    // Send response
    const response: GetConsoleLogsResponse = {
      count: limitedLogs.length,
      tabId: params.tabId,
      logs: limitedLogs,
      success: true,
      timestamp: Date.now()
    };
    return res.json(response);
  } catch (error) {
    console.error("Error retrieving console logs:", error);
    const errorResponse: GetConsoleLogsErrorResponse = {
      error: "Failed to retrieve console logs",
      message: error instanceof Error ? error.message : String(error),
      success: false
    };
    return res.status(500).json(errorResponse);
  }
} 