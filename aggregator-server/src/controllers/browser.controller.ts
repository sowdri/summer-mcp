/**
 * Browser controller
 */
import { Request, Response } from "express";
import { clearAllLogs } from "../models/browserData.js";
import {
  pendingTabRequests,
  registerTabsRequest,
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
