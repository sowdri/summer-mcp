/**
 * getDomSnapshot handler
 * Handles requests to get DOM snapshot from a browser tab
 */
import { Request, Response } from "express";
import { sendMessageToExtension } from "../../websocket/messageSender";
import { 
  registerDomSnapshotRequest, 
  getDomSnapshotBridge 
} from "../../bridges/GetDomSnapshotBridge";
import { 
  ServerCommandType, 
  GetDomSnapshotCommand, 
  GetDomSnapshotRequest,
  GetDomSnapshotResponse,
  GetDomSnapshotErrorResponse
} from "@summer-mcp/core";

/**
 * Get DOM snapshot from a browser tab
 * @param req Express request
 * @param res Express response
 */
export async function getDomSnapshot(
  req: Request<{}, GetDomSnapshotResponse | GetDomSnapshotErrorResponse, GetDomSnapshotRequest>,
  res: Response
): Promise<Response | void> {
  console.log("📸 Getting DOM snapshot");
  try {
    // Get tab ID from request body or query
    const tabId = req.body.tabId || req.query.tabId;
    
    if (!tabId) {
      const errorResponse: GetDomSnapshotErrorResponse = {
        error: "Tab ID is required",
        success: false
      };
      return res.status(400).json(errorResponse);
    }

    // Register the request with the bridge
    const requestId = registerDomSnapshotRequest(res);

    // Create the command object
    const command: GetDomSnapshotCommand = {
      type: "command",
      command: ServerCommandType.GET_DOM_SNAPSHOT,
      params: {
        tabId: String(tabId)
      }
    };

    // Send command to browser extension
    const commandSent = sendMessageToExtension(command);

    // If command wasn't sent successfully, clean up and return error
    if (!commandSent) {
      // Clean up the pending request
      const pendingRequest = getDomSnapshotBridge().pendingRequests.get(requestId);
      if (pendingRequest) {
        clearTimeout(pendingRequest.timeout);
        getDomSnapshotBridge().pendingRequests.delete(requestId);
      }

      const errorResponse: GetDomSnapshotErrorResponse = {
        error: "Failed to send command to browser extension",
        message: "The browser extension is connected but not in a ready state",
        success: false
      };
      return res.status(503).json(errorResponse);
    }

    console.log(`Sent DOM snapshot request for tab ${tabId}`);
    // The response will be sent by the bridge when the data is received
  } catch (error) {
    console.error("Error in getDomSnapshot handler:", error);
    const errorResponse: GetDomSnapshotErrorResponse = {
      error: "Internal server error",
      message: error instanceof Error ? error.message : String(error),
      success: false
    };
    return res.status(500).json(errorResponse);
  }
} 