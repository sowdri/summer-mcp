/**
 * Handler for taking a screenshot
 */
import { Request, Response } from "express";
import {
  takeScreenshotBridge,
  registerScreenshotRequest,
} from "../../bridges/TakeScreenshotBridge";
import { clients, sendCommandToExtension } from "../../websocket/messageSender";
import { 
  ServerCommandType, 
  TakeScreenshotCommand,
  TakeScreenshotRequest,
  TakeScreenshotResponse,
  TakeScreenshotErrorResponse
} from "@summer-mcp/core";

/**
 * Take screenshot of the current tab
 * 
 * Implements the POST /take-screenshot endpoint
 */
export function takeScreenshot(
  req: Request<{}, TakeScreenshotResponse | TakeScreenshotErrorResponse, TakeScreenshotRequest>,
  res: Response
): Response | void {
  // Check if there are any connected WebSocket clients
  if (clients.size === 0) {
    // No browser extensions connected, return an error
    const errorResponse: TakeScreenshotErrorResponse = {
      error: "No browser extension connected",
      message: "Please ensure the browser extension is installed and connected",
    };
    return res.status(503).json(errorResponse);
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

    const errorResponse: TakeScreenshotErrorResponse = {
      error: "Failed to send command to browser extension",
      message: "The browser extension is connected but not in a ready state",
    };
    return res.status(503).json(errorResponse);
  }

  // The response will be sent by the screenshot service when the data is received
} 