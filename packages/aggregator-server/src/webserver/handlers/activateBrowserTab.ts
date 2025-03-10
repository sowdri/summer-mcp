/**
 * Handler for activating a browser tab
 */
import { Request, Response } from "express";
import { clients, sendCommandToExtension } from "../../websocket/messageSender";
import { 
  ServerCommandType, 
  ActivateBrowserTabCommand,
  ActivateTabRequest,
  ActivateTabResponse,
  ActivateTabErrorResponse
} from "@summer-mcp/core";

/**
 * Activate a browser tab
 * 
 * Implements the POST /activate-tab endpoint
 */
export function activateBrowserTab(
  req: Request<{}, ActivateTabResponse | ActivateTabErrorResponse, ActivateTabRequest>, 
  res: Response
): Response | void {
  // Check if there are any connected WebSocket clients
  if (clients.size === 0) {
    // No browser extensions connected, return an error
    const errorResponse: ActivateTabErrorResponse = {
      error: "No browser extension connected",
      message: "Please ensure the browser extension is installed and connected",
    };
    return res.status(503).json(errorResponse);
  }

  // Get tabId from request body
  const { tabId } = req.body;

  if (!tabId) {
    const errorResponse: ActivateTabErrorResponse = {
      error: "Missing tabId parameter",
      message: "Please provide a tab ID to activate",
    };
    return res.status(400).json(errorResponse);
  }

  // Create the command object
  const command: ActivateBrowserTabCommand = {
    type: 'command',
    command: ServerCommandType.ACTIVATE_BROWSER_TAB,
    params: {
      tabId: String(tabId)
    }
  };

  // Send command to browser extension
  const commandSent = sendCommandToExtension(command);

  if (!commandSent) {
    const errorResponse: ActivateTabErrorResponse = {
      error: "Failed to send command to browser extension",
      message: "The browser extension is connected but not in a ready state",
    };
    return res.status(503).json(errorResponse);
  }

  // Return success response
  const response: ActivateTabResponse = {
    success: true,
    tabId: tabId,
    timestamp: Date.now()
  };
  res.json(response);
} 