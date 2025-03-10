/**
 * Take Screenshot Bridge
 * Bridge for handling screenshot capture requests
 */
import { Response } from "express";
import { Bridge } from "./Bridge";
import { processScreenshot } from "../utils/imageProcessing";
import { ScreenshotMessage } from "@summer-mcp/core";

/**
 * Bridge for screenshot capture requests
 */
export class TakeScreenshotBridge extends Bridge<ScreenshotMessage> {
  constructor() {
    super("Timeout waiting for screenshot data");
  }

  /**
   * Handle screenshot response from websocket
   * Overrides the base resolveRequests method to add image processing
   * @param message Screenshot message from the browser extension
   */
  async resolveScreenshotRequests(message: ScreenshotMessage): Promise<void> {
    // Check if there are any pending requests
    if (this.pendingRequests.size === 0) {
      console.warn("Received screenshot data but no pending requests found");
      return;
    }

    try {
      // Process the screenshot once outside the loop
      if (!message || !message.data) {
        console.error("Screenshot data is undefined or empty");
        // Resolve all pending requests with an error
        for (const [requestId, { res, timeout }] of this.pendingRequests.entries()) {
          clearTimeout(timeout);
          res.status(500).json({ error: "Screenshot data is undefined or empty" });
          this.pendingRequests.delete(requestId);
        }
        return;
      }

      // Process the screenshot data once for all requests
      const processedData = await processScreenshot(message.data);

      // Resolve all pending requests with the same processed data
      for (const [requestId, { res, timeout }] of this.pendingRequests.entries()) {
        // Clear the timeout
        clearTimeout(timeout);
        
        // Send the response
        res.json(processedData);
        
        // Remove from pending requests
        this.pendingRequests.delete(requestId);
      }
    } catch (error) {
      console.error("Error processing screenshot data:", error);
      
      // Resolve all pending requests with an error
      for (const [requestId, { res, timeout }] of this.pendingRequests.entries()) {
        clearTimeout(timeout);
        res.status(500).json({ error: "Error processing screenshot data" });
        this.pendingRequests.delete(requestId);
      }
    }
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
  await takeScreenshotBridge.resolveScreenshotRequests(message);
} 