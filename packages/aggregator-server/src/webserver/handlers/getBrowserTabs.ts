/**
 * Handler for getting browser tabs
 */
import { Request, Response } from "express";
import {
  getBrowserTabsBridge,
  registerGetBrowserTabsRequest,
} from "../../bridges/GetBrowserTabsBridge";
import { clients, sendCommandToExtension } from "../../websocket/messageSender";
import { 
  ServerCommandType, 
  ListBrowserTabsCommand,
  GetBrowserTabsRequest,
  GetBrowserTabsResponse,
  GetBrowserTabsErrorResponse
} from "@summer-mcp/core";

/**
 * Get browser tabs
 * 
 * Implements the GET /browser-tabs endpoint
 */
export function getBrowserTabs(
  req: Request<{}, GetBrowserTabsResponse | GetBrowserTabsErrorResponse, GetBrowserTabsRequest>, 
  res: Response
): Response | void {
  // Check if there are any connected WebSocket clients
  if (clients.size === 0) {
    // No browser extensions connected, return an error
    const errorResponse: GetBrowserTabsErrorResponse = {
      error: "No browser extension connected",
      message: "Please ensure the browser extension is installed and connected",
    };
    return res.status(503).json(errorResponse);
  }

  // Register the request with the browser tabs service
  const requestId = registerGetBrowserTabsRequest(res);

  // Create the command object
  const command: ListBrowserTabsCommand = {
    type: 'command',
    command: ServerCommandType.LIST_BROWSER_TABS
  };

  // Send command to browser extension
  const commandSent = sendCommandToExtension(command);

  // If command wasn't sent successfully, clean up and return error
  if (!commandSent) {
    // Clean up the pending request
    const pendingRequest = getBrowserTabsBridge.pendingRequests.get(requestId);
    if (pendingRequest) {
      clearTimeout(pendingRequest.timeout);
      getBrowserTabsBridge.pendingRequests.delete(requestId);
    }

    const errorResponse: GetBrowserTabsErrorResponse = {
      error: "Failed to send command to browser extension",
      message: "The browser extension is connected but not in a ready state",
    };
    return res.status(503).json(errorResponse);
  }

  // The response will be sent by the browser tabs service when the data is received
} 