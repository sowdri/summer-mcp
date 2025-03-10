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
  ListBrowserTabsCommand
} from "@summer-mcp/core";

/**
 * Get browser tabs
 */
export function getBrowserTabs(req: Request, res: Response): Response | void {
  // Check if there are any connected WebSocket clients
  if (clients.size === 0) {
    // No browser extensions connected, return an error
    return res.status(503).json({
      error: "No browser extension connected",
      message: "Please ensure the browser extension is installed and connected",
    });
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

    return res.status(503).json({
      error: "Failed to send command to browser extension",
      message: "The browser extension is connected but not in a ready state",
    });
  }

  // The response will be sent by the browser tabs service when the data is received
} 