/**
 * Handler for getting active browser tab
 */
import { Request, Response } from "express";
import {
  pendingTabRequests,
  registerActiveTabRequest,
} from "../../services/browserTabs.service";
import { clients, sendCommandToExtension } from "../../websocket/messageSender";
import { 
  ServerCommandType, 
  GetActiveBrowserTabCommand
} from "@summer-mcp/core";

/**
 * Get active browser tab
 */
export function getActiveBrowserTab(req: Request, res: Response): Response | void {
  // Check if there are any connected WebSocket clients
  if (clients.size === 0) {
    // No browser extensions connected, return an error
    return res.status(503).json({
      error: "No browser extension connected",
      message: "Please ensure the browser extension is installed and connected",
    });
  }

  // Register the request with the browser tabs service
  const requestId = registerActiveTabRequest(res);

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
    const pendingRequest = pendingTabRequests.get(requestId);
    if (pendingRequest) {
      clearTimeout(pendingRequest.timeout);
      pendingTabRequests.delete(requestId);
    }

    return res.status(503).json({
      error: "Failed to send command to browser extension",
      message: "The browser extension is connected but not in a ready state",
    });
  }

  // The response will be sent by the browser tabs service when the data is received
} 