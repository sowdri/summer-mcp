/**
 * Handler for capturing a screenshot
 */
import { Request, Response } from "express";
import {
  takeScreenshotBridge,
  registerScreenshotRequest,
} from "../../bridges/TakeScreenshotBridge";
import { clients, sendCommandToExtension } from "../../websocket/messageSender";
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
    const pendingRequest = takeScreenshotBridge.pendingRequests.get(requestId);
    if (pendingRequest) {
      clearTimeout(pendingRequest.timeout);
      takeScreenshotBridge.pendingRequests.delete(requestId);
    }

    return res.status(503).json({
      error: "Failed to send command to browser extension",
      message: "The browser extension is connected but not in a ready state",
    });
  }

  // The response will be sent by the screenshot service when the data is received
} 