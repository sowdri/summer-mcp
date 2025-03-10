/**
 * DOM controller
 */
import { Request, Response } from "express";
import { browserData } from "../models/browserData.js";
import {
  pendingScreenshotRequests,
  registerScreenshotRequest,
} from "../services/screenshot.service.js";
import { clients, sendCommandToExtension } from "../websocket/commands.js";

/**
 * Capture screenshot
 */
export function captureScreenshot(
  req: Request,
  res: Response
): Response | void {
  // Check if there are any connected WebSocket clients
  if (clients.size === 0) {
    // No browser extensions connected, return an error
    return res.status(503).json({
      error: "No browser extension connected",
      message: "Please ensure the browser extension is installed and connected",
    });
  }

  // Register the request with the screenshot service
  const requestId = registerScreenshotRequest(res);

  // Send command to browser extension
  const commandSent = sendCommandToExtension("takeScreenshot");

  // If command wasn't sent successfully, clean up and return error
  if (!commandSent) {
    // Clean up the pending request
    const pendingRequest = pendingScreenshotRequests.get(requestId);
    if (pendingRequest) {
      clearTimeout(pendingRequest.timeout);
      pendingScreenshotRequests.delete(requestId);
    }

    return res.status(503).json({
      error: "Failed to send command to browser extension",
      message: "The browser extension is connected but not in a ready state",
    });
  }
}

/**
 * Get selected element
 */
export function getSelectedElement(req: Request, res: Response): void {
  // Get the selected element from the default tab
  const defaultTabId = "default";
  const selectedElement = browserData.tabs[defaultTabId]?.selectedElement;

  if (selectedElement) {
    res.json(selectedElement);
  } else {
    res.status(404).json({ error: "No element currently selected" });
  }
}
