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
import { ServerCommandType, TakeScreenshotCommand } from "@summer-mcp/core";

/**
 * Capture screenshot of the current tab
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

  // Create the command object
  const command: TakeScreenshotCommand = {
    type: 'command',
    command: ServerCommandType.TAKE_SCREENSHOT
  };

  // Send command to browser extension
  const commandSent = sendCommandToExtension(command);

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

  // The response will be sent by the screenshot service when the data is received
}

/**
 * Get the currently selected element
 */
export function getSelectedElement(req: Request, res: Response): void {
  // Check if a specific tab ID is requested
  const tabId = req.query.tabId as string;

  if (tabId) {
    // Return selected element for the specific tab
    const tabData = browserData.tabs[tabId];
    if (tabData) {
      res.json(tabData.selectedElement || null);
    } else {
      res.status(404).json({
        error: "Tab not found",
        message: `No data found for tab ID: ${tabId}`,
      });
    }
  } else {
    // Return selected element for all tabs
    const allElements: Record<string, any> = {};
    Object.keys(browserData.tabs).forEach((id) => {
      allElements[id] = browserData.tabs[id].selectedElement || null;
    });
    res.json(allElements);
  }
}
