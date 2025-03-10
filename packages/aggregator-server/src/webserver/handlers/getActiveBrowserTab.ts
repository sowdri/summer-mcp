/**
 * Handler for getting active browser tab
 */
import { Request, Response } from "express";
import {
  getActiveTabBridge,
  registerGetActiveTabRequest,
} from "../../bridges/GetActiveTabBridge";
import { clients, sendCommandToExtension } from "../../websocket/messageSender";
import { 
  ServerCommandType, 
  GetActiveBrowserTabCommand,
  GetActiveTabRequest,
  GetActiveTabResponse,
  GetActiveTabErrorResponse
} from "@summer-mcp/core";

/**
 * Get active browser tab
 * 
 * Implements the GET /active-tab endpoint
 */
export function getActiveBrowserTab(
  req: Request<{}, GetActiveTabResponse | GetActiveTabErrorResponse, GetActiveTabRequest>, 
  res: Response
): Response | void {
  // Check if there are any connected WebSocket clients
  if (clients.size === 0) {
    // No browser extensions connected, return an error
    const errorResponse: GetActiveTabErrorResponse = {
      error: "No browser extension connected",
      message: "Please ensure the browser extension is installed and connected",
    };
    return res.status(503).json(errorResponse);
  }

  // Register the request with the browser tabs service
  const requestId = registerGetActiveTabRequest(res);

  // Create the command object
  const command: GetActiveBrowserTabCommand = {
    type: 'command',
    command: ServerCommandType.GET_ACTIVE_BROWSER_TAB
  };

  // Send command to browser extension
  const commandSent = sendCommandToExtension(command);

  // If command wasn't sent successfully, clean up and return error
  if (!commandSent) {
    // Clean up the pending request
    const pendingRequest = getActiveTabBridge.pendingRequests.get(requestId);
    if (pendingRequest) {
      clearTimeout(pendingRequest.timeout);
      getActiveTabBridge.pendingRequests.delete(requestId);
    }

    const errorResponse: GetActiveTabErrorResponse = {
      error: "Failed to send command to browser extension",
      message: "The browser extension is connected but not in a ready state",
    };
    return res.status(503).json(errorResponse);
  }

  // The response will be sent by the browser tabs service when the data is received
} 