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

  // Send command to browser extension
  const commandSent = sendCommandToExtension("listBrowserTabs");

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
}

/**
 * Wipe all logs
 */
export function wipeLogs(req: Request, res: Response): void {
  clearAllLogs();
  res.json({ message: "All logs have been cleared" });
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

  // Send command to browser extension
  const commandSent = sendCommandToExtension("getActiveBrowserTab");

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
}

/**
 * Set active browser tab
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

  // Get the tab ID from the request
  const tabId = req.query.tabId || req.body.tabId;
  
  if (!tabId) {
    return res.status(400).json({
      error: "Missing tab ID",
      message: "Please provide a tab ID to activate",
    });
  }

  // Send command to browser extension
  const commandSent = sendCommandToExtension("activateBrowserTab", { tabId: Number(tabId) });

  if (!commandSent) {
    return res.status(503).json({
      error: "Failed to send command to browser extension",
      message: "The browser extension is connected but not in a ready state",
    });
  }

  // Return success response
  res.json({
    success: true,
    message: `Command sent to activate tab ${tabId}`,
  });
}
