/**
 * Browser controller
 */
import { Request, Response } from "express";
import { browserData, clearAllLogs } from "../models/browserData.js";
import {
  pendingTabRequests,
  registerTabsRequest,
  registerActiveTabRequest,
} from "../services/browserTabs.service.js";
import { clients, sendCommandToExtension } from "../websocket/commands.js";
import { 
  ServerCommandType, 
  ListBrowserTabsCommand, 
  GetActiveBrowserTabCommand,
  ActivateBrowserTabCommand
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
  const requestId = registerTabsRequest(res);

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
