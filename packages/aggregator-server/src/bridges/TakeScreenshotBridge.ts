/**
 * Take Screenshot Bridge
 * Bridge for handling screenshot capture requests
 */
import { Response } from "express";
import { Bridge } from "./Bridge";
import { processScreenshot } from "../utils/imageProcessing";
import { ScreenshotMessage, CaptureScreenshotResponse } from "@summer-mcp/core";

/**
 * Convert ScreenshotMessage to CaptureScreenshotResponse
 * @param message Screenshot message from WebSocket
 * @returns Promise resolving to CaptureScreenshotResponse for HTTP response
 */
async function convertScreenshotMessageToResponse(message: ScreenshotMessage): Promise<CaptureScreenshotResponse> {
  if (!message || !message.data) {
    throw new Error("Screenshot data is undefined or empty");
  }
  
  return await processScreenshot(message.data);
}

/**
 * Bridge for screenshot capture requests
 */
export class TakeScreenshotBridge extends Bridge<ScreenshotMessage, CaptureScreenshotResponse> {
  constructor() {
    super("Timeout waiting for screenshot data", convertScreenshotMessageToResponse);
  }
}

// Create singleton instance
export const takeScreenshotBridge = new TakeScreenshotBridge();

/**
 * Register a new screenshot request
 * @param res Express response object
 * @param timeoutMs Timeout in milliseconds
 * @returns Request ID
 */
export function registerScreenshotRequest(res: Response, timeoutMs = 5000): string {
  return takeScreenshotBridge.registerRequest(res, timeoutMs);
}

/**
 * Handle screenshot response from websocket
 * @param message Screenshot message from the browser extension
 */
export async function handleScreenshotResponse(message: ScreenshotMessage): Promise<void> {
  await takeScreenshotBridge.resolveRequests(message);
} 