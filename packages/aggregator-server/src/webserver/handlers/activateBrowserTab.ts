/**
 * Handler for activating a browser tab
 */
import { Request, Response } from "express";
import { clients, sendCommandToExtension } from "../../websocket/messageSender";
import { 
  ServerCommandType, 
  ActivateBrowserTabCommand
} from "@summer-mcp/core";

/**
 * Activate a browser tab
 */
export function activateBrowserTab(req: Request, res: Response): Response | void {
  // Check if there are any connected WebSocket clients
  if (clients.size === 0) {
    // No browser extensions connected, return an error
    return res.status(503).json({
      error: "No browser extension connected",
      message: "Please ensure the browser extension is installed and connected",
    });
  }

  // Get tabId from request parameters or query
  const tabId = req.params.tabId || req.query.tabId;

  if (!tabId) {
    return res.status(400).json({
      error: "Missing tabId parameter",
      message: "Please provide a tab ID to activate",
    });
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
    return res.status(503).json({
      error: "Failed to send command to browser extension",
      message: "The browser extension is connected but not in a ready state",
    });
  }

  // Return success response
  res.json({
    message: "Tab activation requested",
    tabId: tabId,
  });
} 